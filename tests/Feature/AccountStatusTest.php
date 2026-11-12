<?php

use App\Actions\Accounts\ChangeAccountStatus;
use App\Actions\Publishers\ReviewPublisherRegistration;
use App\Filament\Resources\Users\Pages\ListUsers;
use App\Filament\Resources\Users\Pages\ViewUser;
use App\Filament\Resources\Users\UserResource;
use App\Models\PublisherRegistrationReview;
use App\Models\User;
use App\Notifications\AccountStatusChanged;
use Filament\Facades\Filament;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use Illuminate\Validation\ValidationException;
use Livewire\Livewire;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

function accountManager(): User
{
    $user = User::factory()->create();
    $user->givePermissionTo([
        Permission::findOrCreate('access-admin-panel', 'web'),
        Permission::findOrCreate('manage-user-accounts', 'web'),
    ]);

    return $user;
}

function managedAccount(string $role = 'buyer', ?string $approval = null): User
{
    $user = User::factory()->create(['address' => 'Bandung']);
    $user->assignRole(Role::findOrCreate($role, 'web'));
    if ($role === 'publisher') {
        $user->publisherRegistration()->create([
            'publisher_name' => 'Penerbit Bandung', 'responsible_person' => 'Rina',
            'phone' => '+6281234567890', 'address' => 'Bandung', 'ikapi_member_number' => 'IKAPI-1',
            'approval_status' => $approval ?? 'approved',
        ]);
    }

    return $user;
}

beforeEach(function () {
    Filament::setCurrentPanel(Filament::getPanel('admin'));
    Filament::bootCurrentPanel();
});

test('manager can search filter users and inspect audit without exposing credentials', function () {
    $buyer = managedAccount();
    $publisher = managedAccount('publisher');
    $publisher->forceFill(['account_status' => 'suspended'])->save();
    $this->actingAs(accountManager());
    $this->get(UserResource::getUrl())->assertOk();
    Livewire::test(ListUsers::class)
        ->assertCanSeeTableRecords([$buyer, $publisher])
        ->filterTable('account_status', 'suspended')
        ->assertCanSeeTableRecords([$publisher])->assertCanNotSeeTableRecords([$buyer])
        ->filterTable('account_status', null)
        ->filterTable('role', Role::findByName('buyer', 'web')->id)
        ->assertCanSeeTableRecords([$buyer])->assertCanNotSeeTableRecords([$publisher])
        ->filterTable('role', null)->searchTable($publisher->email)
        ->assertCanSeeTableRecords([$publisher])->assertCanNotSeeTableRecords([$buyer]);
    $this->get(UserResource::getUrl('view', ['record' => $publisher]))
        ->assertOk()->assertSee('Nonaktif')->assertDontSee($publisher->password);
});

test('guest and actors without management permission cannot access user management', function () {
    $this->get(UserResource::getUrl())->assertRedirect('/admin/login');
    $target = managedAccount();
    foreach ([managedAccount(), managedAccount('publisher'), User::factory()->create()] as $actor) {
        $actor->givePermissionTo(Permission::findOrCreate('access-admin-panel', 'web'));
        $this->actingAs($actor)->get(UserResource::getUrl())->assertForbidden();
        expect(fn () => app(ChangeAccountStatus::class)->handle($actor, $target->id, 'suspended', 0, 'Pelanggaran'))
            ->toThrow(AuthorizationException::class);
    }
});

