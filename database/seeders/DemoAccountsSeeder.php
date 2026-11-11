<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class DemoAccountsSeeder extends Seeder
{
    public const PASSWORD = 'IkapiDemo!2026';

    public function run(): void
    {
        $buyerRole = Role::findOrCreate('buyer', 'web');
        $publisherRole = Role::findOrCreate('publisher', 'web');

        $buyer = User::firstOrCreate(
            ['email' => 'buyer.demo@ikapi.test'],
            [
                'name' => 'Pembaca Demo',
                'phone' => '+6281234567801',
                'email_verified_at' => now(),
                'password' => Hash::make(self::PASSWORD),
            ],
        );

        if (! $buyer->hasVerifiedEmail()) {
            $buyer->forceFill(['email_verified_at' => now()])->save();
        }

        $buyer->assignRole($buyerRole);

        $publisher = User::firstOrCreate(
            ['email' => 'publisher.demo@ikapi.test'],
            [
                'name' => 'Penerbit Demo',
                'phone' => '+6281234567802',
                'email_verified_at' => now(),
                'password' => Hash::make(self::PASSWORD),
            ],
        );

        if (! $publisher->hasVerifiedEmail()) {
            $publisher->forceFill(['email_verified_at' => now()])->save();
        }

        $publisher->assignRole($publisherRole);
        $publisher->publisherRegistration()->updateOrCreate(
            ['user_id' => $publisher->id],
            [
                'publisher_name' => 'Penerbit Demo IKAPI',
                'responsible_person' => 'Penerbit Demo',
                'phone' => '+6281234567802',
                'address' => 'Bandung, Jawa Barat',
                'ikapi_member_number' => 'IKAPI-DEMO-001',
                'legal_number' => 'DEMO-AHU-001',
                'verification_document_path' => null,
                'approval_status' => 'approved',
                'rejection_reason' => null,
            ],
        );
    }
}
