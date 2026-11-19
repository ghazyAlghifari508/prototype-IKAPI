<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\PublisherRegistration;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\View\View;

class RegisterController extends Controller
{
    /**
     * Show the unified registration form (buyer + publisher tabs).
     */
    public function showRegistrationForm(Request $request): View
    {
        $role = $request->query('role', 'buyer');

        return view('auth.register', [
            'role' => in_array($role, ['buyer', 'publisher']) ? $role : 'buyer',
        ]);
    }

    /**
     * Handle buyer registration.
     */
    public function registerBuyer(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'fullName'              => ['required', 'string', 'max:255'],
            'email'                 => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'phone'                 => ['required', 'string', 'max:25'],
            'password'              => ['required', 'string', 'min:8', 'confirmed'],
            'terms'                 => ['accepted'],
        ], [
            'fullName.required'     => 'Nama lengkap wajib diisi.',
            'email.required'        => 'Alamat email wajib diisi.',
            'email.email'           => 'Masukkan format alamat email yang benar.',
            'email.unique'          => 'Alamat email ini sudah terdaftar di sistem.',
            'phone.required'        => 'Nomor WhatsApp / HP wajib diisi.',
            'password.required'     => 'Kata sandi wajib diisi.',
            'password.min'          => 'Kata sandi minimal 8 karakter.',
            'password.confirmed'    => 'Konfirmasi kata sandi tidak cocok.',
            'terms.accepted'        => 'Persetujuan Ketentuan Layanan & Kebijakan Privasi wajib dicentang.',
        ]);

        $user = User::create([
            'name'               => $validated['fullName'],
            'email'              => $validated['email'],
            'phone'              => $validated['phone'],
            'password'           => Hash::make($validated['password']),
            'email_verified_at'  => now(),
        ]);

        $user->assignRole('buyer');

        Auth::login($user);

        return redirect()->route('home')
            ->with('status', 'Selamat datang! Akun pembeli Anda berhasil didaftarkan.');
    }

    /**
     * Handle publisher registration (3-step form submitted all at once).
     */
    public function registerPublisher(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            // Step 1 — publisher info
            'pubName'           => ['required', 'string', 'max:255'],
            'pubMember'         => ['required', 'string', 'max:100'],   // nomor anggota IKAPI
            'pubAddress'        => ['required', 'string'],
            // Step 2 — PIC & contact
            'pubPic'            => ['required', 'string', 'max:255'],   // nama penanggung jawab
            'pubEmail'          => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'pubPhone'          => ['required', 'string', 'max:25'],
            // Step 3 — credentials
            'pubPassword'       => ['required', 'string', 'min:8', 'confirmed'],
            'pubTerms'          => ['accepted'],
        ], [
            'pubName.required'          => 'Nama penerbit wajib diisi.',
            'pubMember.required'        => 'Nomor anggota IKAPI wajib diisi.',
            'pubAddress.required'       => 'Alamat penerbit wajib diisi.',
            'pubPic.required'           => 'Nama penanggung jawab wajib diisi.',
            'pubEmail.required'         => 'Email kantor / redaksi wajib diisi.',
            'pubEmail.email'            => 'Masukkan format alamat email yang benar.',
            'pubEmail.unique'           => 'Email kantor ini sudah terdaftar di sistem.',
            'pubPhone.required'         => 'Nomor WhatsApp / HP wajib diisi.',
            'pubPassword.required'      => 'Kata sandi wajib diisi.',
            'pubPassword.min'           => 'Kata sandi minimal 8 karakter.',
            'pubPassword.confirmed'     => 'Konfirmasi kata sandi tidak cocok.',
            'pubTerms.accepted'         => 'Pernyataan kebenaran data dan ketentuan pendaftaran wajib disetujui.',
        ]);

        // Create the user account
        $user = User::create([
            'name'              => $validated['pubName'],
            'email'             => $validated['pubEmail'],
            'phone'             => $validated['pubPhone'],
            'address'           => $validated['pubAddress'],
            'password'          => Hash::make($validated['pubPassword']),
            'email_verified_at' => now(),
        ]);

        $user->assignRole('publisher');

        // Create publisher registration record (pending approval)
        PublisherRegistration::create([
            'user_id'           => $user->id,
            'publisher_name'    => $validated['pubName'],
            'publisher_type'    => 'company',
            'npwp'              => $validated['pubMember'],  // Nomor Anggota IKAPI disimpan di npwp utk sementara
            'phone'             => $validated['pubPhone'],
            'address'           => $validated['pubAddress'],
            'description'       => 'Penanggung jawab: ' . $validated['pubPic'],
            'status'            => 'pending',
        ]);

        // Login so they can view their pending status page
        Auth::login($user);

        return redirect()->route('publisher.status')
            ->with('status', 'Pendaftaran mitra penerbit berhasil diajukan dan sedang menunggu verifikasi administrator.');
    }
}
