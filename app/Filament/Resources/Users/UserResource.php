<?php

namespace App\Filament\Resources\Users;

use App\Filament\Resources\Users\Pages\ListUsers;
use App\Filament\Resources\Users\Pages\ViewUser;
use App\Models\User;
use Filament\Actions\ViewAction;
use Filament\Infolists\Components\RepeatableEntry;
use Filament\Infolists\Components\TextEntry;
use Filament\Resources\Pages\PageRegistration;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Spatie\Permission\Models\Role;

/** @extends resource<User> */
class UserResource extends Resource
{
    protected static ?string $model = User::class;

    protected static ?string $navigationLabel = 'Kelola Pengguna';

    protected static ?string $modelLabel = 'Pengguna';

    protected static ?string $pluralModelLabel = 'Kelola Pengguna';

    protected static ?string $recordTitleAttribute = 'name';

    /** @return Builder<User> */
    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()->whereHas('roles', fn (Builder $query) => $query->whereIn('name', ['buyer', 'publisher']));
    }

    /** @return array<string, string> */
    public static function statusLabels(): array
    {
        return ['active' => 'Aktif', 'suspended' => 'Nonaktif'];
    }

    public static function table(Table $table): Table
    {
        return $table->searchPlaceholder('Cari nama atau email...')->columns([
            TextColumn::make('name')->label('Nama')->searchable()->sortable(),
            TextColumn::make('email')->label('Email')->searchable(),
            TextColumn::make('roles.name')->label('Peran')
                ->formatStateUsing(fn (string $state): string => ['buyer' => 'Pembeli', 'publisher' => 'Penerbit'][$state] ?? $state),
            TextColumn::make('account_status')->label('Status Akun')
                ->formatStateUsing(fn (string $state): string => self::statusLabels()[$state] ?? $state),
        ])->filters([
            SelectFilter::make('role')->label('Peran')
                ->relationship('roles', 'name', fn (Builder $query) => $query->whereIn('name', ['buyer', 'publisher']))
                ->getOptionLabelFromRecordUsing(fn (Role $record): string => $record->name === 'buyer' ? 'Pembeli' : 'Penerbit'),
            SelectFilter::make('account_status')->label('Status Akun')->options(self::statusLabels()),
        ])->recordActions([ViewAction::make()->label('Detail')])
            ->defaultSort('name')->emptyStateHeading('Tidak ada pengguna')->emptyStateDescription('Tidak ada pengguna yang sesuai dengan pencarian dan filter Anda.');
    }

    public static function infolist(Schema $schema): Schema
    {
        return $schema->columns(2)->components([
            TextEntry::make('name')->label('Nama'),
            TextEntry::make('email')->label('Email'),
            TextEntry::make('roles.name')->label('Peran')->formatStateUsing(fn (string $state): string => ['buyer' => 'Pembeli', 'publisher' => 'Penerbit'][$state] ?? $state),
            TextEntry::make('account_status')->label('Status Akun')
                ->formatStateUsing(fn (string $state): string => self::statusLabels()[$state] ?? $state),
            TextEntry::make('publisherRegistration.approval_status')->label('Status Pendaftaran Penerbit')
                ->placeholder('Tidak berlaku')
                ->formatStateUsing(fn (string $state): string => ['pending' => 'Menunggu', 'approved' => 'Disetujui', 'rejected' => 'Ditolak'][$state] ?? $state),
            RepeatableEntry::make('accountActions')->label('Riwayat Tindakan')->columnSpanFull()->columns(2)->schema([
                TextEntry::make('created_at')->label('Waktu')->dateTime('d M Y H:i'),
                TextEntry::make('actor.name')->label('Administrator'),
                TextEntry::make('action')->label('Tindakan')->formatStateUsing(fn (string $state): string => [
                    'suspension' => 'Penonaktifan', 'reactivation' => 'Pengaktifan Kembali', 'approval' => 'Persetujuan Penerbit', 'rejection' => 'Penolakan Penerbit',
                ][$state] ?? $state),
                TextEntry::make('reason')->label('Alasan')->placeholder('—'),
            ]),
        ]);
    }

    /** @return array<string, PageRegistration> */
    public static function getPages(): array
    {
        return ['index' => ListUsers::route('/'), 'view' => ViewUser::route('/{record}')];
    }
}