test('suspend and reactivate preserve identity roles approval and create audited notifications', function (string $role) {
    Notification::fake();
    $actor = accountManager();
    $target = managedAccount($role);
    $password = $target->password;
    $this->actingAs($actor);
    Livewire::test(ViewUser::class, ['record' => $target->id])
        ->callAction('suspend', data: ['reason' => 'Pelanggaran ketentuan.'])
        ->assertHasNoActionErrors()->assertNotified('Status akun berhasil diperbarui');
    expect($target->fresh()->isActive())->toBeFalse();
    expect($target->fresh()->account_version)->toBe(1);
    $this->assertDatabaseHas('publisher_registration_reviews', [
        'target_user_id' => $target->id, 'actor_id' => $actor->id,
        'action' => 'suspension', 'previous_status' => 'active', 'new_status' => 'suspended',
        'reason' => 'Pelanggaran ketentuan.',
    ]);
    Livewire::test(ViewUser::class, ['record' => $target->id])
        ->callAction('reactivate')->assertHasNoActionErrors();
    $fresh = $target->fresh();
    expect($fresh->isActive())->toBeTrue();
    expect($fresh->account_version)->toBe(2);
    expect($fresh->hasRole($role))->toBeTrue();
    expect($fresh->password)->toBe($password);
    expect($fresh->address)->toBe('Bandung');
    if ($role === 'publisher') {
        expect($fresh->publisherRegistration->approval_status)->toBe('approved');
    }
    expect(PublisherRegistrationReview::where('target_user_id', $target->id)->count())->toBe(2);
    Notification::assertSentToTimes($target, AccountStatusChanged::class, 2);
})->with(['buyer', 'publisher']);

test('suspension reason is required in form and service', function () {
    $actor = accountManager();
    $target = managedAccount();
    $this->actingAs($actor);
    Livewire::test(ViewUser::class, ['record' => $target->id])
        ->callAction('suspend', data: ['reason' => ''])->assertHasActionErrors(['reason' => 'required']);
    expect(fn () => app(ChangeAccountStatus::class)->handle($actor, $target->id, 'suspended', 0, '   '))
        ->toThrow(ValidationException::class);
    expect($target->fresh()->isActive())->toBeTrue();
});

test('administrators self and system accounts cannot be suspended', function (string $kind) {
    $actor = accountManager();
    $target = $kind === 'self' ? $actor : managedAccount();
    if ($kind === 'admin-permission') {
        $target->givePermissionTo(Permission::findOrCreate('access-admin-panel', 'web'));
    }
    if (in_array($kind, ['admin-role', 'system-role'])) {
        $target->assignRole(Role::findOrCreate($kind === 'admin-role' ? 'admin' : 'service', 'web'));
    }
    expect(fn () => app(ChangeAccountStatus::class)->handle($actor, $target->id, 'suspended', 0, 'Pelanggaran'))
        ->toThrow(AuthorizationException::class);
    expect($target->fresh()->isActive())->toBeTrue();
})->with(['self', 'admin-permission', 'admin-role', 'system-role']);

test('repeated actions and stale versions never create duplicate audit or notifications', function () {
    Notification::fake();
    $actor = accountManager();
    $target = managedAccount();
    $action = app(ChangeAccountStatus::class);
    $action->handle($actor, $target->id, 'suspended', 0, 'Pelanggaran');
    expect(fn () => $action->handle($actor, $target->id, 'suspended', 0, 'Pelanggaran'))->toThrow(ValidationException::class);
    $action->handle($actor, $target->id, 'active', 1);
    expect(fn () => $action->handle($actor, $target->id, 'suspended', 0, 'Halaman lama'))->toThrow(ValidationException::class);
    expect(PublisherRegistrationReview::count())->toBe(2);
    Notification::assertSentToTimes($target, AccountStatusChanged::class, 2);
});

test('suspended user cannot create a fortify or publisher login session', function (string $role) {
    $target = managedAccount($role);
    $target->forceFill(['account_status' => 'suspended'])->save();
    $this->post(route('login.store'), ['email' => $target->email, 'password' => 'password'])
        ->assertSessionHasErrors('email');
    $this->assertGuest();
    if ($role === 'publisher') {
        $this->post(route('publisher.login.store'), ['email' => $target->email, 'password' => 'password'])
            ->assertSessionHasErrors('email');
        $this->assertGuest();
    }
})->with(['buyer', 'publisher']);

