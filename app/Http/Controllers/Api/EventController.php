<?php

namespace App\Http\Controllers\Api;

use App\Enums\EventCategory;
use App\Http\Controllers\Controller;
use App\Http\Resources\EventResource;
use App\Models\Event;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EventController extends Controller
{
    public function index(Request $request)
    {
        $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'category' => ['nullable', 'in:'.implode(',', EventCategory::values())],
            'time' => ['nullable', 'in:upcoming,past,all'],
            'status' => ['nullable', 'in:published,completed,cancelled'],
            'sort' => ['nullable', 'in:soonest,latest'],
        ]);

        $time = $request->query('time', 'upcoming');
        $userId = $request->user('sanctum')?->id;

        $events = Event::query()
            ->publiclyVisible()
            ->withRegisteredCount()
            ->with('organizer:id,name')
            ->when($userId, fn ($q) => $q->with(['myRegistration' => fn ($r) => $r->where('user_id', $userId)]))
            ->when($request->filled('search'), function ($q) use ($request) {
                $term = $this->likeTerm($request->query('search'));
                $q->where(fn ($w) => $w
                    ->where('title', 'like', $term)
                    ->orWhere('summary', 'like', $term)
                    ->orWhere('description', 'like', $term));
            })
            ->when($request->filled('category'), fn ($q) => $q->where('category', $request->query('category')))
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->query('status')))
            ->when($time === 'upcoming', fn ($q) => $q->where('end_at', '>=', now()))
            ->when($time === 'past', fn ($q) => $q->where('end_at', '<', now()));

        $direction = $request->query('sort', $time === 'past' ? 'latest' : 'soonest') === 'latest' ? 'desc' : 'asc';

        return EventResource::collection(
            $events->orderBy('start_at', $direction)->orderBy('id')
                ->paginate($this->perPage($request, 9, 24))
                ->withQueryString()
        );
    }

    public function show(Request $request, int $event): EventResource
    {
        $userId = $request->user('sanctum')?->id;

        $model = Event::query()
            ->publiclyVisible()
            ->withRegisteredCount()
            ->with('organizer:id,name')
            ->when($userId, fn ($q) => $q->with(['myRegistration' => fn ($r) => $r->where('user_id', $userId)]))
            ->findOrFail($event);

        return new EventResource($model);
    }

    public function categories(): JsonResponse
    {
        return response()->json([
            'data' => array_map(fn (EventCategory $c) => [
                'value' => $c->value,
                'label' => $c->label(),
            ], EventCategory::cases()),
        ]);
    }
}
