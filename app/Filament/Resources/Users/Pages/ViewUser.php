<?php

namespace App\Filament\Resources\Users\Pages;

use App\Actions\Accounts\ChangeAccountStatus;
use App\Filament\Resources\Users\UserResource;
use App\Models\User;
use Filament\Actions\Action;
use Filament\Facades\Filament;
use Filament\Forms\Components\Textarea;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\ViewRecord;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;
use Livewire\Attributes\Locked;

/** @extends ViewRecord<User> */
class ViewUser extends ViewRecord
{
    protected static string $resource = UserResource::class;

    protected static ?string $title = 'Informasi Pengguna';

    #[Locked]
    public int $accountVersion = 0;

    public function mount(int|string $record): void
    {
        parent::mount($record);
        $this->accountVersion = $this->getRecord()->account_version;
    }

    /** @return array<Action> */
    protected function getHeaderActions(): array
    {
        return [
            Action::make('suspend')->label('Nonaktifkan Akun')->color('danger')
                ->authorize(fn (): bool => Gate::allows('changeAccountStatus', $this->getRecord()))
                ->visible(fn (): bool => $this->getRecord()->isActive())
                ->requiresConfirmation()->modalHeading('Nonaktifkan Akun')
                ->modalSubmitActionLabel('Nonaktifkan Akun')->modalCancelActionLabel('Batal')
                ->schema([Textarea::make('reason')->label('Alasan Penonaktifan')->required()->maxLength(2000)])
                ->action(fn (array $data) => $this->changeStatus('suspended', $data['reason'])),
            Action::make('reactivate')->label('Aktifkan Kembali')
                ->authorize(fn (): bool => Gate::allows('changeAccountStatus', $this->getRecord()))
                ->visible(fn (): bool => $this->getRecord()->account_status === 'suspended')
                ->requiresConfirmation()->modalHeading('Aktifkan Kembali Akun')
                ->modalDescription('Persetujuan penerbit dan peran akun tetap berlaku.')
                ->modalSubmitActionLabel('Aktifkan Kembali')->modalCancelActionLabel('Batal')
                ->action(fn () => $this->changeStatus('active')),
        ];
    }

    protected function changeStatus(string $status, ?string $reason = null): void
    {
        $actor = Filament::auth()->user();
        abort_unless($actor instanceof User, 403);
        try {
            app(ChangeAccountStatus::class)->handle($actor, $this->getRecord()->id, $status, $this->accountVersion, $reason);
        } catch (ValidationException $exception) {
            $this->getRecord()->refresh();
            if (isset($exception->errors()['status'])) {
                Notification::make()->title($exception->errors()['status'][0])->warning()->send();

                return;
            }
            throw $exception;
        }
        $this->getRecord()->refresh();
        $this->accountVersion = $this->getRecord()->account_version;
        Notification::make()->title('Status akun berhasil diperbarui')->success()->send();
    }
}
