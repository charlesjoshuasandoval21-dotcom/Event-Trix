<?php

namespace Database\Factories;

use App\Enums\EventCategory;
use App\Enums\EventStatus;
use App\Models\Event;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class EventFactory extends Factory
{
    public function definition(): array
    {
        $start = now()->addDays(fake()->numberBetween(5, 40))->setTime(9, 0);

        return [
            'organizer_id' => User::factory()->organizer(),
            'title' => fake()->unique()->words(3, true).' '.fake()->randomElement(['Summit', 'Jam', 'Workshop', 'Cup']),
            'summary' => fake()->sentence(),
            'description' => fake()->paragraphs(2, true),
            'category' => fake()->randomElement(EventCategory::cases()),
            'banner_url' => null,
            'venue' => 'IT Building Room '.fake()->numberBetween(100, 399),
            'start_at' => $start,
            'end_at' => $start->copy()->addHours(4),
            'registration_deadline' => $start->copy()->subDays(2),
            'capacity' => null,
            'status' => EventStatus::Published,
        ];
    }

    public function draft(): static
    {
        return $this->state(['status' => EventStatus::Draft]);
    }

    public function published(): static
    {
        return $this->state(['status' => EventStatus::Published]);
    }

    public function completed(): static
    {
        return $this->state(function () {
            $start = now()->subDays(10)->setTime(9, 0);

            return [
                'status' => EventStatus::Completed,
                'start_at' => $start,
                'end_at' => $start->copy()->addHours(4),
                'registration_deadline' => $start->copy()->subDays(2),
            ];
        });
    }

    public function cancelled(): static
    {
        return $this->state(['status' => EventStatus::Cancelled]);
    }

    public function withCapacity(int $capacity): static
    {
        return $this->state(['capacity' => $capacity]);
    }
}
