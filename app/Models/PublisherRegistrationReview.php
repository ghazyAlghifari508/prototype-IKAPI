<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int|null $publisher_registration_id
 * @property int|null $target_user_id
 * @property string|null $action
 * @property string|null $reason
 * @property int $actor_id
 * @property string $previous_status
 * @property string $new_status
 * @property string|null $rejection_reason
 * @property Carbon $created_at
 */
class PublisherRegistrationReview extends Model
{
    public const UPDATED_AT = null;

    protected $guarded = ['id'];

    /** @return BelongsTo<PublisherRegistration, $this> */
    public function publisherRegistration(): BelongsTo
    {
        return $this->belongsTo(PublisherRegistration::class);
    }

    /** @return BelongsTo<User, $this> */
    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'actor_id');
    }

    /** @return BelongsTo<User, $this> */
    public function targetUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'target_user_id');
    }
}
