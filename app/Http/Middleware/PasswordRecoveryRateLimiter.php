<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Cache\RateLimiter;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class PasswordRecoveryRateLimiter
{
    public function __construct(private readonly RateLimiter $limiter) {}

    public function handle(Request $request, Closure $next): Response
    {
        $routeName = $request->route()?->getName();

        if ($routeName === 'password.reset') {
            $response = $next($request);
            $response->headers->set('Referrer-Policy', 'no-referrer');
            $response->headers->set('Cache-Control', 'no-store, private');

            return $response;
        }

        if ($routeName === 'password.email') {
            $email = Str::lower(trim((string) $request->input('email')));
            $limits = [
                ['password-reset-ip:'.$request->ip(), 10],
                ['password-reset-email:'.hash_hmac('sha256', $email, (string) config('app.key')), 3],
            ];
        } elseif ($routeName === 'password.update') {
            $limits = [['password-reset-submit:'.$request->ip(), 10]];
        } else {
            return $next($request);
        }

        foreach ($limits as [$key, $maximumAttempts]) {
            if ($this->limiter->tooManyAttempts($key, $maximumAttempts)) {
                $response = $routeName === 'password.email'
                    ? back()->with('status', 'Jika email terdaftar, tautan reset kata sandi akan dikirimkan.')
                    : back()->withErrors(['email' => 'Terlalu banyak percobaan. Silakan minta tautan reset baru.']);

                return $response->setStatusCode(Response::HTTP_TOO_MANY_REQUESTS)
                    ->header('Retry-After', (string) $this->limiter->availableIn($key));
            }
        }

        foreach ($limits as [$key]) {
            $this->limiter->hit($key, 60);
        }

        return $next($request);
    }
}
