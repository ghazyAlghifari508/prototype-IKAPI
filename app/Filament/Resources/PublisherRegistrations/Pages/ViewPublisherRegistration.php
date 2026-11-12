<?php

namespace App\Filament\Resources\PublisherRegistrations\Pages;

use App\Actions\Publishers\ReviewPublisherRegistration;
use App\Filament\Resources\PublisherRegistrations\PublisherRegistrationResource;
use App\Models\PublisherRegistration;
use App\Models\User;
use Filament\Actions\Action;
use Filament\Facades\Filament;
use Filament\Forms\Components\Textarea;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\ViewRecord;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;

/** @extends ViewRecord<PublisherRegistration> */
class ViewPublisherRegistration extends ViewRecord
{
    protected static string $resource = PublisherRegistrationResource::class;

    protected static ?string $title = 'Detail Pendaftaran Penerbit';

    /** @return array<Action> */
    protected function getHeaderActions(): array
    {
        return [
            Action::make('document')->label('Unduh Dokumen Legalitas')
                ->authorize(fn (): bool => Gate::allows('view', $this->getRecord()))
                ->visible(fn (): bool => filled($this->getRecord()->verification_document_path))
                ->url(fn (): string => route('admin.publisher-registration.document', $this->getRecord())),
            Action::make('reject')->label('Tolak Pendaftaran')->color('danger')
                ->authorize(fn (): bool => Gate::allows('decide', $this->getRecord()))
                ->visible(fn (): bool => $this->getRecord()->approval_status === 'pending')
                ->requiresConfirmation()
                ->modalHeading('Tolak Pendaftaran Penerbit')
                ->modalSubmitActionLabel('Kirim Penolakan')
                ->modalCancelActionLabel('Batal')
                ->schema([Textarea::make('reason')->label('Alasan Penolakan')->required()->maxLength(2000)])
                ->action(fn (array $data) => $this->decide('rejected', $data['reason'])),
            Action::make('approve')->label('Setujui Penerbit')
                ->authorize(fn (): bool => Gate::allows('decide', $this->getRecord()))
                ->visible(fn (): bool => $this->getRecord()->approval_status === 'pending')
                ->requiresConfirmation()
                ->modalHeading('Setujui Penerbit')
                ->modalSubmitActionLabel('Setujui Penerbit')
                ->modalCancelActionLabel('Batal')
                ->modalDescription('Penerbit akan memperoleh akses portal sesuai persyaratan akun. Keputusan ini tidak dapat diulang.')
                ->action(fn () => $this->decide('approved')),
        ];
    }

    protected function decide(string $status, ?string $reason = null): void
    {
        $actor = Filament::auth()->user();
        abort_unless($actor instanceof User, 403);

        try {
            app(ReviewPublisherRegistration::class)->handle($actor, $this->getRecord()->id, $status, $reason);
        } catch (ValidationException $exception) {
            // A stale detail page must show the committed decision rather than offer a second action.
            $this->getRecord()->refresh();

            if (isset($exception->errors()['status'])) {
                Notification::make()->title($exception->errors()['status'][0])->warning()->send();

                return;
            }

            throw $exception;
        }

        $this->getRecord()->refresh();
        Notification::make()->title('Keputusan pendaftaran berhasil disimpan')->success()->send();
    }
}
