<?php

namespace App\Http\Controllers\Publisher;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class PublisherLoginController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('publisher/login', [
            'status' => session('status'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ], [
            'email.required' => 'Email wajib diisi.',
            'email.email' => 'Masukkan alamat email yang valid.',
            'password.required' => 'Kata sandi wajib diisi.',
        ]);

        if (! Auth::attempt([
            'email' => mb_strtolower(trim($request->input('email'))),
            'password' => $request->input('password'),
        ], $request->boolean('remember'))) {
            return back()->withErrors([
                'email' => 'Email atau kata sandi salah.',
            ]);
        }

        $user = Auth::user();

        if (! $user || ! $user->hasRole('publisher')) {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return back()->withErrors([
                'email' => 'Email atau kata sandi salah.',
            ]);
        }

        if (! $user->canAccessPublisherPortal()) {
            $approvalStatus = $user->publisherRegistration?->approval_status;
            $message = match ($approvalStatus) {
                'pending' => 'Pendaftaran penerbit Anda masih menunggu persetujuan administrator.',
                'rejected' => 'Pendaftaran penerbit Anda ditolak. Silakan hubungi administrator IKAPI.',
                'suspended' => 'Akun penerbit Anda dinonaktifkan. Silakan hubungi administrator IKAPI.',
                default => 'Akun penerbit Anda belum dapat mengakses portal. Silakan hubungi administrator IKAPI.',
            };

            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return back()->withErrors([
                'email' => $message,
            ]);
        }

        if (! $user->hasVerifiedEmail()) {
            return redirect()->route('verification.notice');
        }

        return redirect()->intended(route('publisher.dashboard'));
    }
}
