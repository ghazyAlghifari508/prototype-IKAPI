<?php

namespace App\Providers;

use App\Models\User;
use App\Notifications\PasswordChangedNotification;
use Carbon\CarbonImmutable;
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
        $this->invalidateDatabaseSessionsAfterPasswordReset();
        Event::listen(Login::class, function (Login $event): void {
            if (! $event->user instanceof User) {
                return;
            }
            $user = $event->user->fresh();
            if (! $user || ! $user->isActive()) {
                Auth::guard($event->guard)->logout();
                if (request()->hasSession()) {
                    request()->session()->invalidate();
                    request()->session()->regenerateToken();
                }
                throw ValidationException::withMessages(['email' => __('auth.failed')]);
            }
            if (request()->hasSession()) {
                request()->session()->put('account_version', $user->account_version);
            }
        });
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }

    protected function invalidateDatabaseSessionsAfterPasswordReset(): void
    {
        Event::listen(PasswordReset::class, function (PasswordReset $event): void {
            $event->user->notify(new PasswordChangedNotification);

            if (config('session.driver') !== 'database') {
                return;
            }

            DB::table((string) config('session.table', 'sessions'))
                ->where('user_id', $event->user->getAuthIdentifier())
                ->delete();
        });
    }
}
