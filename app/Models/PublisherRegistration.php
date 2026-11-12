<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

/**
 * @property int $id
 * @property int $user_id
 * @property string $approval_status
 * @property string $publisher_name
 * @property string|null $verification_document_path
 * @property string|null $rejection_reason
 */
class PublisherRegistration extends Model
{
    protected $fillable = [
        'user_id',
        'publisher_name',
        'responsible_person',
        'phone',
        'address',
        'ikapi_member_number',
        'legal_number',
        'verification_document_path',
        'approval_status',
        'rejection_reason',
    ];

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function isApproved(): bool
    {
        return $this->approval_status === 'approved';
    }

    /** @return HasOne<PublisherRegistrationReview, $this> */
    public function review(): HasOne
    {
        return $this->hasOne(PublisherRegistrationReview::class);
    }

    /** @return HasOne<PublisherBankAccount, $this> */
    public function bankAccount(): HasOne
    {
        return $this->hasOne(PublisherBankAccount::class);
    }

    /** @return HasMany<Book, $this> */
    public function books(): HasMany
    {
        return $this->hasMany(Book::class);
    }
}
