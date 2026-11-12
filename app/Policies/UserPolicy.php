<?php

namespace App\Policies;

use App\Models\User;
use Filament\Facades\Filament;

class UserPolicy
{
    public function viewAny(User $actor): bool
    {
        return $actor->canAccessPanel(Filament::getPanel('admin'))
            && $actor->checkPermissionTo('manage-user-accounts', 'web');
    }

    public function view(User $actor, User $target): bool
    {
        return $this->viewAny($actor) && $target->hasAnyRole(['buyer', 'publisher']);
    }

    public function changeAccountStatus(User $actor, User $target): bool
    {
        return $this->view($actor, $target)
            && $actor->id !== $target->id
            && ! $target->isProtectedAdministrator()
            && ! $target->roles()->whereNotIn('name', ['buyer', 'publisher'])->exists();
    }

    public function create(User $actor): bool
    {
        return false;
    }

    public function update(User $actor, User $target): bool
    {
        return false;
    }

    public function delete(User $actor, User $target): bool
    {
        return false;
    }
}
