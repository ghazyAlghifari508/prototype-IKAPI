<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\DB;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'address',
        'favorite_categories',
        'avatar_path',
        'avatar_preset',
        'email_verified_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'favorite_categories' => 'array',
        ];
    }

    /**
     * Get 2-letter uppercase initials from user name.
     */
    public function getInitialsAttribute(): string
    {
        $words = preg_split('/\s+/', trim($this->name));
        if (count($words) >= 2) {
            return strtoupper(mb_substr($words[0], 0, 1) . mb_substr($words[1], 0, 1));
        }

        return strtoupper(mb_substr($this->name, 0, 2));
    }

    /**
     * Get full URL or asset path to avatar.
     */
    public function getAvatarUrlAttribute(): ?string
    {
        if ($this->avatar_path && file_exists(public_path($this->avatar_path))) {
            return asset($this->avatar_path);
        }

        return null;
    }

    public function roles()
    {
        return $this->belongsToMany(Role::class, 'model_has_roles', 'model_id', 'role_id');
    }

    public function assignRole(string|Role $role): void
    {
        $roleModel = is_string($role) ? Role::where('name', $role)->first() : $role;

        if ($roleModel) {
            DB::table('model_has_roles')->updateOrInsert([
                'role_id' => $roleModel->id,
                'model_type' => static::class,
                'model_id' => $this->id,
            ]);
            $this->load('roles');
        }
    }

    public function hasRole(string $role): bool
    {
        return $this->roles->contains('name', $role);
    }

    public function isBuyer(): bool
    {
        return $this->hasRole('buyer');
    }

    public function isPublisher(): bool
    {
        return $this->hasRole('publisher');
    }

    public function isAdmin(): bool
    {
        return $this->hasRole('admin');
    }

    public function publisherRegistration()
    {
        return $this->hasOne(PublisherRegistration::class);
    }

    public function canAccessPublisherPortal(): bool
    {
        if (! $this->isPublisher()) {
            return false;
        }

        return $this->publisherRegistration?->status === 'approved';
    }
}
