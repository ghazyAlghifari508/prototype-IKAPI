<?php

namespace App\Notifications;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeEncrypted;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PublisherRegistrationDecided extends Notification implements ShouldBeEncrypted, ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    public function __construct(
        public string $publisherName,
        public string $status,
        public ?string $reason,
    ) {
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
        $approved = $this->status === 'approved';
        $message = (new MailMessage)
            ->subject($approved ? 'Pendaftaran penerbit disetujui' : 'Pendaftaran penerbit ditolak')
            ->greeting('Halo '.$notifiable->name.',')
            ->line('Pendaftaran '.$this->publisherName.($approved ? ' telah disetujui.' : ' telah ditolak.'))
            ->salutation('Salam, IKAPI Jawa Barat');

        if ($approved) {
            $message->line('Anda dapat masuk ke portal penerbit setelah memenuhi persyaratan verifikasi email.')
                ->action('Masuk Portal Penerbit', rtrim((string) config('app.url'), '/').'/publisher/login');
        } else {
            $message->line('Alasan penolakan: '.$this->reason);
        }

        $message->mailer = config('mail.publisher_approval_mailer', 'smtp');

        return $message;
    }
}