test('existing sessions lose protected access and do not loop while logout stays available', function (string $role) {
    $target = managedAccount($role);
    $this->actingAs($target);
    $destination = $role === 'publisher' ? route('publisher.dashboard') : route('dashboard');
    $this->get($destination)->assertOk();
    app(ChangeAccountStatus::class)->handle(accountManager(), $target->id, 'suspended', 0, 'Pelanggaran');
    $this->get($destination)->assertRedirect(route('login'));
    $this->assertGuest();
    $this->get(route('login'))->assertOk();
    $this->actingAs($target->fresh())->post(route('logout'))->assertRedirect();
    $this->assertGuest();
})->with(['buyer', 'publisher']);

test('reactivation allows new login without changing publisher approval', function (string $approval) {
    $target = managedAccount('publisher', $approval);
    $actor = accountManager();
    $action = app(ChangeAccountStatus::class);
    $action->handle($actor, $target->id, 'suspended', 0, 'Pelanggaran');
    $action->handle($actor, $target->id, 'active', 1);
    expect($target->fresh()->publisherRegistration->approval_status)->toBe($approval);
    $response = $this->post(route('publisher.login.store'), ['email' => $target->email, 'password' => 'password']);
    if ($approval === 'approved') {
        $response->assertRedirect(route('publisher.dashboard'));
        $this->get(route('publisher.dashboard'))->assertOk();
    } else {
        $response->assertSessionHasErrors('email');
        $this->assertGuest();
    }
})->with(['approved', 'pending', 'rejected']);

test('old file session does not become valid again after reactivation', function () {
    $target = managedAccount();
    $this->actingAs($target)->get(route('dashboard'))->assertOk();
    $actor = accountManager();
    app(ChangeAccountStatus::class)->handle($actor, $target->id, 'suspended', 0, 'Pelanggaran');
    app(ChangeAccountStatus::class)->handle($actor, $target->id, 'active', 1);
    $this->get(route('dashboard'))->assertRedirect(route('login'));
    $this->post(route('login.store'), ['email' => $target->email, 'password' => 'password'])->assertRedirect();
    $this->get(route('dashboard'))->assertOk();
});

test('queued notification and status roll back together before another connection can see the job', function () {
    $target = managedAccount();
    $actor = accountManager();
    config(['database.connections.account_observer' => config('database.connections.pgsql')]);
    DB::beginTransaction();
    try {
        app(ChangeAccountStatus::class)->handle($actor, $target->id, 'suspended', 0, 'Pelanggaran');
        expect(DB::table('jobs')->count())->toBe(1);
        expect(DB::connection('account_observer')->table('jobs')->count())->toBe(0);
    } finally {
        DB::rollBack();
        DB::disconnect('account_observer');
    }
    expect($target->fresh()->isActive())->toBeTrue();
    expect(PublisherRegistrationReview::count())->toBe(0);
    expect(DB::table('jobs')->count())->toBe(0);
});

test('enqueue failure leaves account and history unchanged', function () {
    $target = managedAccount();
    $actor = accountManager();
    DB::statement('ALTER TABLE jobs RENAME TO jobs_unavailable');
    try {
        expect(fn () => app(ChangeAccountStatus::class)->handle($actor, $target->id, 'suspended', 0, 'Pelanggaran'))
            ->toThrow(QueryException::class);
        expect($target->fresh()->isActive())->toBeTrue();
        expect(PublisherRegistrationReview::count())->toBe(0);
    } finally {
        DB::statement('ALTER TABLE jobs_unavailable RENAME TO jobs');
    }
});

test('database sessions and remember tokens are revoked without removing unrelated sessions', function () {
    $target = managedAccount();
    $oldToken = 'old-remember-token';
    $target->forceFill(['remember_token' => $oldToken])->save();
    $actor = accountManager();
    DB::table('sessions')->insert([
        ['id' => 'target-session', 'user_id' => $target->id, 'payload' => '', 'last_activity' => time()],
        ['id' => 'admin-session', 'user_id' => $actor->id, 'payload' => '', 'last_activity' => time()],
    ]);
    config(['session.driver' => 'database']);
    app(ChangeAccountStatus::class)->handle($actor, $target->id, 'suspended', 0, 'Pelanggaran');
    expect(DB::table('sessions')->where('user_id', $target->id)->exists())->toBeFalse();
    expect(DB::table('sessions')->where('user_id', $actor->id)->exists())->toBeTrue();
    expect($target->fresh()->remember_token)->not->toBe($oldToken);
    expect(auth()->getProvider()->retrieveByToken($target->id, $oldToken))->toBeNull();
});

