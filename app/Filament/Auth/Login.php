<?php

namespace App\Filament\Auth;

use DanHarrin\LivewireRateLimiting\Exceptions\TooManyRequestsException;
use Filament\Actions\Action;
use Filament\Auth\Http\Responses\Contracts\LoginResponse;
use Filament\Auth\Pages\Login as BaseLogin;
use Filament\Forms\Components\Checkbox;
use Filament\Forms\Components\TextInput;
use Filament\Notifications\Notification;
use Filament\Schemas\Components\Component;
use Filament\Support\Components\Attributes\Exposed;
use Illuminate\Validation\ValidationException;

class Login extends BaseLogin
{
    #[Exposed]
    public function authenticate(): ?LoginResponse
    {
        try {
            return parent::authenticate();
        } finally {
            // Do not retain credentials in Livewire state after any attempt.
            $this->data['password'] = '';
        }
    }

    public function getTitle(): string
    {
        return 'Masuk Administrator';
    }

    public function getHeading(): string
    {
        return 'Masuk Administrator';
    }

    protected function getEmailFormComponent(): Component
    {
        return TextInput::make('email')
            ->label('Email')
            ->email()
            ->required()
            ->autocomplete('email')
            ->autofocus();
    }

    protected function getPasswordFormComponent(): Component
    {
        return TextInput::make('password')
            ->label('Kata Sandi')
            ->password()
            ->revealable(false)
            ->autocomplete('current-password')
            ->required();
    }

    protected function getRememberFormComponent(): Component
    {
        return Checkbox::make('remember')->label('Ingat saya');
    }

    protected function getAuthenticateFormAction(): Action
    {
        return parent::getAuthenticateFormAction()->label('Masuk Administrator');
    }

    protected function throwFailureValidationException(): never
    {
        throw ValidationException::withMessages([
            'data.email' => 'Email atau kata sandi salah, atau Anda tidak memiliki akses administrator.',
        ]);
    }

    protected function getRateLimitedNotification(TooManyRequestsException $exception): ?Notification
    {
        return Notification::make()
            ->title('Terlalu banyak percobaan masuk')
            ->body("Coba lagi dalam {$exception->secondsUntilAvailable} detik.")
            ->danger();
    }
}
