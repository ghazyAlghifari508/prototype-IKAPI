<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\View\View;

class ForgotPasswordController extends Controller
{
    /**
     * Display the form to request a password reset link.
     */
    public function showLinkRequestForm(): View
    {
        return view('auth.forgot-password');
    }

    /**
     * Send a reset link to the given user.
     */
    public function sendResetLinkEmail(Request $request): RedirectResponse
    {
        $request->validate([
            'email' => ['required', 'email'],
        ], [
            'email.required' => 'Alamat email wajib diisi.',
            'email.email' => 'Masukkan format alamat email yang benar.',
        ]);

        $user = User::where('email', $request->email)->first();
        $demoResetUrl = null;

        if ($user) {
            $token = Str::random(60);

            DB::table('password_reset_tokens')->updateOrInsert(
                ['email' => $user->email],
                [
                    'token' => Hash::make($token),
                    'created_at' => now(),
                ]
            );

            $demoResetUrl = route('password.reset', [
                'token' => $token,
                'email' => $user->email,
            ]);

            Log::info("Password reset link for {$user->email}: {$demoResetUrl}");
        }

        $response = back()->with('status', 'Tautan untuk mengatur ulang kata sandi telah dikirim ke alamat email Anda jika terdaftar di sistem.');

        // Pada mode local/testing, sertakan link reset langsung agar dapat langsung dicoba tanpa SMTP
        if ($demoResetUrl && config('app.env') === 'local') {
            $response->with('demo_reset_url', $demoResetUrl);
        }

        return $response;
    }
}