test('suspended authenticated json requests receive forbidden instead of redirecting', function () {
    $target = managedAccount();
    $target->forceFill(['account_status' => 'suspended'])->save();
    $this->actingAs($target)->getJson('/settings/profile')->assertForbidden();
    $this->assertGuest();
});

test('public profile payload cannot reactivate an account or manipulate its session version', function () {
    $target = managedAccount();
    $this->actingAs($target)->patch(route('profile.update'), [
        'name' => $target->name, 'email' => $target->email,
        'account_status' => 'suspended', 'account_version' => 999,
    ])->assertSessionHasNoErrors();
    expect($target->fresh()->account_status)->toBe('active');
    expect($target->fresh()->account_version)->toBe(0);
});

test('revoked manager permission and inactive administrator are rejected at decision time', function () {
    $actor = accountManager();
    $target = managedAccount();
    expect($actor->checkPermissionTo('manage-user-accounts'))->toBeTrue();
    User::findOrFail($actor->id)->revokePermissionTo('manage-user-accounts');
    expect(fn () => app(ChangeAccountStatus::class)->handle($actor, $target->id, 'suspended', 0, 'Pelanggaran'))
        ->toThrow(AuthorizationException::class);
    $actor->givePermissionTo('manage-user-accounts');
    User::findOrFail($actor->id)->forceFill(['account_status' => 'suspended'])->save();
    expect(fn () => app(ChangeAccountStatus::class)->handle($actor, $target->id, 'suspended', 0, 'Pelanggaran'))
        ->toThrow(AuthorizationException::class);
});

test('approval of a suspended publisher does not restore account access', function () {
    Notification::fake();
    $target = managedAccount('publisher', 'pending');
    $actor = accountManager();
    $actor->givePermissionTo(Permission::findOrCreate('review-publisher-registrations', 'web'));
    app(ChangeAccountStatus::class)->handle($actor, $target->id, 'suspended', 0, 'Pelanggaran');
    app(ReviewPublisherRegistration::class)->handle($actor, $target->publisherRegistration->id, 'approved');
    expect($target->fresh()->publisherRegistration->approval_status)->toBe('approved');
    expect($target->fresh()->canAccessPublisherPortal())->toBeFalse();
    expect($target->fresh()->account_status)->toBe('suspended');
    expect(PublisherRegistrationReview::where('target_user_id', $target->id)->pluck('action')->all())
        ->toBe(['suspension', 'approval']);
});

test('upgrade preserves existing user access and backfills legacy publisher decision audits', function () {
    $target = managedAccount('publisher', 'rejected');
    $actor = accountManager();
    $registrationId = $target->publisherRegistration->id;
    $migration = require database_path('migrations/2026_11_12_000001_add_account_status_and_extend_admin_audit.php');
    $migration->down();
    DB::table('publisher_registration_reviews')->insert([
        'publisher_registration_id' => $registrationId, 'actor_id' => $actor->id,
        'previous_status' => 'pending', 'new_status' => 'rejected', 'rejection_reason' => 'Dokumen tidak sesuai.',
        'created_at' => now(),
    ]);
    $migration->up();
    expect($target->fresh()->isActive())->toBeTrue();
    expect($target->fresh()->account_version)->toBe(0);
    $this->assertDatabaseHas('publisher_registration_reviews', [
        'publisher_registration_id' => $registrationId, 'target_user_id' => $target->id,
        'actor_id' => $actor->id, 'action' => 'rejection', 'reason' => 'Dokumen tidak sesuai.',
    ]);
    expect($target->fresh()->publisherRegistration->approval_status)->toBe('rejected');
});
