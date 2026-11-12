<?php

use App\Models\PublisherRegistrationReview;
use App\Models\User;
use App\Notifications\AccountStatusChanged;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Notifications\Events\NotificationSent;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Symfony\Component\Process\Process;

uses(DatabaseMigrations::class);

test('concurrent suspensions produce one versioned change audit and deliverable queue job', function () {
    $actor = User::factory()->create();
    $actor->givePermissionTo([
        Permission::findOrCreate('access-admin-panel', 'web'),
        Permission::findOrCreate('manage-user-accounts', 'web'),
    ]);
    $target = User::factory()->create();
    $target->assignRole(Role::findOrCreate('buyer', 'web'));
    $code = <<<'PHP'
    require 'vendor/autoload.php';
    $app = require 'bootstrap/app.php';
    $app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
    echo "ready\n";
    try {
        app(App\Actions\Accounts\ChangeAccountStatus::class)->handle(
            App\Models\User::findOrFail((int) $argv[1]), (int) $argv[2], 'suspended', 0, 'Pelanggaran ketentuan.',
        );
        echo "changed\n";
    } catch (Illuminate\Validation\ValidationException $exception) {
        echo "stale\n";
    }
    PHP;
    $connection = config('database.connections.pgsql');
    $environment = [
        'APP_ENV' => 'testing', 'CACHE_STORE' => 'array', 'DB_CONNECTION' => 'pgsql', 'DB_URL' => '',
        'DB_HOST' => (string) $connection['host'], 'DB_PORT' => (string) $connection['port'],
        'DB_DATABASE' => (string) $connection['database'], 'DB_USERNAME' => (string) $connection['username'],
        'DB_PASSWORD' => (string) $connection['password'],
    ];
    $workers = [];
    DB::beginTransaction();
    try {
        DB::table('users')->where('id', $target->id)->lockForUpdate()->first();
        for ($attempt = 0; $attempt < 2; $attempt++) {
            $worker = new Process([PHP_BINARY, '-r', $code, (string) $actor->id, (string) $target->id], base_path(), $environment);
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
        $output = implode('', array_map(fn (Process $worker) => $worker->getOutput(), $workers));
        expect(substr_count($output, 'changed'))->toBe(1);
        expect(substr_count($output, 'stale'))->toBe(1);
        expect($target->fresh()->account_version)->toBe(1);
        expect($target->fresh()->account_status)->toBe('suspended');
        expect(PublisherRegistrationReview::count())->toBe(1);
        expect(DB::table('jobs')->count())->toBe(1);
        config(['mail.account_status_mailer' => 'array']);
        Event::fake([NotificationSent::class]);
        $this->artisan('queue:work', ['connection' => 'database', '--once' => true, '--tries' => 1])->assertSuccessful();
        expect(DB::table('jobs')->count())->toBe(0);
        expect(DB::table('failed_jobs')->count())->toBe(0);
        Event::assertDispatched(NotificationSent::class, fn (NotificationSent $event) => $event->notification instanceof AccountStatusChanged
            && $event->notifiable->id === $target->id && $event->notification->status === 'suspended');
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
