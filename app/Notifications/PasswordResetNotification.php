<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Contracts\Queue\ShouldBeEncrypted;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;

class PasswordResetNotification extends ResetPassword implements ShouldBeEncrypted, ShouldQueue
{
    public function toMail($notifiable): MailMessage
    {
        $broker = config('fortify.passwords', config('auth.defaults.passwords', 'users'));
        $expiration = config("auth.passwords.{$broker}.expire", 60);
        $resetPath = route('password.reset', [
            'token' => $this->token,
            'email' => $notifiable->getEmailForPasswordReset(),
        ], false);
        $resetUrl = rtrim((string) config('app.url'), '/').$resetPath;

        $message = (new MailMessage)
            ->subject('Atur ulang kata sandi IKAPI Jawa Barat')
            ->greeting('Halo '.$notifiable->name.',')
            ->line('Kami menerima permintaan untuk mengatur ulang kata sandi akun IKAPI Anda.')
            ->action('Atur Ulang Kata Sandi', $resetUrl)
            ->line("Tautan ini berlaku selama {$expiration} menit.")
            ->line('Jika Anda tidak meminta pengaturan ulang kata sandi, abaikan email ini.')
            ->salutation('Salam, IKAPI Jawa Barat');

        $message->mailer = config('mail.password_reset_mailer', 'smtp');

        return $message;
    }
}
