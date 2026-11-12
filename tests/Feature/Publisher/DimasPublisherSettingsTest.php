<?php

use App\Models\PublisherBankAccount;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

function dimasApprovedPublisher(string $email = 'publisher@example.test'): User
{
    $user = User::factory()->create([
        'email' => $email,
    ]);
    $user->assignRole(Role::findOrCreate('publisher', 'web'));
    $user->publisherRegistration()->create([
        'publisher_name' => 'Penerbit Uji',
        'responsible_person' => 'Penanggung Jawab',
        'phone' => '+6281234567890',
        'address' => 'Bandung',
        'ikapi_member_number' => 'IKAPI-TEST-001',
        'legal_number' => 'AHU-TEST-001',
        'approval_status' => 'approved',
    ]);

    return $user->fresh();
}

test('approved publisher can update only its own profile and bank account', function () {
    $publisher = dimasApprovedPublisher();

    $response = $this->actingAs($publisher)->put(route('publisher.settings.update'), [
        'publisher_name' => 'Penerbit Uji Baru',
        'responsible_person' => 'Penanggung Jawab Baru',
        'phone' => '+6281234567891',
        'address' => 'Bandung, Jawa Barat',
        'ikapi_member_number' => 'IKAPI-TEST-001',
        'bank_code' => 'BCA',
        'bank_name' => 'Bank Central Asia',
        'account_number' => '1234567890',
        'account_holder' => 'Penerbit Uji Baru',
    ]);

    $response->assertRedirect(route('publisher.settings.edit'));
    expect($publisher->fresh()->publisherRegistration->publisher_name)->toBe('Penerbit Uji Baru');
    $account = PublisherBankAccount::query()->firstOrFail();
    expect($account->account_number)->toBe('1234567890')
        ->and($account->maskedAccountNumber())->toBe('••••••7890');
    expect($publisher->fresh()->publisherRegistration->approval_status)->toBe('approved');
});

test('publisher settings rejects incomplete bank details', function () {
    $publisher = dimasApprovedPublisher('incomplete@example.test');

    $this->actingAs($publisher)
        ->from(route('publisher.settings.edit'))
        ->put(route('publisher.settings.update'), [
            'publisher_name' => 'Penerbit Uji',
            'responsible_person' => 'Penanggung Jawab',
            'phone' => '+6281234567890',
            'address' => 'Bandung',
            'ikapi_member_number' => 'IKAPI-TEST-001',
            'bank_code' => 'BCA',
        ])
        ->assertSessionHasErrors(['bank_name', 'account_number', 'account_holder']);

    expect(PublisherBankAccount::query()->count())->toBe(0);
});

test('pending publisher cannot open publisher settings', function () {
    $publisher = dimasApprovedPublisher('pending@example.test');
    $publisher->publisherRegistration()->update(['approval_status' => 'pending']);

    $this->actingAs($publisher)
        ->get(route('publisher.settings.edit'))
        ->assertRedirect(route('publisher.login'));
});
