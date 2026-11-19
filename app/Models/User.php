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
        ];
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
