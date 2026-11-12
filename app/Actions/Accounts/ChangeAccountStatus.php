<?php

namespace App\Actions\Accounts;

use App\Models\PublisherRegistrationReview;
use App\Models\User;
use App\Notifications\AccountStatusChanged;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use LogicException;

class ChangeAccountStatus
{
    public function handle(User $actor, int $targetId, string $status, int $expectedVersion, ?string $reason = null): PublisherRegistrationReview
    {
        return DB::transaction(function () use ($actor, $targetId, $status, $expectedVersion, $reason): PublisherRegistrationReview {
            $target = User::query()->lockForUpdate()->findOrFail($targetId);
            Gate::forUser(User::query()->findOrFail($actor->id))->authorize('changeAccountStatus', $target);
            $reason = $reason === null ? null : trim($reason);
            Validator::make(['status' => $status, 'reason' => $reason], [
                'status' => ['required', Rule::in(['active', 'suspended'])],
                'reason' => [Rule::requiredIf($status === 'suspended'), 'nullable', 'string', 'max:2000'],
            ], ['reason.required' => 'Alasan penonaktifan wajib diisi.'])->validate();

            if (! in_array($target->account_status, ['active', 'suspended'], true)
                || $target->account_version !== $expectedVersion || $target->account_status === $status) {
                throw ValidationException::withMessages(['status' => 'Status akun telah berubah. Muat ulang halaman sebelum melanjutkan.']);
            }

            if (config('queue.connections.database.driver') !== 'database'
                || (config('queue.connections.database.connection') ?? config('database.default')) !== config('database.default')) {
                throw new LogicException('Antrean status akun harus menggunakan database aplikasi.');
            }

            $review = PublisherRegistrationReview::query()->create([
                'target_user_id' => $target->id,
                'actor_id' => $actor->id,
                'action' => $status === 'suspended' ? 'suspension' : 'reactivation',
                'previous_status' => $target->account_status,
                'new_status' => $status,
                'reason' => $reason,
            ]);
            $target->forceFill([
                'account_status' => $status,
                'account_version' => $target->account_version + 1,
                'remember_token' => Str::random(60),
            ])->save();

            if (config('session.driver') === 'database') {
                DB::connection(config('session.connection'))->table((string) config('session.table', 'sessions'))
                    ->where('user_id', $target->id)->delete();
            }
            $target->notify(new AccountStatusChanged($status, $reason));

            return $review;
        });
    }
}
