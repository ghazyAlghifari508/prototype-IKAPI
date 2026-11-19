<?php

namespace App\Http\Controllers;

use Illuminate\Contracts\View\View;

/**
 * P06 group A: simulated authentication screens.
 *
 * No Laravel Auth, no password hashing, no mail, no OTP, no database and no middleware. The prototype is a
 * clickable demo: these pages validate input in the browser and write an explicit demo session to
 * localStorage (`ikapi_buyer_session_demo`, same key the prototype and resources/js/ikapi/demo/session.js use).
 * Nothing here claims a verified account.
 */
class AuthDemoController extends Controller
{
    public function login(): View
    {
        return view('auth-demo.login');
    }

    public function register(): View
    {
        return view('auth-demo.register');
    }

    public function forgotPassword(): View
    {
        return view('auth-demo.forgot-password');
    }

    public function verifyEmail(): View
    {
        return view('auth-demo.verify-email');
    }

    public function onboarding(): View
    {
        return view('auth-demo.onboarding');
    }

    /**
     * Publisher application status. `?sesi=` is read by the page script (aktif | menunggu | ditolak),
     * exactly like the prototype; unknown values fall back to the stored demo application, never to a made-up row.
     */
    public function publisherStatus(): View
    {
        return view('auth-demo.publisher-status');
    }
}
