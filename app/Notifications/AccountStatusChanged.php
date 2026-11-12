<?php

namespace App\Notifications;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeEncrypted;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AccountStatusChanged extends Notification implements ShouldBeEncrypted, ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    public function __construct(public string $status, public ?string $reason)
    {
        $this->onConnection('database');
        $this->beforeCommit();
    }

    /** @return array<int, string> */
    public function via(User $notifiable): array
    {
        return ['mail'];
    }

    /** @return array<int, int> */
    public function backoff(): array
    {
        return [60, 300];
    }

    public function toMail(User $notifiable): MailMessage
    {
        $suspended = $this->status === 'suspended';
        $message = (new MailMessage)
            ->subject($suspended ? 'Akses akun IKAPI dinonaktifkan' : 'Akses akun IKAPI diaktifkan kembali')
            ->greeting('Halo '.$notifiable->name.',')
            ->line($suspended
                ? 'Untuk sementara, akses akun Anda dinonaktifkan oleh administrator IKAPI Jawa Barat.'
                : 'Akses akun Anda telah diaktifkan kembali. Silakan masuk kembali. Persyaratan verifikasi email dan persetujuan penerbit tetap berlaku.')
            ->salutation('Salam, IKAPI Jawa Barat');
        if (filled($this->reason)) {
            $message->line('Alasan: '.$this->reason);
        }
        $message->mailer = config('mail.account_status_mailer', 'smtp');

        return $message;
    }
}
