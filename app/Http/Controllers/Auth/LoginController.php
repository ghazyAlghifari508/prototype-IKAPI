<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\View\View;

class LoginController extends Controller
{
    /**
     * Show the unified login form (buyer and publisher).
     */
    public function showLoginForm(Request $request): View
    {
        $role = $request->query('role', 'buyer');

        return view('auth.login', [
            'role' => in_array($role, ['buyer', 'publisher']) ? $role : 'buyer',
        ]);
    }

    /**
     * Handle an authentication attempt.
     */
    public function login(Request $request): RedirectResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ], [
            'email.required' => 'Alamat email wajib diisi.',
            'email.email' => 'Masukkan format alamat email yang benar.',
            'password.required' => 'Kata sandi wajib diisi.',
        ]);

        $remember = $request->boolean('remember');
        $intendedRole = $request->input('role', 'buyer');

        if (! Auth::attempt($credentials, $remember)) {
            return back()
                ->withInput($request->only('email', 'role', 'remember'))
                ->withErrors([
                    'email' => 'Alamat email atau kata sandi tidak cocok.',
                ]);
        }

        $user = Auth::user();

        // Role verification
        if ($intendedRole === 'publisher') {
            if (! $user->isPublisher()) {
                Auth::logout();

                return back()
                    ->withInput($request->only('email', 'role', 'remember'))
                    ->withErrors([
                        'email' => 'Akun ini tidak terdaftar sebagai mitra penerbit.',
                    ]);
            }

            // Check approval status
            $registration = $user->publisherRegistration;
            $approvalStatus = $registration?->status ?? 'pending';

            if ($approvalStatus === 'pending') {
                Auth::logout();

                return back()
                    ->withInput($request->only('email', 'role'))
                    ->with('pending_approval', true);
            }

            if ($approvalStatus === 'rejected') {
                Auth::logout();

                return back()
                    ->withInput($request->only('email', 'role'))
                    ->withErrors([
                        'email' => 'Pendaftaran akun penerbit Anda ditolak oleh administrator IKAPI.',
                    ]);
            }

            $request->session()->regenerate();

            return redirect()->intended(route('publisher.dashboard'));
        }

        // Default Buyer login
        $request->session()->regenerate();

        return redirect()->intended(route('home'));
    }

    /**
     * Log the user out of the application.
     */
    public function logout(Request $request): RedirectResponse
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login');
    }
}
