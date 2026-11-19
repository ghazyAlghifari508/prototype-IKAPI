<?php

namespace Tests\Feature;

use App\Models\PublisherRegistration;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Role::firstOrCreate(['name' => 'buyer'], ['guard_name' => 'web']);
        Role::firstOrCreate(['name' => 'publisher'], ['guard_name' => 'web']);
        Role::firstOrCreate(['name' => 'admin'], ['guard_name' => 'web']);
    }

    public function test_login_page_can_be_rendered(): void
    {
        $response = $this->get('/login');
        $response->assertStatus(200);
        $response->assertSee('Selamat Datang Kembali');
    }

    public function test_register_page_can_be_rendered(): void
    {
        $response = $this->get('/register');
        $response->assertStatus(200);
        $response->assertSee('Buat Akun');
        $response->assertSee('Pendaftaran Penerbit');
    }

    public function test_forgot_password_page_can_be_rendered(): void
    {
        $response = $this->get('/forgot-password');
        $response->assertStatus(200);
        $response->assertSee('Lupa Kata Sandi');
    }

    public function test_admin_login_page_can_be_rendered(): void
    {
        $response = $this->get('/admin/login');
        $response->assertStatus(200);
        $response->assertSee('Masuk Administrator');
    }

    public function test_buyer_can_register(): void
    {
        $response = $this->post('/register/buyer', [
            'fullName' => 'Budi Pembaca',
            'email' => 'budi@example.com',
            'phone' => '081234567890',
            'password' => 'secret12345',
            'password_confirmation' => 'secret12345',
            'terms' => 'on',
        ]);

        $response->assertRedirect(route('home'));
        $this->assertAuthenticated();

        $user = User::where('email', 'budi@example.com')->first();
        $this->assertNotNull($user);
        $this->assertTrue($user->isBuyer());
    }

    public function test_buyer_registration_validates_required_fields_and_terms(): void
    {
        $response = $this->post('/register/buyer', [
            'fullName' => '',
            'email' => 'not-an-email',
            'phone' => '',
            'password' => 'short',
            'password_confirmation' => 'different',
        ]);

        $response->assertSessionHasErrors(['fullName', 'email', 'phone', 'password', 'terms']);
        $this->assertGuest();
    }

    public function test_buyer_can_login(): void
    {
        $user = User::factory()->create([
            'email' => 'pembeli.test@ikapi.id',
            'password' => Hash::make('secret12345'),
        ]);
        $user->assignRole('buyer');

        $response = $this->post('/login', [
            'role' => 'buyer',
            'email' => 'pembeli.test@ikapi.id',
            'password' => 'secret12345',
        ]);

        $response->assertRedirect(route('home'));
        $this->assertAuthenticatedAs($user);
    }

    public function test_buyer_cannot_login_with_invalid_password(): void
    {
        $user = User::factory()->create([
            'email' => 'pembeli.wrong@ikapi.id',
            'password' => Hash::make('secret12345'),
        ]);

        $response = $this->post('/login', [
            'role' => 'buyer',
            'email' => 'pembeli.wrong@ikapi.id',
            'password' => 'wrong-password',
        ]);

        $response->assertSessionHasErrors('email');
        $this->assertGuest();
    }

    public function test_publisher_can_register_and_creates_pending_record(): void
    {
        $response = $this->post('/register/publisher', [
            'pubName' => 'Penerbit Mandiri Jaya',
            'pubMember' => '045/JBA/2026',
            'pubAddress' => 'Jl. Cihampelas No. 20, Bandung',
            'pubPic' => 'Siti Nurhaliza',
            'pubEmail' => 'redaksi@mandirijaya.co.id',
            'pubPhone' => '081299887766',
            'pubPassword' => 'secret12345',
            'pubPassword_confirmation' => 'secret12345',
            'pubTerms' => 'on',
        ]);

        $response->assertRedirect(route('publisher.status'));
        $this->assertAuthenticated();

        $user = User::where('email', 'redaksi@mandirijaya.co.id')->first();
        $this->assertNotNull($user);
        $this->assertTrue($user->isPublisher());

        $registration = $user->publisherRegistration;
        $this->assertNotNull($registration);
        $this->assertSame('pending', $registration->approval_status);
        $this->assertSame('Penerbit Mandiri Jaya', $registration->publisher_name);
    }

    public function test_approved_publisher_can_login_and_redirects_to_dashboard(): void
    {
        $user = User::factory()->create([
            'email' => 'approved@penerbit.id',
            'password' => Hash::make('secret12345'),
        ]);
        $user->assignRole('publisher');

        PublisherRegistration::create([
            'user_id' => $user->id,
            'publisher_name' => 'Penerbit Disetujui',
            'responsible_person' => 'Dedi Mulyadi',
            'phone' => '081233445566',
            'address' => 'Bandung',
            'ikapi_member_number' => '010/JBA/2021',
            'approval_status' => 'approved',
        ]);

        $response = $this->post('/login', [
            'role' => 'publisher',
            'email' => 'approved@penerbit.id',
            'password' => 'secret12345',
        ]);

        $response->assertRedirect(route('publisher.dashboard'));
        $this->assertAuthenticatedAs($user);
    }

    public function test_pending_publisher_cannot_access_dashboard_and_is_notified(): void
    {
        $user = User::factory()->create([
            'email' => 'pending@penerbit.id',
            'password' => Hash::make('secret12345'),
        ]);
        $user->assignRole('publisher');

        PublisherRegistration::create([
            'user_id' => $user->id,
            'publisher_name' => 'Penerbit Pending',
            'responsible_person' => 'Dedi Mulyadi',
            'phone' => '081233445566',
            'address' => 'Bandung',
            'ikapi_member_number' => '011/JBA/2026',
            'approval_status' => 'pending',
        ]);

        $response = $this->post('/login', [
            'role' => 'publisher',
            'email' => 'pending@penerbit.id',
            'password' => 'secret12345',
        ]);

        $response->assertSessionHas('pending_approval', true);
        $this->assertGuest();
    }

    public function test_admin_can_login_and_redirects_to_admin_dashboard(): void
    {
        $user = User::factory()->create([
            'email' => 'admin.test@ikapi.id',
            'password' => Hash::make('secret12345'),
        ]);
        $user->assignRole('admin');

        $response = $this->post('/admin/login', [
            'email' => 'admin.test@ikapi.id',
            'password' => 'secret12345',
        ]);

        $response->assertRedirect(route('admin.dashboard'));
        $this->assertAuthenticatedAs($user);
    }

    public function test_non_admin_cannot_login_via_admin_portal(): void
    {
        $user = User::factory()->create([
            'email' => 'regular.user@ikapi.id',
            'password' => Hash::make('secret12345'),
        ]);
        $user->assignRole('buyer');

        $response = $this->post('/admin/login', [
            'email' => 'regular.user@ikapi.id',
            'password' => 'secret12345',
        ]);

        $response->assertSessionHasErrors('email');
        $this->assertGuest();
    }

    public function test_password_reset_link_can_be_requested(): void
    {
        $user = User::factory()->create([
            'email' => 'reset.me@ikapi.id',
        ]);

        $response = $this->post('/forgot-password', [
            'email' => 'reset.me@ikapi.id',
        ]);

        $response->assertSessionHas('status');

        $record = DB::table('password_reset_tokens')->where('email', 'reset.me@ikapi.id')->first();
        $this->assertNotNull($record);
    }

    public function test_password_can_be_reset(): void
    {
        $user = User::factory()->create([
            'email' => 'change.pw@ikapi.id',
            'password' => Hash::make('oldpassword'),
        ]);

        DB::table('password_reset_tokens')->insert([
            'email' => 'change.pw@ikapi.id',
            'token' => Hash::make('plain-token'),
            'created_at' => now(),
        ]);

        $response = $this->post('/reset-password', [
            'token' => 'plain-token',
            'email' => 'change.pw@ikapi.id',
            'password' => 'newpassword123',
            'password_confirmation' => 'newpassword123',
        ]);

        $response->assertRedirect(route('login'));
        $response->assertSessionHas('status');

        $this->assertTrue(Hash::check('newpassword123', $user->fresh()->password));
    }

    public function test_authenticated_user_can_logout(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post('/logout');

        $response->assertRedirect(route('login'));
        $this->assertGuest();
    }
}
