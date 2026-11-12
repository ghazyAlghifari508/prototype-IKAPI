<?php

namespace App\Models;

use App\Notifications\PasswordResetNotification;
use Database\Factories\UserFactory;
use Filament\Models\Contracts\FilamentUser;
use Filament\Panel;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;
use Laravel\Fortify\Contracts\PasskeyUser;
use Laravel\Fortify\PasskeyAuthenticatable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Spatie\Permission\Traits\HasRoles;

/**
 * @property int $id
 * @property string $name
 * @property string $email
 * @property string|null $phone
 * @property string|null $address
 * @property string|null $avatar_path
 * @property string|null $avatar_preset
 * @property string|null $avatar_url
 * @property Carbon|null $email_verified_at
 * @property string $password
 * @property string $account_status
 * @property int $account_version
 * @property string|null $two_factor_secret
 * @property string|null $two_factor_recovery_codes
 * @property Carbon|null $two_factor_confirmed_at
 * @property string|null $remember_token
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['name', 'email', 'phone', 'address', 'password'])]
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'two_factor_confirmed_at', 'remember_token'])]
class User extends Authenticatable implements FilamentUser, MustVerifyEmail, PasskeyUser
{
    protected $attributes = ['account_status' => 'active', 'account_version' => 0];

    public const AVATAR_PRESETS = ['cat', 'dog', 'panda', 'frog', 'rabbit', 'owl', 'bear', 'koala'];

    /** @use HasFactory<UserFactory> */
    use HasFactory, HasRoles, Notifiable, PasskeyAuthenticatable, TwoFactorAuthenticatable;

    public function canAccessPanel(Panel $panel): bool
    {
        return $panel->getId() === 'admin'
            && $this->isActive()
            && $this->hasVerifiedEmail()
            && $this->checkPermissionTo('access-admin-panel');
    }

    public function getAvatarUrlAttribute(): ?string
    {
        if (! $this->avatar_path) {
            return null;
        }

        return Storage::disk('public')->url($this->avatar_path);
    }

    public function sendPasswordResetNotification($token): void
    {
        $this->notify(new PasswordResetNotification($token));
    }

    /**
     * @return HasOne<PublisherRegistration, $this>
     */
    public function publisherRegistration(): HasOne
    {
        return $this->hasOne(PublisherRegistration::class);
    }

    public function isPublisherApproved(): bool
    {
        return $this->hasRole('publisher')
            && $this->publisherRegistration?->approval_status === 'approved';
    }

    public function canAccessPublisherPortal(): bool
    {
        return $this->isActive() && $this->isPublisherApproved();
    }

    public function isActive(): bool
    {
        return $this->account_status === 'active';
    }

    public function isProtectedAdministrator(): bool
    {
        return $this->hasAnyRole(['admin', 'administrator', 'super-admin'])
            || $this->checkPermissionTo('access-admin-panel', 'web')
            || $this->checkPermissionTo('review-publisher-registrations', 'web')
            || $this->checkPermissionTo('manage-user-accounts', 'web');
    }

    /** @return HasMany<PublisherRegistrationReview, $this> */
    public function accountActions(): HasMany
    {
        return $this->hasMany(PublisherRegistrationReview::class, 'target_user_id');
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'account_version' => 'integer',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }
}
