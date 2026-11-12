<?php

namespace App\Policies;

use App\Models\Book;
use App\Models\User;

class BookPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->canAccessPublisherPortal();
    }

    public function view(User $user, Book $book): bool
    {
        return $this->owns($user, $book);
    }

    public function create(User $user): bool
    {
        return $user->canAccessPublisherPortal();
    }

    public function update(User $user, Book $book): bool
    {
        return $this->owns($user, $book);
    }

    private function owns(User $user, Book $book): bool
    {
        return $user->canAccessPublisherPortal()
            && $user->publisherRegistration?->id === $book->publisher_registration_id;
    }
}
