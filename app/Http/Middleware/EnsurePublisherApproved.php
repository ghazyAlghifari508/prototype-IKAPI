<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsurePublisherApproved
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! Auth::check()) {
            return redirect()->route('publisher.login');
        }

        $user = Auth::user();

        if (! $user->hasRole('publisher')) {
            abort(Response::HTTP_FORBIDDEN);
        }

        if (! $user->canAccessPublisherPortal()) {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect()->route('publisher.login')->withErrors([
                'email' => 'Email atau kata sandi salah atau akun Anda belum disetujui.',
            ]);
        }

        return $next($request);
    }
}
