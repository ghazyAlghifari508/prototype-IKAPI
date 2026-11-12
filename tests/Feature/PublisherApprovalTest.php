<?php

use App\Actions\Publishers\ReviewPublisherRegistration;
use App\Filament\Resources\PublisherRegistrations\Pages\ListPublisherRegistrations;
use App\Filament\Resources\PublisherRegistrations\Pages\ViewPublisherRegistration;
use App\Filament\Resources\PublisherRegistrations\PublisherRegistrationResource;
use App\Models\PublisherRegistration;
use App\Models\PublisherRegistrationReview;
use App\Models\User;
use App\Notifications\PublisherRegistrationDecided;
use Filament\Facades\Filament;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Livewire\Livewire;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

function publisherReviewer(): User
{
    $admin = User::factory()->create();
    $admin->givePermissionTo([
        Permission::findOrCreate('access-admin-panel', 'web'),
        Permission::findOrCreate('review-publisher-registrations', 'web'),
    ]);

    return $admin;
}

function pendingPublisherRegistration(string $name = 'Penerbit Bandung'): PublisherRegistration
{
    $publisher = User::factory()->create();
    $publisher->assignRole(Role::findOrCreate('publisher', 'web'));

    return $publisher->publisherRegistration()->create([
        'publisher_name' => $name,
        'responsible_person' => 'Rina',
        'phone' => '+6281234567890',
        'address' => 'Bandung',
        'ikapi_member_number' => 'IKAPI-123',
        'legal_number' => 'AHU-123',
    ]);
}

beforeEach(function () {
    Filament::setCurrentPanel(Filament::getPanel('admin'));
    Filament::bootCurrentPanel();
});

test('reviewer can list search filter and inspect real publisher registrations', function () {
    $admin = publisherReviewer();
    $pending = pendingPublisherRegistration('Penerbit Bandung');
    $other = pendingPublisherRegistration('Penerbit Jakarta');
    $other->update(['approval_status' => 'approved']);
    $this->actingAs($admin);

    $this->get(PublisherRegistrationResource::getUrl())->assertOk();
    Livewire::test(ListPublisherRegistrations::class)
        ->assertCanSeeTableRecords([$pending])
        ->assertCanNotSeeTableRecords([$other])
        ->filterTable('approval_status', 'approved')
        ->assertCanSeeTableRecords([$other])
        ->assertCanNotSeeTableRecords([$pending])
        ->filterTable('approval_status', null)
        ->searchTable('Bandung')
        ->assertCanSeeTableRecords([$pending])
        ->assertCanNotSeeTableRecords([$other]);

    $this->get(PublisherRegistrationResource::getUrl('view', ['record' => $pending]))
        ->assertOk()->assertSee('AHU-123')->assertSee($pending->user->email);
});

test('guest cannot open approval resource or private documents', function () {
    $registration = pendingPublisherRegistration();
    $this->get(PublisherRegistrationResource::getUrl())->assertRedirect('/admin/login');
    $this->get(route('admin.publisher-registration.document', $registration))->assertRedirect();
});

test('non reviewers cannot list review or download publisher identities', function (string $kind) {
    $registration = pendingPublisherRegistration();
    $user = User::factory()->create();
    if ($kind === 'panel-only') {
        $user->givePermissionTo(Permission::findOrCreate('access-admin-panel', 'web'));
    } else {
        $user->assignRole(Role::findOrCreate($kind, 'web'));
    }
    $this->actingAs($user);
    $this->get(PublisherRegistrationResource::getUrl())->assertForbidden();
    $this->get(PublisherRegistrationResource::getUrl('view', ['record' => $registration]))->assertForbidden();
    $this->get(route('admin.publisher-registration.document', $registration))->assertForbidden();
    expect(fn () => app(ReviewPublisherRegistration::class)->handle($user, $registration->id, 'approved'))
        ->toThrow(AuthorizationException::class);
    expect($registration->fresh()->approval_status)->toBe('pending');
})->with(['buyer', 'publisher', 'panel-only']);

