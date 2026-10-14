<?php

namespace App\Http\Controllers\Api\Organizer;

use App\Enums\EventCategory;
use App\Enums\EventStatus;
use App\Enums\RegistrationStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\EventResource;
use App\Http\Resources\RegistrationResource;
use App\Models\Event;
use App\Models\Registration;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $upcoming = fn () => Event::query()
            ->where('status', EventStatus::Published->value)
            ->where('end_at', '>=', now());

        $byCategory = Event::query()
            ->selectRaw('category, count(*) as total')
            ->groupBy('category')
            ->pluck('total', 'category');

        return response()->json([
            'stats' => [
                'total_events' => Event::count(),
                'upcoming_events' => $upcoming()->count(),
                'total_registrations' => Registration::where('status', RegistrationStatus::Registered->value)->count(),
                'completed_events' => Event::where('status', EventStatus::Completed->value)->count(),
            ],
            'upcoming' => EventResource::collection(
                $upcoming()->withRegisteredCount()->orderBy('start_at')->limit(5)->get()
            ),
            'recent_events' => EventResource::collection(
                Event::query()->withRegisteredCount()->orderByDesc('created_at')->orderByDesc('id')->limit(5)->get()
            ),
            'recent_registrations' => RegistrationResource::collection(
                Registration::query()
                    ->with(['user:id,name,email,student_number', 'event:id,title,category,banner_url,venue,start_at,end_at,status'])
                    ->orderByDesc('registered_at')
                    ->limit(8)
                    ->get()
            ),
            'events_by_category' => collect(EventCategory::cases())->map(fn (EventCategory $c) => [
                'value' => $c->value,
                'label' => $c->label(),
                'total' => (int) ($byCategory[$c->value] ?? 0),
            ])->values(),
        ]);
    }
}
