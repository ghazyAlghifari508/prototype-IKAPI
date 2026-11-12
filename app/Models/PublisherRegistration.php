<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $user_id
 * @property string $approval_status
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
}
