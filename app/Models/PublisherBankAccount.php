<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $publisher_registration_id
 * @property string $bank_code
 * @property string $bank_name
 * @property string $account_number
 * @property string $account_holder
 */
class PublisherBankAccount extends Model
{
    protected $fillable = [
        'publisher_registration_id',
        'bank_code',
        'bank_name',
        'account_number',
        'account_holder',
    ];

    protected function casts(): array
    {
        return [
            'account_number' => 'encrypted:string',
        ];
    }

    /** @return BelongsTo<PublisherRegistration, $this> */
    public function publisherRegistration(): BelongsTo
    {
        return $this->belongsTo(PublisherRegistration::class);
    }

    public function maskedAccountNumber(): string
    {
        $number = $this->account_number;
        $visible = min(4, strlen($number));

        return str_repeat('•', max(0, strlen($number) - $visible)).substr($number, -$visible);
    }
}
