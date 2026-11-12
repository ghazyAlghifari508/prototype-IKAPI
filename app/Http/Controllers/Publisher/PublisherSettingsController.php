<?php

namespace App\Http\Controllers\Publisher;

use App\Http\Controllers\Controller;
use App\Http\Requests\Publisher\UpdatePublisherSettingsRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class PublisherSettingsController extends Controller
{
    public function edit(Request $request): Response
    {
        $user = $this->publisherUser($request);
        $registration = $user->publisherRegistration()->with('bankAccount')->firstOrFail();
        $bankAccount = $registration->bankAccount;

        return Inertia::render('publisher/settings', [
            'profile' => [
                'publisher_name' => $registration->publisher_name,
                'responsible_person' => $registration->responsible_person,
                'email' => $user->email,
                'phone' => $registration->phone,
                'address' => $registration->address,
                'ikapi_member_number' => $registration->ikapi_member_number,
            ],
            'bankAccount' => $bankAccount ? [
                'bank_code' => $bankAccount->bank_code,
                'bank_name' => $bankAccount->bank_name,
                'account_number' => $bankAccount->account_number,
                'account_number_masked' => $bankAccount->maskedAccountNumber(),
                'account_holder' => $bankAccount->account_holder,
            ] : null,
        ]);
    }

    public function update(UpdatePublisherSettingsRequest $request): RedirectResponse
    {
        $user = $this->publisherUser($request);
        $validated = $request->validated();

        DB::transaction(function () use ($user, $validated): void {
            $registration = $user->publisherRegistration()
                ->lockForUpdate()
                ->firstOrFail();

            $registration->update([
                'publisher_name' => $validated['publisher_name'],
                'responsible_person' => $validated['responsible_person'],
                'phone' => $validated['phone'],
                'address' => $validated['address'],
                'ikapi_member_number' => $validated['ikapi_member_number'],
            ]);

            $bankFields = ['bank_code', 'bank_name', 'account_number', 'account_holder'];
            $hasBankInput = collect($bankFields)->contains(
                fn (string $field): bool => filled($validated[$field] ?? null),
            );

            if ($hasBankInput) {
                $registration->bankAccount()->updateOrCreate([], [
                    'bank_code' => trim((string) $validated['bank_code']),
                    'bank_name' => trim((string) $validated['bank_name']),
                    'account_number' => trim((string) $validated['account_number']),
                    'account_holder' => trim((string) $validated['account_holder']),
                ]);
            }
        });

        return to_route('publisher.settings.edit')
            ->with('status', 'Profil dan rekening berhasil diperbarui.');
    }

    private function publisherUser(Request $request): User
    {
        $user = $request->user();

        abort_unless($user instanceof User, 403);

        return $user;
    }
}
