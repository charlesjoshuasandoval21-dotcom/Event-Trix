<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EventResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $registered = $this->activeRegistrationsCount();

        return [
            'id' => $this->id,
            'title' => $this->title,
            'summary' => $this->summary,
            'description' => $this->description,
            'category' => [
                'value' => $this->category->value,
                'label' => $this->category->label(),
            ],
            'banner_url' => $this->banner_url,
            'venue' => $this->venue,
            'start_at' => $this->start_at->toIso8601String(),
            'end_at' => $this->end_at->toIso8601String(),
            'registration_deadline' => $this->registration_deadline->toIso8601String(),
            'capacity' => $this->capacity,
            'registered_count' => $registered,
            'remaining' => $this->capacity === null ? null : max($this->capacity - $registered, 0),
            'status' => $this->status->value,
            'registration' => $this->registrationAvailability($registered),
            'can_cancel_registration' => $this->allowsCancellation(),
            'organizer' => $this->whenLoaded('organizer', fn () => [
                'id' => $this->organizer->id,
                'name' => $this->organizer->name,
            ]),
            'my_registration' => $this->whenLoaded('myRegistration', fn () => $this->myRegistration
                ? [
                    'id' => $this->myRegistration->id,
                    'status' => $this->myRegistration->status->value,
                    'registered_at' => $this->myRegistration->registered_at->toIso8601String(),
                ]
                : null),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