test('approval action saves one audit queues one email and enables existing publisher login', function () {
    Notification::fake();
    $admin = publisherReviewer();
    $registration = pendingPublisherRegistration();
    $publisher = $registration->user;
    $this->actingAs($admin);

    Livewire::test(ViewPublisherRegistration::class, ['record' => $registration->id])
        ->callAction('approve')->assertHasNoActionErrors()->assertNotified('Keputusan pendaftaran berhasil disimpan');

    $this->assertDatabaseHas('publisher_registrations', ['id' => $registration->id, 'approval_status' => 'approved']);
    $this->assertDatabaseHas('publisher_registration_reviews', [
        'publisher_registration_id' => $registration->id,
        'actor_id' => $admin->id,
        'previous_status' => 'pending',
        'new_status' => 'approved',
        'rejection_reason' => null,
    ]);
    Notification::assertSentTo($publisher, PublisherRegistrationDecided::class, fn ($notification) => $notification->status === 'approved');
    expect($publisher->fresh()->canAccessPublisherPortal())->toBeTrue();
    expect($publisher->fresh()->checkPermissionTo('access-admin-panel'))->toBeFalse();

    $this->post('/admin/logout');
    $this->post(route('publisher.login.store'), ['email' => $publisher->email, 'password' => 'password'])
        ->assertRedirect(route('publisher.dashboard'));
    $this->get(route('publisher.dashboard'))->assertOk();
});

test('rejection requires a reason and preserves the publisher identity', function () {
    Notification::fake();
    $registration = pendingPublisherRegistration();
    $this->actingAs(publisherReviewer());

    Livewire::test(ViewPublisherRegistration::class, ['record' => $registration->id])
        ->callAction('reject', data: ['reason' => ''])
        ->assertHasActionErrors(['reason' => 'required']);
    expect($registration->fresh()->approval_status)->toBe('pending');
    Notification::assertNothingSent();

    Livewire::test(ViewPublisherRegistration::class, ['record' => $registration->id])
        ->callAction('reject', data: ['reason' => 'Nomor legalitas tidak sesuai.'])
        ->assertHasNoActionErrors();

    expect($registration->fresh()->rejection_reason)->toBe('Nomor legalitas tidak sesuai.');
    expect($registration->fresh()->approval_status)->toBe('rejected');
    expect($registration->user->fresh()->canAccessPublisherPortal())->toBeFalse();
    Notification::assertSentTo($registration->user, PublisherRegistrationDecided::class,
        fn ($notification) => $notification->reason === 'Nomor legalitas tidak sesuai.');
    $this->assertDatabaseHas('users', ['id' => $registration->user_id]);
    $this->post('/admin/logout');
    $this->post(route('publisher.login.store'), ['email' => $registration->user->email, 'password' => 'password'])
        ->assertSessionHasErrors('email');
    $this->assertGuest();
});

test('repeated or conflicting decisions cannot produce another audit or notification', function (string $first, string $second) {
    Notification::fake();
    $registration = pendingPublisherRegistration();
    $actor = publisherReviewer();
    $action = app(ReviewPublisherRegistration::class);
    $action->handle($actor, $registration->id, $first, 'Dokumen tidak sesuai.');
    expect(fn () => $action->handle($actor, $registration->id, $second, 'Alasan lain.'))
        ->toThrow(ValidationException::class);
    expect($registration->fresh()->approval_status)->toBe($first);
    expect(PublisherRegistrationReview::count())->toBe(1);
    Notification::assertSentToTimes($registration->user, PublisherRegistrationDecided::class, 1);
})->with([['approved', 'approved'], ['approved', 'rejected'], ['rejected', 'approved'], ['rejected', 'rejected']]);

test('service rejects invalid decision payloads without changing status', function (string $status, ?string $reason) {
    Notification::fake();
    $registration = pendingPublisherRegistration();
    expect(fn () => app(ReviewPublisherRegistration::class)->handle(publisherReviewer(), $registration->id, $status, $reason))
        ->toThrow(ValidationException::class);
    expect($registration->fresh()->approval_status)->toBe('pending');
    expect(PublisherRegistrationReview::count())->toBe(0);
    Notification::assertNothingSent();
})->with([['rejected', null], ['rejected', '   '], ['rejected', str_repeat('a', 2001)], ['pending', null], ['suspended', null]]);

