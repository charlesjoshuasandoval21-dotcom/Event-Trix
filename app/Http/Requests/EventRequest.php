<?php

namespace App\Http\Requests;

use App\Enums\EventCategory;
use App\Models\Event;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class EventRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:150'],
            'summary' => ['nullable', 'string', 'max:300'],
            'description' => ['required', 'string', 'max:10000'],
            'category' => ['required', Rule::in(EventCategory::values())],
            'banner_url' => ['nullable', 'url:http,https', 'max:2048'],
            'venue' => ['required', 'string', 'max:200'],
            'start_at' => ['required', 'date'],
            'end_at' => ['required', 'date', 'after:start_at'],
            'registration_deadline' => ['required', 'date', 'before_or_equal:start_at'],
            'capacity' => ['nullable', 'integer', 'min:1', 'max:100000'],

            'status' => ['sometimes', Rule::in(['draft', 'published'])],
        ];
    }

    public function messages(): array
    {
        return [
            'end_at.after' => 'The end time must be later than the start time.',
            'registration_deadline.before_or_equal' => 'The registration deadline cannot be after the event starts.',
            'capacity.min' => 'Maximum participants must be a positive number.',
        ];
    }

    public function after(): array
    {
        return [
            function (Validator $validator) {
                $event = $this->route('event');

                if ($event instanceof Event && $this->filled('capacity')) {
                    $active = $event->activeRegistrationsCount();
                    if ((int) $this->input('capacity') < $active) {
                        $validator->errors()->add(
                            'capacity',
                            "Capacity cannot be lower than the {$active} current registration(s)."
                        );
                    }
                }
            },
        ];
    }
}
