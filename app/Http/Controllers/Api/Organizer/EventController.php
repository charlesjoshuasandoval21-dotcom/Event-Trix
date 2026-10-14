<?php

namespace App\Http\Controllers\Api\Organizer;

use App\Enums\EventCategory;
use App\Enums\EventStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\EventRequest;
use App\Http\Requests\UpdateEventStatusRequest;
use App\Http\Resources\EventResource;
use App\Models\Event;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class EventController extends Controller
{
    public function index(Request $request)
    {
        $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'category' => ['nullable', 'in:'.implode(',', EventCategory::values())],
            'status' => ['nullable', 'in:'.implode(',', EventStatus::values())],
            'sort' => ['nullable', 'in:start_asc,start_desc,created_desc'],
        ]);

        $query = Event::query()
            ->withRegisteredCount()
            ->with('organizer:id,name')
            ->when($request->filled('search'), function ($q) use ($request) {
                $term = $this->likeTerm($request->query('search'));
                $q->where(fn ($w) => $w->where('title', 'like', $term)->orWhere('venue', 'like', $term));
            })
            ->when($request->filled('category'), fn ($q) => $q->where('category', $request->query('category')))
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->query('status')));

        match ($request->query('sort', 'start_desc')) {
            'start_asc' => $query->orderBy('start_at'),
            'created_desc' => $query->orderByDesc('created_at'),
            default => $query->orderByDesc('start_at'),
        };

        return EventResource::collection(
            $query->orderByDesc('id')->paginate($this->perPage($request))->withQueryString()
        );
    }

    public function store(EventRequest $request): JsonResponse
    {
        $event = new Event($request->validated());
        $event->organizer_id = $request->user()->id;
        $event->status = EventStatus::from($request->validated('status') ?? 'draft');

        $this->guardPublishable($event);
        $event->save();

        return (new EventResource($this->fresh($event)))->response()->setStatusCode(201);
    }

    public function show(Event $event): EventResource
    {
        return new EventResource($this->fresh($event));
    }

    public function update(EventRequest $request, Event $event): EventResource
    {
        $data = $request->validated();
        $requested = isset($data['status']) ? EventStatus::from($data['status']) : null;
        unset($data['status']);

        $event->fill($data);

        if ($requested && $requested !== $event->status) {
            $this->applyTransition($event, $requested);
        }

        $event->save();

        return new EventResource($this->fresh($event));
    }

    public function updateStatus(UpdateEventStatusRequest $request, Event $event): EventResource
    {
        $this->applyTransition($event, EventStatus::from($request->validated('status')));
        $event->save();

        return new EventResource($this->fresh($event));
    }

    public function destroy(Event $event): JsonResponse
    {
        DB::transaction(fn () => $event->delete());

        return response()->json(['message' => 'Event deleted.']);
    }

    private function applyTransition(Event $event, EventStatus $next): void
    {
        $current = $event->status;

        if (! $current->canTransitionTo($next)) {
            throw ValidationException::withMessages([
                'status' => ["A {$current->value} event cannot be changed to {$next->value}."],
            ]);
        }

        if ($current === EventStatus::Published && $next === EventStatus::Draft && $event->activeRegistrationsCount() > 0) {
            throw ValidationException::withMessages([
                'status' => ['This event has active registrations and cannot be unpublished. Cancel the event instead.'],
            ]);
        }

        $event->status = $next;
        $this->guardPublishable($event);
    }

    private function guardPublishable(Event $event): void
    {
        if ($event->status === EventStatus::Published && $event->end_at->isPast()) {
            throw ValidationException::withMessages([
                'status' => ['An event that has already ended cannot be published.'],
            ]);
        }
    }

    private function fresh(Event $event): Event
    {
        return Event::query()->withRegisteredCount()->with('organizer:id,name')->findOrFail($event->id);
    }
}
