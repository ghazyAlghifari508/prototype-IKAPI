<?php

use App\Models\PublisherRegistrationReview;
use App\Models\User;
use App\Notifications\PublisherRegistrationDecided;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Notifications\Events\NotificationSent;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Symfony\Component\Process\Process;

uses(DatabaseMigrations::class);

test('two concurrent administrators produce exactly one committed decision audit and queued email', function () {
    $admin = User::factory()->create();
    $admin->givePermissionTo([
        Permission::findOrCreate('access-admin-panel', 'web'),
        Permission::findOrCreate('review-publisher-registrations', 'web'),
    ]);
    $publisher = User::factory()->create();
    $publisher->assignRole(Role::findOrCreate('publisher', 'web'));
    $registration = $publisher->publisherRegistration()->create([
        'publisher_name' => 'Penerbit Uji Bersamaan',
        'responsible_person' => 'Rina',
        'phone' => '+6281234567890',
        'address' => 'Bandung',
        'ikapi_member_number' => 'IKAPI-1',
    ]);

    $workerCode = <<<'PHP'
    require 'vendor/autoload.php';
    $app = require 'bootstrap/app.php';
    $app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
    echo "ready\n";
    try {
        app(App\Actions\Publishers\ReviewPublisherRegistration::class)->handle(
            App\Models\User::findOrFail((int) $argv[1]), (int) $argv[2], $argv[3], 'Dokumen tidak sesuai.',
        );
        echo "decided\n";
    } catch (Illuminate\Validation\ValidationException $exception) {
        echo "stale\n";
    }
    PHP;

    $connection = config('database.connections.pgsql');
    $environment = [
        'APP_ENV' => 'testing',
        'CACHE_STORE' => 'array',
        'DB_CONNECTION' => 'pgsql',
        'DB_URL' => '',
        'DB_HOST' => (string) $connection['host'],
        'DB_PORT' => (string) $connection['port'],
        'DB_DATABASE' => (string) $connection['database'],
        'DB_USERNAME' => (string) $connection['username'],
        'DB_PASSWORD' => (string) $connection['password'],
    ];
    $workers = [];
    DB::beginTransaction();
    try {
        // Both workers start while the parent holds this row, forcing real lock contention.
        DB::table('publisher_registrations')->where('id', $registration->id)->lockForUpdate()->first();
        foreach (['approved', 'rejected'] as $status) {
            $worker = new Process([PHP_BINARY, '-r', $workerCode, (string) $admin->id, (string) $registration->id, $status], base_path(), $environment);
            $worker->setTimeout(60);
            $worker->start();
            $workers[] = $worker;
        }
        foreach ($workers as $worker) {
            expect($worker->waitUntil(fn ($type, $output) => str_contains($output, 'ready')))->toBeTrue();
        }
        DB::commit();
        foreach ($workers as $worker) {
            $worker->wait();
            expect($worker->isSuccessful())->toBeTrue($worker->getErrorOutput());
        }
        $outputs = implode('', array_map(fn (Process $worker) => $worker->getOutput(), $workers));
        expect(substr_count($outputs, 'decided'))->toBe(1);
        expect(substr_count($outputs, 'stale'))->toBe(1);
        expect(PublisherRegistrationReview::count())->toBe(1);
        expect(DB::table('jobs')->count())->toBe(1);
        expect($registration->fresh()->approval_status)->toBe(PublisherRegistrationReview::firstOrFail()->new_status);

        // Process the committed, encrypted job through the real worker and an in-memory mail transport.
        config(['mail.publisher_approval_mailer' => 'array']);
        Event::fake([NotificationSent::class]);
        $this->artisan('queue:work', ['connection' => 'database', '--once' => true, '--tries' => 1])->assertSuccessful();
        expect(DB::table('jobs')->count())->toBe(0);
        expect(DB::table('failed_jobs')->count())->toBe(0);
        Event::assertDispatched(NotificationSent::class, fn (NotificationSent $event) => $event->notification instanceof PublisherRegistrationDecided
            && $event->notifiable->id === $publisher->id
            && $event->notification->status === $registration->fresh()->approval_status);
    } finally {
        if (DB::transactionLevel() > 0) {
            DB::rollBack();
        }
        foreach ($workers as $worker) {
            if ($worker->isRunning()) {
                $worker->stop();
            }
        }
    }
});
