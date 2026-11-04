<?php

use App\Models\User;
use Filament\Panel;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;

uses(RefreshDatabase::class);

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
