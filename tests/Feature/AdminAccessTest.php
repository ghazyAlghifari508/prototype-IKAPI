<?php

use App\Filament\Auth\Login;
use App\Models\User;
use Filament\Facades\Filament;
use Filament\Panel;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Livewire\Livewire;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

beforeEach(function () {
    Cache::flush();
    Filament::setCurrentPanel(Filament::getPanel('admin'));
    Filament::bootCurrentPanel();
});

test('guests can open the branded administrator login', function () {
    $this->get('/admin/login')->assertOk()
        ->assertSee('IKAPI Jawa Barat')
        ->assertSee('Masuk Administrator')
        ->assertSee('Kata Sandi');
});

test('verified administrator can sign in and logout invalidates the session', function () {
    $user = User::factory()->create();
    $user->givePermissionTo(Permission::findOrCreate('access-admin-panel', 'web'));
    $oldSession = session()->getId();

    Livewire::test(Login::class)
        ->fillForm(['email' => $user->email, 'password' => 'password', 'remember' => false])
        ->call('authenticate')
        ->assertHasNoFormErrors()
        ->assertRedirect('/admin');

    $this->assertAuthenticatedAs($user, 'web');
    expect(session()->getId())->not->toBe($oldSession);
    $this->get('/admin')->assertOk();
    $sessionBeforeLogout = session()->getId();
    $csrfBeforeLogout = session()->token();
    $this->post('/admin/logout')->assertRedirect('/admin/login');
    $this->assertGuest('web');
    expect(session()->getId())->not->toBe($sessionBeforeLogout);
    expect(session()->token())->not->toBe($csrfBeforeLogout);
    $this->get('/admin')->assertRedirect('/admin/login');
});

test('invalid credentials give the same generic error and clear only the password', function (bool $knownEmail) {
    $user = User::factory()->create();
    $user->givePermissionTo(Permission::findOrCreate('access-admin-panel', 'web'));
    $email = $knownEmail ? $user->email : 'unknown@example.test';

    Livewire::test(Login::class)
        ->fillForm(['email' => $email, 'password' => 'incorrect-password'])
        ->call('authenticate')
        ->assertHasFormErrors(['email'])
        ->assertSee('Email atau kata sandi salah, atau Anda tidak memiliki akses administrator.')
        ->assertSet('data.password', '')
        ->assertSet('data.email', $email)
        ->assertNoRedirect();

    $this->assertGuest('web');
})->with([true, false]);

test('administrator login validates required fields and email format', function (string $email, string $password, array $errors) {
    Livewire::test(Login::class)
        ->fillForm(['email' => $email, 'password' => $password])
        ->call('authenticate')
        ->assertHasFormErrors($errors)
        ->assertSet('data.password', '');

    $this->assertGuest('web');
})->with([
    ['', 'password', ['email' => 'required']],
    ['person@example.test', '', ['password' => 'required']],
    ['invalid-email', 'password', ['email' => 'email']],
]);

test('buyer and publisher credentials cannot create an administrator session', function (string $role) {
    $user = User::factory()->create();
    $user->assignRole(Role::findOrCreate($role, 'web'));

    Livewire::test(Login::class)
        ->fillForm(['email' => $user->email, 'password' => 'password'])
        ->call('authenticate')
        ->assertHasFormErrors(['email'])
        ->assertSet('data.password', '')
        ->assertNoRedirect();

    $this->assertGuest('web');
    $this->actingAs($user)->get('/admin')->assertForbidden();
    expect($user->fresh()->checkPermissionTo('access-admin-panel'))->toBeFalse();
})->with(['buyer', 'publisher']);

test('unverified administrator cannot sign in or verify themselves through login', function () {
    $user = User::factory()->unverified()->create();
    $user->givePermissionTo(Permission::findOrCreate('access-admin-panel', 'web'));

    Livewire::test(Login::class)
        ->fillForm(['email' => $user->email, 'password' => 'password'])
        ->call('authenticate')
        ->assertHasFormErrors(['email'])
        ->assertSet('data.password', '');

    $this->assertGuest('web');
    expect($user->fresh()->hasVerifiedEmail())->toBeFalse();
});

test('administrator login throttles further attempts including valid credentials', function () {
    $user = User::factory()->create();
    $user->givePermissionTo(Permission::findOrCreate('access-admin-panel', 'web'));

    for ($attempt = 0; $attempt < 5; $attempt++) {
        Livewire::test(Login::class)
            ->fillForm(['email' => $user->email, 'password' => 'wrong-password'])
            ->call('authenticate')
            ->assertHasFormErrors(['email']);
    }

    Livewire::test(Login::class)
        ->fillForm(['email' => $user->email, 'password' => 'password'])
        ->call('authenticate')
        ->assertNotified('Terlalu banyak percobaan masuk')
        ->assertSet('data.password', '')
        ->assertNoRedirect();

    $this->assertGuest('web');
    $this->travel(61)->seconds();

    Livewire::test(Login::class)
        ->fillForm(['email' => $user->email, 'password' => 'password'])
        ->call('authenticate')
        ->assertHasNoFormErrors()
        ->assertRedirect('/admin');
});

test('seeding registers admin permission idempotently without granting it to any account', function () {
    $this->seed();
    $this->seed();

    expect(Permission::where('name', 'access-admin-panel')->where('guard_name', 'web')->count())->toBe(1);
    expect(User::permission('access-admin-panel')->count())->toBe(0);
    expect(Role::findByName('buyer', 'web')->hasPermissionTo('access-admin-panel'))->toBeFalse();
    expect(Role::findByName('publisher', 'web')->hasPermissionTo('access-admin-panel'))->toBeFalse();
});

test('guests cannot open the admin panel', function () {
    $this->get('/admin')->assertRedirect('/admin/login');
});

test('admin access requires an explicit grant and respects revocation even locally', function () {
    config(['app.env' => 'local']);
    $user = User::factory()->create();

    $this->actingAs($user)->get('/admin')->assertForbidden();

    $permission = Permission::create(['name' => 'access-admin-panel', 'guard_name' => 'web']);
    $user->givePermissionTo($permission);
    $this->get('/admin')->assertOk();

    $user->revokePermissionTo($permission);
    $this->get('/admin')->assertForbidden();
});

test('an admin grant does not bypass email verification or authorize a different panel', function () {
    $permission = Permission::create(['name' => 'access-admin-panel', 'guard_name' => 'web']);
    $user = User::factory()->unverified()->create();
    $user->givePermissionTo($permission);

    $this->actingAs($user)->get('/admin')->assertForbidden();

    $user->markEmailAsVerified();
    expect($user->canAccessPanel(Panel::make()->id('unregistered')))->toBeFalse();
});