test('reviewer cannot approve their own registration even with both permissions', function () {
    Notification::fake();
    $registration = pendingPublisherRegistration();
    $actor = $registration->user;
    $actor->givePermissionTo([
        Permission::findOrCreate('access-admin-panel', 'web'),
        Permission::findOrCreate('review-publisher-registrations', 'web'),
    ]);
    expect(fn () => app(ReviewPublisherRegistration::class)->handle($actor, $registration->id, 'approved'))
        ->toThrow(AuthorizationException::class);
    Notification::assertNothingSent();
});

test('decision rechecks revoked permission instead of trusting an actor with cached relations', function () {
    $actor = publisherReviewer();
    $registration = pendingPublisherRegistration();
    expect($actor->checkPermissionTo('review-publisher-registrations'))->toBeTrue();
    User::findOrFail($actor->id)->revokePermissionTo('review-publisher-registrations');
    expect(fn () => app(ReviewPublisherRegistration::class)->handle($actor, $registration->id, 'approved'))
        ->toThrow(AuthorizationException::class);
});

test('private verification document requires review permission and is never exposed as a public URL', function () {
    Storage::fake('local');
    $registration = pendingPublisherRegistration();
    Storage::disk('local')->put('publisher-verifications/private.pdf', 'private document');
    $registration->update(['verification_document_path' => 'publisher-verifications/private.pdf']);
    $this->actingAs(publisherReviewer())
        ->get(route('admin.publisher-registration.document', $registration))
        ->assertOk()->assertDownload('private.pdf')->assertHeader('X-Content-Type-Options', 'nosniff');
});

test('database queue job and audit roll back together and workers cannot see uncommitted decisions', function () {
    $registration = pendingPublisherRegistration();
    $actor = publisherReviewer();
    $startingLevel = DB::transactionLevel();
    config(['database.connections.approval_observer' => config('database.connections.pgsql')]);
    try {
        DB::beginTransaction();
        app(ReviewPublisherRegistration::class)->handle($actor, $registration->id, 'approved');
        expect(DB::table('jobs')->count())->toBe(1);
        expect(DB::connection('approval_observer')->table('jobs')->count())->toBe(0);
        DB::rollBack();
        expect($registration->fresh()->approval_status)->toBe('pending');
        expect(PublisherRegistrationReview::count())->toBe(0);
        expect(DB::table('jobs')->count())->toBe(0);
    } finally {
        while (DB::transactionLevel() > $startingLevel) {
            DB::rollBack();
        }
        DB::disconnect('approval_observer');
    }
});

test('enqueue database failure rolls back status and audit', function () {
    $registration = pendingPublisherRegistration();
    $actor = publisherReviewer();
    DB::statement('ALTER TABLE jobs RENAME TO jobs_unavailable');
    try {
        expect(fn () => app(ReviewPublisherRegistration::class)->handle($actor, $registration->id, 'approved'))
            ->toThrow(QueryException::class);
        expect($registration->fresh()->approval_status)->toBe('pending');
        expect(PublisherRegistrationReview::count())->toBe(0);
    } finally {
        DB::statement('ALTER TABLE jobs_unavailable RENAME TO jobs');
    }
});

test('decision notifications contain only the relevant decision and use the configured application URL', function () {
    config(['app.url' => 'https://ikapi.example', 'mail.publisher_approval_mailer' => 'smtp']);
    $user = User::factory()->create();
    $approved = new PublisherRegistrationDecided('Penerbit Bandung', 'approved', null);
    $mail = $approved->toMail($user);
    expect($approved->connection)->toBe('database');
    expect($approved->afterCommit)->toBeFalse();
    expect($mail->actionUrl)->toBe('https://ikapi.example/publisher/login');
    expect($mail->mailer)->toBe('smtp');
    $rejected = (new PublisherRegistrationDecided('Penerbit Bandung', 'rejected', 'Dokumen tidak sesuai.'))->toMail($user);
    expect(implode(' ', $rejected->introLines))->toContain('Dokumen tidak sesuai.');
    expect($rejected->actionUrl)->toBeNull();
});
