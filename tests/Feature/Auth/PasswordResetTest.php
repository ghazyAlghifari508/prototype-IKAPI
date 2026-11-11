<?php

namespace Tests\Feature\Auth;

use App\Jobs\SendPasswordResetLink;
use App\Models\User;
use App\Notifications\PasswordChangedNotification;
use App\Notifications\PasswordResetNotification;
use Illuminate\Contracts\Queue\ShouldBeEncrypted;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Queue;
use Laravel\Fortify\Features;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class PasswordResetTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->skipUnlessFortifyHas(Features::resetPasswords());
    }

    public function test_reset_password_link_screen_can_be_rendered(): void
    {
        $response = $this->get(route('password.request'));

        $response->assertOk();
    }

    public function test_reset_password_link_can_be_requested(): void
    {
        Notification::fake();

        $user = User::factory()->create();

        $this->post(route('password.email'), ['email' => $user->email]);

        Notification::assertSentTo($user, PasswordResetNotification::class);
    }

    public function test_reset_link_request_does_not_reveal_whether_the_email_exists(): void
    {
        Queue::fake();

        $user = User::factory()->create();

        $knownEmailResponse = $this->from(route('password.request'))
            ->post(route('password.email'), ['email' => $user->email]);

        $unknownEmailResponse = $this->from(route('password.request'))
            ->post(route('password.email'), ['email' => 'unknown@example.test']);

        $knownEmailResponse->assertSessionHas('status', 'Jika email terdaftar, tautan reset kata sandi akan dikirimkan.');
        $unknownEmailResponse->assertSessionHas('status', 'Jika email terdaftar, tautan reset kata sandi akan dikirimkan.');
        $unknownEmailResponse->assertSessionHasNoErrors();
        Queue::assertPushed(SendPasswordResetLink::class, 2);
        $this->assertDatabaseCount('password_reset_tokens', 0);
    }

    public function test_invalid_reset_email_is_rejected_without_queueing_a_job(): void
    {
        Queue::fake();

        $response = $this->from(route('password.request'))
            ->post(route('password.email'), ['email' => 'not-an-email']);

        $response->assertSessionHasErrors('email');

        $this->from(route('password.request'))
            ->post(route('password.email'), ['email' => ''])
            ->assertSessionHasErrors('email');

        $this->from(route('password.request'))
            ->post(route('password.email'), [
                'email' => str_repeat('a', 245).'@example.test',
            ])
            ->assertSessionHasErrors('email');

        Queue::assertNothingPushed();
    }

    public function test_reset_link_requests_are_limited_per_email_and_ip(): void
    {
        Queue::fake();

        $user = User::factory()->create();

        foreach (range(1, 3) as $_) {
            $this->from(route('password.request'))
                ->post(route('password.email'), ['email' => $user->email])
                ->assertRedirect(route('password.request'));
        }

        $limitedResponse = $this->from(route('password.request'))
            ->post(route('password.email'), ['email' => $user->email]);

        $limitedResponse
            ->assertStatus(429)
            ->assertSessionHas('status', 'Jika email terdaftar, tautan reset kata sandi akan dikirimkan.');

        Queue::assertPushed(SendPasswordResetLink::class, 3);
    }

    public function test_reset_link_requests_are_limited_by_ip_across_different_emails(): void
    {
        Queue::fake();

        foreach (range(1, 10) as $index) {
            $this->from(route('password.request'))
                ->post(route('password.email'), ['email' => "unknown-{$index}@example.test"])
                ->assertRedirect(route('password.request'));
        }

        $this->from(route('password.request'))
            ->post(route('password.email'), ['email' => 'eleventh@example.test'])
            ->assertStatus(429);

        Queue::assertPushed(SendPasswordResetLink::class, 10);
    }

    public function test_reset_form_submissions_are_limited_by_ip(): void
    {
        $user = User::factory()->create();

        foreach (range(1, 10) as $_) {
            $this->from(route('password.request'))
                ->post(route('password.update'), [
                    'token' => 'invalid-token',
                    'email' => $user->email,
                    'password' => 'NewPassword123!',
                    'password_confirmation' => 'NewPassword123!',
                ])
                ->assertSessionHasErrors('email');
        }

        $this->from(route('password.request'))
            ->post(route('password.update'), [
                'token' => 'invalid-token',
                'email' => $user->email,
                'password' => 'NewPassword123!',
                'password_confirmation' => 'NewPassword123!',
            ])
            ->assertStatus(429);
    }

    public function test_reset_password_screen_can_be_rendered(): void
    {
        Notification::fake();

        $user = User::factory()->create();

        $this->post(route('password.email'), ['email' => $user->email]);

        Notification::assertSentTo($user, PasswordResetNotification::class, function ($notification) {
            $response = $this->get(route('password.reset', $notification->token));

            $response->assertOk();

            return true;
        });
    }

    public function test_reset_link_page_prevents_referrer_and_browser_cache_leakage(): void
    {
        Notification::fake();

        $user = User::factory()->create();
        $this->post(route('password.email'), ['email' => $user->email]);

        Notification::assertSentTo($user, PasswordResetNotification::class, function ($notification) use ($user) {
            $response = $this->get(route('password.reset', [
                'token' => $notification->token,
                'email' => $user->email,
            ]));

            $response
                ->assertOk()
                ->assertHeader('Referrer-Policy', 'no-referrer')
                ->assertHeader('Cache-Control', 'no-store, private');

            return true;
        });
    }

    public function test_password_can_be_reset_with_valid_token_and_token_cannot_be_reused(): void
    {
        Notification::fake();

        $user = User::factory()->create();
        $newPassword = 'NewPassword123!';
        $resetToken = null;

        $this->post(route('password.email'), ['email' => $user->email]);

        Notification::assertSentTo($user, PasswordResetNotification::class, function ($notification) use ($user, $newPassword, &$resetToken) {
            $resetToken = $notification->token;

            $response = $this->post(route('password.update'), [
                'token' => $notification->token,
                'email' => $user->email,
                'password' => $newPassword,
                'password_confirmation' => $newPassword,
            ]);

            $response
                ->assertSessionHasNoErrors()
                ->assertRedirect(route('login'));

            return true;
        });

        $this->assertNotNull($resetToken);
        $this->assertTrue(Hash::check($newPassword, $user->fresh()->password));
        $this->assertGuest();
        Notification::assertSentTo($user, PasswordChangedNotification::class);

        $this->post(route('login.store'), [
            'email' => $user->email,
            'password' => $newPassword,
        ])->assertRedirect();

        $this->assertAuthenticatedAs($user);
        $this->post(route('logout'));

        $this->from(route('login'))
            ->post(route('login.store'), [
                'email' => $user->email,
                'password' => 'password',
            ])
            ->assertSessionHasErrors('email');

        $this->assertGuest();

        $this->from(route('password.reset', $resetToken))
            ->post(route('password.update'), [
                'token' => $resetToken,
                'email' => $user->email,
                'password' => 'AnotherPassword123!',
                'password_confirmation' => 'AnotherPassword123!',
            ])
            ->assertSessionHasErrors('email');

        $this->assertTrue(Hash::check($newPassword, $user->fresh()->password));
    }

    public function test_reset_token_cannot_be_used_with_a_different_users_email(): void
    {
        Notification::fake();

        $tokenOwner = User::factory()->create();
        $otherUser = User::factory()->create();
        $originalPassword = $otherUser->password;

        $this->post(route('password.email'), ['email' => $tokenOwner->email]);

        Notification::assertSentTo($tokenOwner, PasswordResetNotification::class, function ($notification) use ($otherUser) {
            $this->post(route('password.update'), [
                'token' => $notification->token,
                'email' => $otherUser->email,
                'password' => 'NewPassword123!',
                'password_confirmation' => 'NewPassword123!',
            ])->assertSessionHasErrors('email');

            return true;
        });

        $this->assertSame($originalPassword, $otherUser->fresh()->password);
    }

    public function test_expired_reset_token_is_rejected_without_changing_the_password(): void
    {
        Notification::fake();

        $user = User::factory()->create();
        $originalPassword = $user->password;
        $token = null;

        $this->post(route('password.email'), ['email' => $user->email]);

        Notification::assertSentTo($user, PasswordResetNotification::class, function ($notification) use (&$token) {
            $token = $notification->token;

            return true;
        });

        $this->travel(61)->minutes();

        $this->post(route('password.update'), [
            'token' => $token,
            'email' => $user->email,
            'password' => 'NewPassword123!',
            'password_confirmation' => 'NewPassword123!',
        ])->assertSessionHasErrors('email');

        $this->assertSame($originalPassword, $user->fresh()->password);
    }

    public function test_reset_preserves_publisher_role_and_approval_status(): void
    {
        Notification::fake();
        Role::findOrCreate('publisher', 'web');

        $user = User::factory()->withTwoFactor()->create([
            'email' => 'pending.publisher@example.test',
        ]);
        $user->assignRole('publisher');
        $user->publisherRegistration()->create([
            'publisher_name' => 'Penerbit Pending',
            'responsible_person' => 'Pemilik',
            'phone' => '+6281234567890',
            'address' => 'Bandung',
            'ikapi_member_number' => 'IKAPI-PENDING',
            'approval_status' => 'pending',
        ]);
        $emailVerifiedAt = $user->email_verified_at;
        $twoFactorSecret = $user->two_factor_secret;

        $this->post(route('password.email'), ['email' => $user->email]);

        Notification::assertSentTo($user, PasswordResetNotification::class, function ($notification) use ($user) {
            $this->post(route('password.update'), [
                'token' => $notification->token,
                'email' => $user->email,
                'password' => 'NewPassword123!',
                'password_confirmation' => 'NewPassword123!',
            ])->assertSessionHasNoErrors();

            return true;
        });

        $user->refresh();

        $this->assertSame(['publisher'], $user->getRoleNames()->all());
        $this->assertDatabaseHas('publisher_registrations', [
            'user_id' => $user->id,
            'approval_status' => 'pending',
        ]);
        $this->assertFalse($user->canAccessPublisherPortal());
        $this->assertSame($emailVerifiedAt?->toISOString(), $user->email_verified_at?->toISOString());
        $this->assertSame($twoFactorSecret, $user->two_factor_secret);
    }

    public function test_approved_publisher_remains_approved_after_password_reset(): void
    {
        Notification::fake();
        Role::findOrCreate('publisher', 'web');

        $user = User::factory()->create([
            'email' => 'approved.publisher@example.test',
        ]);
        $user->assignRole('publisher');
        $user->publisherRegistration()->create([
            'publisher_name' => 'Penerbit Approved',
            'responsible_person' => 'Pemilik',
            'phone' => '+6281234567890',
            'address' => 'Bandung',
            'ikapi_member_number' => 'IKAPI-APPROVED',
            'approval_status' => 'approved',
        ]);

        $this->post(route('password.email'), ['email' => $user->email]);

        Notification::assertSentTo($user, PasswordResetNotification::class, function ($notification) use ($user) {
            $this->post(route('password.update'), [
                'token' => $notification->token,
                'email' => $user->email,
                'password' => 'NewPassword123!',
                'password_confirmation' => 'NewPassword123!',
            ])->assertSessionHasNoErrors();

            return true;
        });

        $this->assertTrue($user->fresh()->canAccessPublisherPortal());
    }

    public function test_database_sessions_are_invalidated_after_password_reset(): void
    {
        Notification::fake();
        config(['session.driver' => 'database']);

        $user = User::factory()->create();
        DB::table('sessions')->insert([
            'id' => 'other-device-session',
            'user_id' => $user->id,
            'ip_address' => '127.0.0.1',
            'user_agent' => 'password-reset-test',
            'payload' => '[]',
            'last_activity' => now()->timestamp,
        ]);

        $this->post(route('password.email'), ['email' => $user->email]);

        Notification::assertSentTo($user, PasswordResetNotification::class, function ($notification) use ($user) {
            $this->post(route('password.update'), [
                'token' => $notification->token,
                'email' => $user->email,
                'password' => 'NewPassword123!',
                'password_confirmation' => 'NewPassword123!',
            ])->assertSessionHasNoErrors();

            return true;
        });

        $this->assertDatabaseMissing('sessions', ['id' => 'other-device-session']);
    }

    public function test_admin_role_and_permission_are_unchanged_after_password_reset(): void
    {
        Notification::fake();
        $adminRole = Role::findOrCreate('admin', 'web');
        $permission = Permission::findOrCreate('access-admin-panel', 'web');
        $user = User::factory()->create();
        $user->assignRole($adminRole);
        $user->givePermissionTo($permission);
        $emailVerifiedAt = $user->email_verified_at;

        $this->post(route('password.email'), ['email' => $user->email]);

        Notification::assertSentTo($user, PasswordResetNotification::class, function ($notification) use ($user) {
            $this->post(route('password.update'), [
                'token' => $notification->token,
                'email' => $user->email,
                'password' => 'NewPassword123!',
                'password_confirmation' => 'NewPassword123!',
            ])->assertSessionHasNoErrors();

            return true;
        });

        $user->refresh();

        $this->assertSame(['admin'], $user->getRoleNames()->all());
        $this->assertTrue($user->hasPermissionTo('access-admin-panel'));
        $this->assertSame($emailVerifiedAt?->toISOString(), $user->email_verified_at?->toISOString());
    }

    public function test_reset_notification_is_queued_encrypted_and_uses_the_configured_application_host(): void
    {
        $user = User::factory()->create();
        $notification = new PasswordResetNotification('test-reset-token');

        $this->assertInstanceOf(ShouldQueue::class, $notification);
        $this->assertInstanceOf(ShouldBeEncrypted::class, $notification);

        $message = $notification->toMail($user);

        $this->assertSame('smtp', $message->mailer);
        $this->assertSame(
            rtrim((string) config('app.url'), '/').route('password.reset', [
                'token' => 'test-reset-token',
                'email' => $user->email,
            ], false),
            $message->actionUrl,
        );
        $this->assertSame('Atur ulang kata sandi IKAPI Jawa Barat', $message->subject);
    }

    public function test_password_changed_notification_is_queued_encrypted_and_contains_no_credentials(): void
    {
        $user = User::factory()->create();
        $notification = new PasswordChangedNotification;

        $this->assertInstanceOf(ShouldQueue::class, $notification);
        $this->assertInstanceOf(ShouldBeEncrypted::class, $notification);

        $message = $notification->toMail($user);
        $content = implode(' ', [...$message->introLines, ...$message->outroLines]);

        $this->assertSame('Kata sandi akun IKAPI telah diubah', $message->subject);
        $this->assertSame('smtp', $message->mailer);
        $this->assertStringNotContainsString($user->password, $content);
        $this->assertStringNotContainsString('token', strtolower($content));
    }

    public function test_password_cannot_be_reset_with_invalid_token(): void
    {
        $user = User::factory()->create();

        $response = $this->post(route('password.update'), [
            'token' => 'invalid-token',
            'email' => $user->email,
            'password' => 'newpassword123',
            'password_confirmation' => 'newpassword123',
        ]);

        $response->assertSessionHasErrors('email');
    }
}
