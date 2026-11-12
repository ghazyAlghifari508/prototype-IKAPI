<?php

namespace App\Filament\Resources\PublisherRegistrations;

use App\Filament\Resources\PublisherRegistrations\Pages\ListPublisherRegistrations;
use App\Filament\Resources\PublisherRegistrations\Pages\ViewPublisherRegistration;
use App\Models\PublisherRegistration;
use Filament\Actions\ViewAction;
use Filament\Infolists\Components\TextEntry;
use Filament\Resources\Pages\PageRegistration;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

/** @extends resource<PublisherRegistration> */
class PublisherRegistrationResource extends Resource
{
    protected static ?string $model = PublisherRegistration::class;

    protected static ?string $navigationLabel = 'Pendaftaran Penerbit';

    protected static ?string $modelLabel = 'Pendaftaran Penerbit';

    protected static ?string $pluralModelLabel = 'Pendaftaran Penerbit';

    protected static ?string $recordTitleAttribute = 'publisher_name';

    /** @return array<string, string> */
    public static function statusLabels(): array
    {
        return ['pending' => 'Menunggu', 'approved' => 'Disetujui', 'rejected' => 'Ditolak'];
    }

    public static function table(Table $table): Table
    {
        return $table
            ->searchPlaceholder('Cari penerbit...')
            ->columns([
                TextColumn::make('publisher_name')->label('Penerbit')->searchable()->sortable(),
                TextColumn::make('responsible_person')->label('Penanggung Jawab')->searchable(),
                TextColumn::make('user.email')->label('Email')->searchable()->toggleable(),
                TextColumn::make('ikapi_member_number')->label('Nomor IKAPI')->searchable()->toggleable(),
                TextColumn::make('created_at')->label('Tanggal Pendaftaran')->dateTime('d M Y H:i')->sortable(),
                TextColumn::make('approval_status')->label('Status')
                    ->formatStateUsing(fn (string $state): string => self::statusLabels()[$state] ?? $state),
            ])
            ->filters([
                SelectFilter::make('approval_status')->label('Status')->options(self::statusLabels())->default('pending'),
            ])
            ->recordActions([ViewAction::make()->label('Detail')])
            ->defaultSort('created_at', 'asc')
            ->emptyStateHeading('Tidak ada pendaftaran penerbit')
            ->emptyStateDescription('Tidak ada permohonan yang sesuai dengan pencarian dan filter Anda.');
    }

    public static function infolist(Schema $schema): Schema
    {
        return $schema->columns(2)->components([
            TextEntry::make('publisher_name')->label('Nama Penerbit'),
            TextEntry::make('responsible_person')->label('Penanggung Jawab'),
            TextEntry::make('user.email')->label('Email'),
            TextEntry::make('phone')->label('Telepon'),
            TextEntry::make('address')->label('Alamat')->columnSpanFull(),
            TextEntry::make('ikapi_member_number')->label('Nomor Anggota IKAPI'),
            TextEntry::make('legal_number')->label('Nomor Legalitas')->placeholder('Tidak tersedia'),
            TextEntry::make('approval_status')->label('Status')
                ->formatStateUsing(fn (string $state): string => self::statusLabels()[$state] ?? $state),
            TextEntry::make('created_at')->label('Tanggal Pendaftaran')->dateTime('d M Y H:i'),
            TextEntry::make('rejection_reason')->label('Alasan Penolakan')->placeholder('—')->columnSpanFull(),
            TextEntry::make('review.actor.name')->label('Diputuskan Oleh')->placeholder('Belum diputuskan'),
            TextEntry::make('review.created_at')->label('Waktu Keputusan')->dateTime('d M Y H:i')->placeholder('Belum diputuskan'),
        ]);
    }

    /** @return array<string, PageRegistration> */
    public static function getPages(): array
    {
        return [
            'index' => ListPublisherRegistrations::route('/'),
            'view' => ViewPublisherRegistration::route('/{record}'),
        ];
    }
}
