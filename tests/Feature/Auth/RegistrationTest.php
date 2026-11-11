<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Fortify\Features;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->skipUnlessFortifyHas(Features::registration());
        Role::findOrCreate('buyer', 'web');
    }

    public function test_registration_screen_can_be_rendered()
    {
        $response = $this->get(route('register'));

        $response->assertOk();
    }

    public function test_database_seeder_provisions_the_buyer_role_idempotently(): void
    {
        $this->seed();
        $this->seed();

        $this->assertDatabaseCount('roles', 1);
        $this->assertDatabaseHas('roles', [
            'name' => 'buyer',
            'guard_name' => 'web',
        ]);
    }

    public function test_registration_fails_cleanly_when_the_required_role_is_not_provisioned(): void
    {
        Role::where('name', 'buyer')->where('guard_name', 'web')->delete();

        $response = $this->from(route('register'))->post(route('register.store'), [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'phone' => '081234567890',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $response->assertSessionHasErrors([
            'email' => 'Registrasi belum dapat dilakukan. Silakan hubungi administrator.',
        ]);
        $this->assertDatabaseMissing('users', ['email' => 'test@example.com']);
    }

    public function test_new_users_can_register()
    {
        $response = $this->post(route('register.store'), [
            'name' => 'Test User',
            'email' => ' Test@Example.com ',
            'phone' => '081234567890',
            'password' => 'password',
            'password_confirmation' => 'password',
            'role' => 'admin',
            'is_admin' => true,
            'permissions' => ['access-admin-panel'],
            'email_verified_at' => now()->toISOString(),
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('dashboard', absolute: false));

        $user = User::where('email', 'test@example.com')->firstOrFail();
        $this->assertSame('+6281234567890', $user->phone);
        $this->assertTrue(Hash::check('password', $user->password));
        $this->assertTrue($user->hasRole('buyer'));
        $this->assertFalse($user->hasRole('admin'));
        $this->assertCount(0, $user->getAllPermissions());
        $this->assertNull($user->email_verified_at);
    }

    public function test_registration_requires_a_valid_phone_number(): void
    {
        $response = $this->from(route('register'))->post(route('register.store'), [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'phone' => 'not a phone',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $response->assertRedirect(route('register'));
        $response->assertSessionHasErrors(['phone']);
        $this->assertDatabaseMissing('users', ['email' => 'test@example.com']);
    }

    public function test_registration_reports_a_mismatched_password_confirmation_on_its_field(): void
    {
        $response = $this->from(route('register'))->post(route('register.store'), [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'phone' => '081234567890',
            'password' => 'password',
            'password_confirmation' => 'different-password',
        ]);

        $response->assertSessionHasErrors([
            'password_confirmation' => 'Konfirmasi kata sandi tidak cocok.',
        ]);
        $this->assertDatabaseMissing('users', ['email' => 'test@example.com']);
    }

    public function test_registration_rejects_missing_or_invalid_required_fields(): void
    {
        $base = [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'phone' => '081234567890',
            'password' => 'password',
            'password_confirmation' => 'password',
        ];

        foreach ([
            'name' => ['name' => ''],
            'email' => ['email' => 'not-an-email'],
            'phone' => ['phone' => ''],
            'password' => ['password' => 'short', 'password_confirmation' => 'short'],
        ] as $field => $changes) {
            $response = $this->from(route('register'))->post(
                route('register.store'),
                [...$base, ...$changes],
            );

            $response->assertRedirect(route('register'));
            $response->assertSessionHasErrors($field === 'password'
                ? ['password' => 'Kata sandi minimal 8 karakter.']
                : [$field],
            );
        }

        $this->assertDatabaseCount('users', 0);
    }

    public function test_registration_rejects_an_existing_email_with_an_indonesian_error(): void
    {
        User::factory()->create(['email' => 'test@example.com']);

        $response = $this->from(route('register'))->post(route('register.store'), [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'phone' => '081234567890',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $response->assertSessionHasErrors(['email' => 'Email sudah terdaftar.']);
        $this->assertDatabaseCount('users', 1);
    }

    public function test_existing_users_remain_compatible_without_a_phone_number(): void
    {
        $user = User::factory()->create();

        $this->assertNull($user->phone);
        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'phone' => null,
        ]);
    }
}
