<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        Role::findOrCreate('buyer', 'web');
        Role::findOrCreate('publisher', 'web');

        if (app()->environment(['local', 'testing'])) {
            $this->call(DemoAccountsSeeder::class);
        }
    }
}
