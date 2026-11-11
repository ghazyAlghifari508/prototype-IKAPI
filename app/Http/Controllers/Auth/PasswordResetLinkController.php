<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\SendPasswordResetLinkRequest;
use App\Jobs\SendPasswordResetLink;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Laravel\Fortify\Contracts\RequestPasswordResetLinkViewResponse;

class PasswordResetLinkController extends Controller
{
    public function create(Request $request): RequestPasswordResetLinkViewResponse
    {
        return app(RequestPasswordResetLinkViewResponse::class);
    }

    public function store(SendPasswordResetLinkRequest $request): RedirectResponse
    {
        $email = trim(mb_strtolower((string) $request->validated('email')));

        SendPasswordResetLink::dispatch($email);

        return back()->with('status', 'Jika email terdaftar, tautan reset kata sandi akan dikirimkan.');
    }
}
