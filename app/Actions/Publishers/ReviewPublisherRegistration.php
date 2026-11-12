<?php

namespace App\Actions\Publishers;

use App\Models\PublisherRegistration;
use App\Models\PublisherRegistrationReview;
use App\Models\User;
use App\Notifications\PublisherRegistrationDecided;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use LogicException;

class ReviewPublisherRegistration
{
    public function handle(User $actor, int $registrationId, string $status, ?string $reason = null): PublisherRegistrationReview
    {
        return DB::transaction(function () use ($actor, $registrationId, $status, $reason): PublisherRegistrationReview {
            $registration = PublisherRegistration::query()->lockForUpdate()->findOrFail($registrationId);
            // Re-read the actor so a previously loaded permission relation cannot authorize this decision.
            Gate::forUser(User::query()->findOrFail($actor->id))->authorize('decide', $registration);

            $reason = $reason === null ? null : trim($reason);
            Validator::make(['status' => $status, 'reason' => $reason], [
                'status' => ['required', Rule::in(['approved', 'rejected'])],
                'reason' => [Rule::requiredIf($status === 'rejected'), 'nullable', 'string', 'max:2000'],
            ], ['reason.required' => 'Alasan penolakan wajib diisi.'])->validate();

            if ($registration->approval_status !== 'pending') {
                throw ValidationException::withMessages([
                    'status' => 'Permohonan ini sudah diputuskan. Muat ulang halaman untuk melihat keputusan terbaru.',
                ]);
            }

            // The database queue shares this transaction: workers cannot see the job before commit.
            // A failed enqueue rolls back the decision and audit instead of losing its notification.
            if (config('queue.connections.database.driver') !== 'database'
                || (config('queue.connections.database.connection') ?? config('database.default')) !== config('database.default')) {
                throw new LogicException('Antrean database persetujuan harus menggunakan koneksi database aplikasi.');
            }

            $rejectionReason = $status === 'rejected' ? $reason : null;
            $registration->forceFill([
                'approval_status' => $status,
                'rejection_reason' => $rejectionReason,
            ])->save();

            $review = PublisherRegistrationReview::query()->create([
                'publisher_registration_id' => $registration->id,
                'target_user_id' => $registration->user_id,
                'action' => $status === 'approved' ? 'approval' : 'rejection',
                'reason' => $rejectionReason,
                'actor_id' => $actor->id,
                'previous_status' => 'pending',
                'new_status' => $status,
                'rejection_reason' => $rejectionReason,
            ]);

            $registration->user->notify(new PublisherRegistrationDecided(
                $registration->publisher_name, $status, $rejectionReason,
            ));

            return $review;
        });
    }
}
