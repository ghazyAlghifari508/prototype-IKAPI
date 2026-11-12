<?php

namespace App\Policies;

use App\Models\PublisherRegistration;
use App\Models\User;
use Filament\Facades\Filament;

class PublisherRegistrationPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->canAccessPanel(Filament::getPanel('admin'))
            && $user->checkPermissionTo('review-publisher-registrations', 'web');
    }

    public function view(User $user, PublisherRegistration $registration): bool
    {
        return $this->viewAny($user);
    }

    public function decide(User $user, PublisherRegistration $registration): bool
    {
        return $this->viewAny($user) && $registration->user_id !== $user->id;
    }

    public function create(User $user): bool
    {
        return false;
    }

    public function update(User $user, PublisherRegistration $registration): bool
    {
        return false;
    }

    public function delete(User $user, PublisherRegistration $registration): bool
    {
        return false;
    }
}
