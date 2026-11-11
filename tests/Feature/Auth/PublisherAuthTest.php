<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class PublisherAuthTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Role::findOrCreate('buyer', 'web');
        Role::findOrCreate('publisher', 'web');
    }

    public function test_guest_can_view_the_publisher_registration_form(): void
    {
        $response = $this->get(route('publisher.register'));

        $response->assertOk();
    }

    public function test_a_valid_publisher_registration_creates_a_pending_account(): void
    {
        Storage::fake('local');

        $response = $this->from(route('publisher.register'))
            ->post(route('publisher.register.store'), [
                'publisher_name' => 'Penerbit ABC',
                'legal_number' => 'AHU-0012345.AH.01.01',
                'responsible_person' => 'Budi Sudarto',
                'email' => 'publisher@example.com',
                'phone' => '081234567890',
                'password' => 'Password123!',
                'password_confirmation' => 'Password123!',
                'address' => 'Jl. Merdeka No. 10, Bandung',
                'ikapi_member_number' => 'IKAPI-12345',
                'verification_document' => UploadedFile::fake()->create('membership.pdf', 100, 'application/pdf'),
            ]);

        $response->assertRedirect(route('publisher.login'));
        $this->assertDatabaseHas('users', ['email' => 'publisher@example.com']);
        $this->assertDatabaseHas('publisher_registrations', [
            'publisher_name' => 'Penerbit ABC',
            'legal_number' => 'AHU-0012345.AH.01.01',
            'approval_status' => 'pending',
        ]);

        $user = User::query()->where('email', 'publisher@example.com')->firstOrFail();

        $this->assertTrue($user->hasRole('publisher'));
        $this->assertFalse($user->canAccessPublisherPortal());

        $registration = $user->publisherRegistration;
        $this->assertNotNull($registration->verification_document_path);
        Storage::disk('local')->assertExists($registration->verification_document_path);
        Storage::disk('public')->assertMissing($registration->verification_document_path);
    }

    public function test_pending_publishers_cannot_access_the_protected_publisher_dashboard(): void
    {
        $user = User::factory()->create();
        $user->assignRole('publisher');
        $user->publisherRegistration()->create([
            'publisher_name' => 'Penerbit Pending',
            'responsible_person' => 'Rina',
            'phone' => '+6281234567890',
            'address' => 'Bandung',
            'ikapi_member_number' => 'IKAPI-1',
            'approval_status' => 'pending',
        ]);

        $response = $this->actingAs($user)->get(route('publisher.dashboard'));

        $response->assertRedirect(route('publisher.login'));
    }

    public function test_unverified_approved_publisher_remains_authenticated_to_verify_email(): void
    {
        $user = User::factory()->unverified()->create([
            'email' => 'unverified.publisher@example.com',
        ]);
        $user->assignRole('publisher');
        $user->publisherRegistration()->create([
            'publisher_name' => 'Penerbit Belum Verified',
            'responsible_person' => 'Ayu',
            'phone' => '+6281234567890',
            'address' => 'Bandung',
            'ikapi_member_number' => 'IKAPI-UNVERIFIED',
            'approval_status' => 'approved',
        ]);

        $response = $this->post(route('publisher.login.store'), [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $response->assertRedirect(route('verification.notice'));
        $this->assertAuthenticatedAs($user);
        $this->get(route('verification.notice'))->assertOk();
    }

    public function test_buyer_session_is_preserved_when_the_publisher_dashboard_is_forbidden(): void
    {
        $buyer = User::factory()->create();

        $this->actingAs($buyer)
            ->get(route('publisher.dashboard'))
            ->assertForbidden();

        $this->assertAuthenticatedAs($buyer);
    }

    public function test_rejected_publishers_receive_a_rejection_message_not_a_pending_message(): void
    {
        $user = User::factory()->create([
            'email' => 'rejected.publisher@example.com',
        ]);
        $user->assignRole('publisher');
        $user->publisherRegistration()->create([
            'publisher_name' => 'Penerbit Ditolak',
            'responsible_person' => 'Ayu',
            'phone' => '+6281234567890',
            'address' => 'Bandung',
            'ikapi_member_number' => 'IKAPI-REJECTED',
            'approval_status' => 'rejected',
        ]);

        $this->from(route('publisher.login'))
            ->post(route('publisher.login.store'), [
                'email' => $user->email,
                'password' => 'password',
            ])
            ->assertSessionHasErrors([
                'email' => 'Pendaftaran penerbit Anda ditolak. Silakan hubungi administrator IKAPI.',
            ]);

        $this->assertGuest();
        $this->assertFalse($user->fresh()->canAccessPublisherPortal());
    }

    public function test_approved_publishers_can_log_in_and_access_the_publisher_dashboard(): void
    {
        $user = User::factory()->create([
            'email' => 'approved.publisher@example.com',
        ]);
        $user->assignRole('publisher');
        $user->publisherRegistration()->create([
            'publisher_name' => 'Penerbit Approved',
            'responsible_person' => 'Ayu',
            'phone' => '+6281234567890',
            'address' => 'Jakarta',
            'ikapi_member_number' => 'IKAPI-2',
            'approval_status' => 'approved',
        ]);

        $response = $this->post(route('publisher.login.store'), [
            'email' => 'approved.publisher@example.com',
            'password' => 'password',
        ]);

        $this->assertAuthenticatedAs($user);
        $response->assertRedirect(route('publisher.dashboard'));
    }
}
