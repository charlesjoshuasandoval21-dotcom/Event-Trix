<?php

namespace App\Policies;

use App\Models\Registration;
use App\Models\User;

class RegistrationPolicy
{
    public function cancel(User $user, Registration $registration): bool
    {
        return $user->isStudent() && $registration->user_id === $user->id;
    }
}
