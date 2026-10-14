<?php

namespace App\Services;

use App\Enums\RegistrationStatus;
use App\Exceptions\RegistrationException;
use App\Models\Event;
use App\Models\Registration;
use App\Models\User;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Support\Facades\DB;

class RegistrationService
{
    public function register(User $user, int $eventId): Registration
    {
        try {
            return DB::transaction(function () use ($user, $eventId) {
                $event = Event::query()->lockForUpdate()->findOrFail($eventId);

                $activeCount = $event->registrations()
                    ->where('status', RegistrationStatus::Registered->value)
                    ->count();

                $existing = Registration::query()
                    ->where('user_id', $user->id)
                    ->where('event_id', $event->id)
                    ->first();

                if ($existing?->isActive()) {
                    throw new RegistrationException('You are already registered for this event.', 409, 'already_registered');
                }

                $availability = $event->registrationAvailability($activeCount);
                if (! $availability['open']) {
                    throw new RegistrationException($availability['message'], 422, $availability['reason']);
                }

                $registration = $existing ?? new Registration;
                $registration->user_id = $user->id;
                $registration->event_id = $event->id;
                $registration->status = RegistrationStatus::Registered;
                $registration->registered_at = now();
                $registration->cancelled_at = null;
                $registration->save();

                return $registration;
            });
        } catch (UniqueConstraintViolationException) {
            throw new RegistrationException('You are already registered for this event.', 409, 'already_registered');
        }
    }

    public function cancel(Registration $registration): Registration
    {
        return DB::transaction(function () use ($registration) {
            $locked = Registration::query()->lockForUpdate()->findOrFail($registration->id);
            $event = $locked->event;

            if (! $locked->isActive()) {
                throw new RegistrationException('This registration is already cancelled.', 422, 'already_cancelled');
            }

            if (! $event->allowsCancellation()) {
                throw new RegistrationException(
                    'Registrations can only be cancelled before a published event starts.',
                    422,
                    'cancellation_closed'
                );
            }

            $locked->status = RegistrationStatus::Cancelled;
            $locked->cancelled_at = now();
            $locked->save();

            return $locked;
        });
    }
}
