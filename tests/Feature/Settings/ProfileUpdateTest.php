<?php

namespace Tests\Feature\Settings;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use RuntimeException;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class ProfileUpdateTest extends TestCase
{
    use RefreshDatabase;

    public function test_profile_page_is_displayed(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->get(route('profile.edit'));

        $response->assertOk();
    }

    public function test_profile_page_shares_the_safe_current_profile_contract(): void
    {
        Storage::fake('public');
        Storage::disk('public')->put('avatars/profile.png', 'avatar bytes');

        $user = User::factory()->create([
            'phone' => '+6281234567890',
            'address' => 'Bandung',
            'avatar_path' => 'avatars/profile.png',
        ]);

        $this->actingAs($user)
            ->get(route('profile.edit'))
            ->assertInertia(fn (Assert $page) => $page
                ->component('settings/profile')
                ->where('auth.user.id', $user->id)
                ->where('auth.user.name', $user->name)
                ->where('auth.user.email', $user->email)
                ->where('auth.user.phone', '+6281234567890')
                ->where('auth.user.address', 'Bandung')
                ->where('auth.user.avatar_url', Storage::disk('public')->url('avatars/profile.png'))
                ->missing('auth.user.password')
                ->missing('auth.user.two_factor_secret')
                ->missing('auth.user.two_factor_recovery_codes')
                ->missing('auth.user.remember_token'),
            );
    }

    public function test_guests_cannot_view_or_update_a_profile(): void
    {
        $this->get(route('profile.edit'))
            ->assertRedirect(route('login'));

        $this->patch(route('profile.update'), [
            'name' => 'Updated Name',
            'email' => 'updated@example.com',
        ])->assertRedirect(route('login'));
    }

