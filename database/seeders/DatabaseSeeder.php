<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        Role::findOrCreate('buyer', 'web');
        Role::findOrCreate('publisher', 'web');
        Permission::findOrCreate('access-admin-panel', 'web');
        Permission::findOrCreate('review-publisher-registrations', 'web');
        Permission::findOrCreate('manage-user-accounts', 'web');

        // WithoutModelEvents suppresses Spatie's normal cache invalidation.
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        if (app()->environment(['local', 'testing'])) {
            $this->call(DemoAccountsSeeder::class);
        }
    }
}
