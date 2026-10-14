<?php

namespace App\Http\Controllers\Api\Student;

use App\Enums\EventStatus;
use App\Enums\RegistrationStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\RegistrationResource;
use App\Models\Registration;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        $mine = fn () => Registration::query()
            ->where('registrations.user_id', $userId)
            ->where('registrations.status', RegistrationStatus::Registered->value)
            ->join('events', 'events.id', '=', 'registrations.event_id')
            ->select('registrations.*');

        $upcoming = fn () => $mine()
            ->where('events.status', EventStatus::Published->value)
            ->where('events.end_at', '>=', now());

        return response()->json([
            'stats' => [
                'active_registrations' => $mine()->count(),
                'upcoming_events' => $upcoming()->count(),
                'completed_events' => $mine()->where('events.status', EventStatus::Completed->value)->count(),
            ],
            'upcoming' => RegistrationResource::collection(
                $upcoming()->with('event')->orderBy('events.start_at')->limit(5)->get()
            ),
            'recent' => RegistrationResource::collection(
                Registration::query()
                    ->where('user_id', $userId)
                    ->with('event')
                    ->orderByDesc('registered_at')
                    ->limit(5)
                    ->get()
            ),
        ]);
    }
}