    public function test_profile_information_can_be_updated(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->patch(route('profile.update'), [
                'name' => 'Test User',
                'email' => 'test@example.com',
            ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('profile.edit'));

        $user->refresh();

        $this->assertSame('Test User', $user->name);
        $this->assertSame('test@example.com', $user->email);
        $this->assertNull($user->email_verified_at);
    }

    public function test_email_verification_status_is_unchanged_when_the_email_address_is_unchanged(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->patch(route('profile.update'), [
                'name' => 'Test User',
                'email' => $user->email,
            ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('profile.edit'));

        $this->assertNotNull($user->refresh()->email_verified_at);
    }

    public function test_profile_address_can_be_updated(): void
    {
        $user = User::factory()->create([
            'address' => 'Jl. Lama No. 1',
        ]);

        $response = $this
            ->actingAs($user)
            ->from(route('profile.edit'))
            ->patch(route('profile.update'), [
                'name' => 'Test User',
                'email' => $user->email,
                'address' => 'Jl. Baru No. 25, Bandung',
            ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('profile.edit'));

        $this->assertSame('Jl. Baru No. 25, Bandung', $user->fresh()->address);
    }

    public function test_profile_address_longer_than_255_characters_can_be_saved(): void
    {
        $user = User::factory()->create();
        $address = rtrim(str_repeat('Alamat panjang ', 20));

        $this->actingAs($user)
            ->patch(route('profile.update'), [
                'name' => $user->name,
                'email' => $user->email,
                'address' => $address,
            ])
            ->assertSessionHasNoErrors();

        $this->assertSame($address, $user->fresh()->address);
    }

    public function test_profile_update_only_changes_the_authenticated_user(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create([
            'name' => 'Another User',
            'address' => 'Original address',
        ]);

        $this
            ->actingAs($user)
            ->patch(route('profile.update'), [
                'user_id' => $otherUser->id,
                'name' => 'Authenticated User',
                'email' => $user->email,
                'address' => 'Updated address',
            ])
            ->assertSessionHasNoErrors();

        $this->assertSame('Authenticated User', $user->fresh()->name);
        $this->assertSame('Original address', $otherUser->fresh()->address);
        $this->assertSame('Another User', $otherUser->fresh()->name);
    }

    public function test_profile_update_ignores_privileged_and_internal_fields(): void
    {
        $buyerRole = Role::create([
            'name' => 'buyer',
            'guard_name' => 'web',
        ]);
        $adminRole = Role::create([
            'name' => 'admin',
            'guard_name' => 'web',
        ]);
        $user = User::factory()->create();
        $user->assignRole($buyerRole);
        $originalPassword = $user->password;
        $verifiedAt = $user->email_verified_at;

        $this
            ->actingAs($user)
            ->patch(route('profile.update'), [
                'name' => 'Updated Buyer',
                'email' => $user->email,
                'role' => $adminRole->name,
                'roles' => [$adminRole->name],
                'email_verified_at' => null,
                'password' => 'attacker-controlled-password',
                'two_factor_secret' => 'attacker-controlled-secret',
                'avatar_path' => '../../another-users/avatar.png',
                'is_admin' => true,
            ])
            ->assertSessionHasNoErrors();

        $user->refresh();

        $this->assertSame('Updated Buyer', $user->name);
        $this->assertSame(['buyer'], $user->getRoleNames()->all());
        $this->assertSame($verifiedAt->toISOString(), $user->email_verified_at?->toISOString());
        $this->assertSame($originalPassword, $user->password);
        $this->assertNull($user->avatar_path);
        $this->assertFalse((bool) ($user->is_admin ?? false));
        $this->assertFalse(Hash::check('attacker-controlled-password', $user->password));
    }

    public function test_invalid_profile_data_does_not_change_saved_values(): void
    {
        $user = User::factory()->create([
            'name' => 'Saved Name',
            'address' => 'Saved address',
        ]);

        $this
            ->actingAs($user)
            ->from(route('profile.edit'))
            ->patch(route('profile.update'), [
                'name' => '',
                'email' => $user->email,
                'address' => str_repeat('a', 1001),
            ])
            ->assertSessionHasErrors(['name', 'address'])
            ->assertRedirect(route('profile.edit'));

        $this->assertSame('Saved Name', $user->fresh()->name);
        $this->assertSame('Saved address', $user->fresh()->address);
    }

    public function test_profile_avatar_can_be_uploaded(): void
    {
        Storage::fake('public');

        $user = User::factory()->create([
            'address' => 'Jl. Lama No. 1',
        ]);

        $response = $this
            ->actingAs($user)
            ->from(route('profile.edit'))
            ->patch(route('profile.update'), [
                'name' => 'Test User',
                'email' => $user->email,
                'address' => $user->address,
                'avatar' => UploadedFile::fake()->image('avatar.png', 200, 200),
            ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('profile.edit'));

        $user->refresh();

        $this->assertNotNull($user->avatar_path);
        Storage::disk('public')->assertExists($user->avatar_path);
    }

    public function test_profile_avatar_preset_is_saved_and_uploaded_avatar_clears_the_preset(): void
    {
        Storage::fake('public');

        $user = User::factory()->create();

        $this->actingAs($user)
            ->patch(route('profile.update'), [
                'name' => $user->name,
                'email' => $user->email,
                'avatar_preset' => 'cat',
            ])
            ->assertSessionHasNoErrors();

        $this->assertSame('cat', $user->fresh()->avatar_preset);
        $this->assertNull($user->avatar_path);

        $this->actingAs($user->fresh())
            ->patch(route('profile.update'), [
                'name' => $user->name,
                'email' => $user->email,
                'avatar' => UploadedFile::fake()->image('avatar.png'),
            ])
            ->assertSessionHasNoErrors();

        $this->assertNull($user->fresh()->avatar_preset);
        $this->assertNotNull($user->fresh()->avatar_path);
    }

    public function test_non_image_avatar_is_rejected_without_replacing_the_existing_avatar(): void
    {
        Storage::fake('public');
        Storage::disk('public')->put('avatars/original.jpg', 'existing avatar');

        $user = User::factory()->create([
            'avatar_path' => 'avatars/original.jpg',
        ]);

        $this
            ->actingAs($user)
            ->from(route('profile.edit'))
            ->patch(route('profile.update'), [
                'name' => $user->name,
                'email' => $user->email,
                'avatar' => UploadedFile::fake()->create('avatar.txt', 10, 'text/plain'),
            ])
            ->assertSessionHasErrors('avatar')
            ->assertRedirect(route('profile.edit'));

        Storage::disk('public')->assertExists('avatars/original.jpg');
        $this->assertSame('avatars/original.jpg', $user->fresh()->avatar_path);
    }

    public function test_avatar_above_the_upload_limit_is_rejected(): void
    {
        Storage::fake('public');

        $user = User::factory()->create();

        $this
            ->actingAs($user)
            ->from(route('profile.edit'))
            ->patch(route('profile.update'), [
                'name' => $user->name,
                'email' => $user->email,
                'avatar' => UploadedFile::fake()->image('large.png')->size(2049),
            ])
            ->assertSessionHasErrors('avatar')
            ->assertRedirect(route('profile.edit'));

        $this->assertNull($user->fresh()->avatar_path);
        $this->assertSame([], Storage::disk('public')->allFiles('avatars'));
    }

    public function test_replacing_an_avatar_stores_the_new_file_and_removes_the_old_one(): void
    {
        Storage::fake('public');
        Storage::disk('public')->put('avatars/original.jpg', 'existing avatar');

        $user = User::factory()->create([
            'avatar_path' => 'avatars/original.jpg',
        ]);

        $this
            ->actingAs($user)
            ->patch(route('profile.update'), [
                'name' => $user->name,
                'email' => $user->email,
                'avatar' => UploadedFile::fake()->image('replacement.webp'),
            ])
            ->assertSessionHasNoErrors();

        $user->refresh();

        $this->assertNotSame('avatars/original.jpg', $user->avatar_path);
        Storage::disk('public')->assertMissing('avatars/original.jpg');
        Storage::disk('public')->assertExists($user->avatar_path);
    }

    public function test_failed_profile_save_keeps_the_existing_avatar(): void
    {
        Storage::fake('public');
        Storage::disk('public')->put('avatars/original.jpg', 'existing avatar');

        $user = User::factory()->create([
            'avatar_path' => 'avatars/original.jpg',
        ]);

        User::saving(function (User $savingUser) use ($user): void {
            if ($savingUser->is($user)) {
                throw new RuntimeException('Simulated profile persistence failure.');
            }
        });

        $this->withoutExceptionHandling();

        try {
            $this
                ->actingAs($user)
                ->patch(route('profile.update'), [
                    'name' => 'Updated Name',
                    'email' => $user->email,
                    'avatar' => UploadedFile::fake()->image('replacement.jpg'),
                ]);

            $this->fail('The simulated persistence failure was not raised.');
        } catch (RuntimeException $exception) {
            $this->assertSame('Simulated profile persistence failure.', $exception->getMessage());
        }

        Storage::disk('public')->assertExists('avatars/original.jpg');
        $this->assertSame(['avatars/original.jpg'], Storage::disk('public')->allFiles('avatars'));
        $this->assertSame('avatars/original.jpg', $user->fresh()->avatar_path);
    }

    public function test_user_can_delete_their_account(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->delete(route('profile.destroy'), [
                'password' => 'password',
            ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('home'));

        $this->assertGuest();
        $this->assertNull($user->fresh());
    }

    public function test_correct_password_must_be_provided_to_delete_account(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->from(route('profile.edit'))
            ->delete(route('profile.destroy'), [
                'password' => 'wrong-password',
            ]);

        $response
            ->assertSessionHasErrors('password')
            ->assertRedirect(route('profile.edit'));

        $this->assertNotNull($user->fresh());
    }
}
