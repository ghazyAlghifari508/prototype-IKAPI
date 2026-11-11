<?php

namespace App\Notifications;

use App\Models\User;
use Illuminate\Contracts\Queue\ShouldBeEncrypted;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PasswordChangedNotification extends Notification implements ShouldBeEncrypted, ShouldQueue
{
    /**
     * @param  User  $notifiable
     * @return array<int, string>
     */
    public function via($notifiable): array
    {
        return ['mail'];
    }

    public function toMail(User $notifiable): MailMessage
    {
        $message = (new MailMessage)
            ->subject('Kata sandi akun IKAPI telah diubah')
            ->greeting('Halo '.$notifiable->name.',')
            ->line('Kata sandi akun IKAPI Jawa Barat Anda berhasil diubah.')
            ->line('Jika Anda tidak melakukan perubahan ini, segera minta tautan reset baru untuk mengamankan akun Anda.')
            ->salutation('Salam, IKAPI Jawa Barat');

        $message->mailer = config('mail.password_reset_mailer', 'smtp');

        return $message;
    }
}
