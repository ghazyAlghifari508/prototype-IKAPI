<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PublisherRegistration extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'publisher_name',
        'publisher_type',
        'npwp',
        'siup',
        'address',
        'phone',
        'website',
        'description',
        'status',          // pending | approved | rejected
        'rejection_reason',
        'approved_at',
    ];

    protected $casts = [
        'approved_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isApproved(): bool
    {
        return $this->status === 'approved';
    }

    public function isRejected(): bool
    {
        return $this->status === 'rejected';
    }
}
