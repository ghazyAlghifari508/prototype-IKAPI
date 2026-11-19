<?php

namespace Database\Seeders;

use App\Models\PublisherRegistration;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create roles
        $buyerRole    = Role::firstOrCreate(['name' => 'buyer'],     ['guard_name' => 'web']);
        $publisherRole = Role::firstOrCreate(['name' => 'publisher'], ['guard_name' => 'web']);
        $adminRole    = Role::firstOrCreate(['name' => 'admin'],     ['guard_name' => 'web']);

        // ─── 1. Buyer demo accounts ───────────────────────────────────────
        $buyerAccounts = [
            ['name' => 'Pembaca Demo',  'email' => 'buyer.demo@ikapi.test',  'phone' => '081234567890'],
            ['name' => 'Pembeli IKAPI', 'email' => 'pembeli@demo.ikapi.id',  'phone' => '081298765432'],
        ];

        foreach ($buyerAccounts as $data) {
            $user = User::firstOrCreate(
                ['email' => $data['email']],
                [
                    'name'              => $data['name'],
                    'phone'             => $data['phone'],
                    'email_verified_at' => now(),
                    'password'          => Hash::make('demo12345'),
                ]
            );
            $user->assignRole('buyer');
        }

        // ─── 2. Publisher demo accounts (approved) ────────────────────────
        $approvedPublishers = [
            [
                'name'   => 'Penerbit Demo IKAPI',
                'email'  => 'publisher.demo@ikapi.test',
                'phone'  => '081234567802',
                'type'   => 'company',
                'npwp'   => '01.234.567.8-910.000',
            ],
            [
                'name'   => 'PT Penerbit Nusantara',
                'email'  => 'penerbit@demo.ikapi.id',
                'phone'  => '081211223344',
                'type'   => 'company',
                'npwp'   => '09.876.543.2-100.000',
            ],
        ];

        foreach ($approvedPublishers as $data) {
            $user = User::firstOrCreate(
                ['email' => $data['email']],
                [
                    'name'              => $data['name'],
                    'phone'             => $data['phone'],
                    'email_verified_at' => now(),
                    'password'          => Hash::make('demo12345'),
                ]
            );
            $user->assignRole('publisher');

            PublisherRegistration::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'publisher_name'  => $data['name'],
                    'publisher_type'  => $data['type'],
                    'npwp'            => $data['npwp'],
                    'phone'           => $data['phone'],
                    'address'         => 'Jl. Braga No. 100, Bandung, Jawa Barat',
                    'status'          => 'approved',
                    'approved_at'     => now(),
                ]
            );
        }

        // ─── 3. Publisher pending demo account ───────────────────────────
        $pendingUser = User::firstOrCreate(
            ['email' => 'pending@demo.ikapi.id'],
            [
                'name'              => 'Penerbit Mandiri',
                'phone'             => '081255667788',
                'email_verified_at' => now(),
                'password'          => Hash::make('demo12345'),
            ]
        );
        $pendingUser->assignRole('publisher');

        PublisherRegistration::updateOrCreate(
            ['user_id' => $pendingUser->id],
            [
                'publisher_name' => 'Penerbit Mandiri',
                'publisher_type' => 'individual',
                'phone'          => '081255667788',
                'address'        => 'Jl. Asia Afrika No. 50, Bandung',
                'status'         => 'pending',
            ]
        );

        // ─── 4. Administrator demo accounts ──────────────────────────────
        $adminAccounts = [
            ['name' => 'Admin Utama IKAPI',  'email' => 'admin@demo.ikapi.id',    'phone' => '081100110011'],
            ['name' => 'Administrator Demo', 'email' => 'admin.demo@ikapi.test',  'phone' => '081122334455'],
        ];

        foreach ($adminAccounts as $data) {
            $user = User::firstOrCreate(
                ['email' => $data['email']],
                [
                    'name'              => $data['name'],
                    'phone'             => $data['phone'],
                    'email_verified_at' => now(),
                    'password'          => Hash::make('demo12345'),
                ]
            );
            $user->assignRole('admin');
        }
    }
}
