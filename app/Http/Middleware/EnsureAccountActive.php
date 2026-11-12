<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureAccountActive
{
    public function handle(Request $request, Closure $next): Response
    {
        // Logout remains available even for an inactive account or an old session.
        if ($request->routeIs('logout', 'filament.*.auth.logout')) {
            return $next($request);
        }
        $user = $request->user();
        if ($user instanceof User) {
            $fresh = $user->fresh();
            $version = $request->session()->get('account_version', 0);
            if (! $fresh || ! $fresh->isActive() || (int) $version !== $fresh->account_version) {
                Auth::guard('web')->logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();
                if ($request->expectsJson()) {
                    abort(403, 'Akses sesi ini tidak tersedia. Silakan masuk kembali atau hubungi administrator IKAPI.');
                }

                return redirect()->route('login')->with('status', 'Akses sesi ini tidak tersedia. Silakan masuk kembali atau hubungi administrator IKAPI.');
            }
        }

        return $next($request);
    }
}
