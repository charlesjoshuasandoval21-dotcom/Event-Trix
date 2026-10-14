<?php

namespace App\Http\Controllers\Api\Student;

use App\Enums\EventStatus;
use App\Enums\RegistrationStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\RegistrationResource;
use App\Models\Event;
use App\Models\Registration;
use App\Services\RegistrationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class RegistrationController extends Controller
{
    public function __construct(private readonly RegistrationService $registrations) {}

    public function index(Request $request)
    {
        $request->validate([
            'filter' => ['nullable', 'in:all,upcoming,past,cancelled'],
            'search' => ['nullable', 'string', 'max:100'],
        ]);

        $filter = $request->query('filter', 'all');
        $active = RegistrationStatus::Registered->value;

        $query = Registration::query()
            ->where('registrations.user_id', $request->user()->id)
            ->with('event')
            ->join('events', 'events.id', '=', 'registrations.event_id')
            ->select('registrations.*')
            ->when($request->filled('search'), fn ($q) => $q->where('events.title', 'like', $this->likeTerm($request->query('search'))))
            ->when($filter === 'upcoming', fn ($q) => $q->where('registrations.status', $active)->where('events.end_at', '>=', now()))
            ->when($filter === 'past', fn ($q) => $q->where('registrations.status', $active)->where('events.end_at', '<', now()))
            ->when($filter === 'cancelled', fn ($q) => $q->where('registrations.status', RegistrationStatus::Cancelled->value))
            ->orderBy('events.start_at', $filter === 'past' ? 'desc' : 'asc');

        return RegistrationResource::collection(
            $query->paginate($this->perPage($request))->withQueryString()
        );
    }

    public function store(Request $request, Event $event): JsonResponse
    {
        abort_if($event->status === EventStatus::Draft, 404, 'Resource not found.');

        $registration = $this->registrations->register($request->user(), $event->id);

        return (new RegistrationResource($registration->load('event')))
            ->response()
            ->setStatusCode(201);
    }

    public function destroy(Registration $registration): RegistrationResource
    {
        Gate::authorize('cancel', $registration);

        $cancelled = $this->registrations->cancel($registration);

        return new RegistrationResource($cancelled->load('event'));
    }
}
