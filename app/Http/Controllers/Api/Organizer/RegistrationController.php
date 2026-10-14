<?php

namespace App\Http\Controllers\Api\Organizer;

use App\Enums\RegistrationStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\EventResource;
use App\Http\Resources\RegistrationResource;
use App\Models\Event;
use App\Models\Registration;
use Illuminate\Http\Request;

class RegistrationController extends Controller
{
    public function index(Request $request)
    {
        $request->validate(['event_id' => ['nullable', 'integer', 'exists:events,id']]);

        $event = $request->filled('event_id') ? Event::find($request->integer('event_id')) : null;

        return $this->listing($request, $event);
    }

    public function forEvent(Request $request, Event $event)
    {
        return $this->listing($request, $event);
    }

    private function listing(Request $request, ?Event $event)
    {
        $request->validate([
            'status' => ['nullable', 'in:all,registered,cancelled'],
            'search' => ['nullable', 'string', 'max:100'],
        ]);

        $status = $request->query('status', 'all');

        $query = Registration::query()
            ->with(['user:id,name,email,student_number', 'event:id,title,category,banner_url,venue,start_at,end_at,status'])
            ->when($event, fn ($q) => $q->where('event_id', $event->id))
            ->when($status !== 'all', fn ($q) => $q->where('status', $status))
            ->when($request->filled('search'), function ($q) use ($request) {
                $term = $this->likeTerm($request->query('search'));
                $q->whereHas('user', fn ($u) => $u
                    ->where('name', 'like', $term)
                    ->orWhere('email', 'like', $term)
                    ->orWhere('student_number', 'like', $term));
            })
            ->orderByDesc('registered_at')
            ->orderByDesc('id');

        $paginator = $query->paginate($this->perPage($request))->withQueryString();

        $response = RegistrationResource::collection($paginator);

        $totals = Registration::query()
            ->when($event, fn ($q) => $q->where('event_id', $event->id))
            ->selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $response->additional([
            'summary' => [
                'registered' => (int) ($totals[RegistrationStatus::Registered->value] ?? 0),
                'cancelled' => (int) ($totals[RegistrationStatus::Cancelled->value] ?? 0),
                'event' => $event
                    ? new EventResource(Event::query()->withRegisteredCount()->findOrFail($event->id))
                    : null,
            ],
        ]);

        return $response;
    }
}
