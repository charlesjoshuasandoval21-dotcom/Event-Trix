<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RegistrationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'status' => $this->status->value,
            'registered_at' => $this->registered_at->toIso8601String(),
            'cancelled_at' => $this->cancelled_at?->toIso8601String(),
            'can_cancel' => $this->isActive() && $this->relationLoaded('event') && $this->event->allowsCancellation(),
            'event' => $this->whenLoaded('event', fn () => [
                'id' => $this->event->id,
                'title' => $this->event->title,
                'category' => [
                    'value' => $this->event->category->value,
                    'label' => $this->event->category->label(),
                ],
                'banner_url' => $this->event->banner_url,
                'venue' => $this->event->venue,
                'start_at' => $this->event->start_at->toIso8601String(),
                'end_at' => $this->event->end_at->toIso8601String(),
                'status' => $this->event->status->value,
            ]),

            'user' => $this->whenLoaded('user', fn () => [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'email' => $this->user->email,
                'student_number' => $this->user->student_number,
            ]),
        ];
    }
}
