<?php

namespace Tests\Feature;

use App\Models\Event;
use App\Models\Registration;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EventManagementTest extends TestCase
{
    use RefreshDatabase;

    private function organizer(): User
    {
        return User::factory()->organizer()->create();
    }

    private function eventPayload(array $overrides = []): array
    {
        return array_merge([
            'title' => 'Intro to Laravel',
            'summary' => 'Learn the basics.',
            'description' => 'A full description of the event.',
            'category' => 'workshop',
            'banner_url' => 'https://example.com/banner.jpg',
            'venue' => 'Lab 1',
            'start_at' => now()->addDays(10)->format('Y-m-d\TH:i'),
            'end_at' => now()->addDays(10)->addHours(3)->format('Y-m-d\TH:i'),
            'registration_deadline' => now()->addDays(8)->format('Y-m-d\TH:i'),
            'capacity' => 25,
            'status' => 'draft',
        ], $overrides);
    }

    public function test_guests_cannot_use_event_management_endpoints(): void
    {
        $event = Event::factory()->create();

        $this->getJson('/api/organizer/dashboard')->assertUnauthorized();
        $this->postJson('/api/organizer/events', $this->eventPayload())->assertUnauthorized();
        $this->putJson("/api/organizer/events/{$event->id}", $this->eventPayload())->assertUnauthorized();
        $this->deleteJson("/api/organizer/events/{$event->id}")->assertUnauthorized();
    }

    public function test_any_signed_in_account_can_create_and_manage_events(): void
    {
        $student = User::factory()->create();
        $this->actingAs($student, 'sanctum');

        $id = $this->postJson('/api/organizer/events', $this->eventPayload())->assertCreated()->json('data.id');
        $this->putJson("/api/organizer/events/{$id}", $this->eventPayload(['title' => 'Student made']))->assertOk();
        $this->deleteJson("/api/organizer/events/{$id}")->assertOk();
    }

    public function test_organizer_can_create_view_update_and_delete_an_event(): void
    {
        $organizer = $this->organizer();
        $this->actingAs($organizer, 'sanctum');

        $id = $this->postJson('/api/organizer/events', $this->eventPayload())
            ->assertCreated()
            ->assertJsonPath('data.status', 'draft')
            ->assertJsonPath('data.organizer.id', $organizer->id)
            ->json('data.id');

        $this->getJson("/api/organizer/events/{$id}")->assertOk()->assertJsonPath('data.title', 'Intro to Laravel');

        $this->putJson("/api/organizer/events/{$id}", $this->eventPayload(['title' => 'Updated title', 'status' => 'published']))
            ->assertOk()
            ->assertJsonPath('data.title', 'Updated title')
            ->assertJsonPath('data.status', 'published');

        $this->deleteJson("/api/organizer/events/{$id}")->assertOk();
        $this->assertDatabaseMissing('events', ['id' => $id]);
    }

    public function test_event_validation_rules(): void
    {
        $this->actingAs($this->organizer(), 'sanctum');

        $this->postJson('/api/organizer/events', $this->eventPayload([
            'title' => '',
            'category' => 'cooking',
            'banner_url' => 'not-a-url',
            'capacity' => 0,
            'end_at' => now()->addDays(9)->format('Y-m-d\TH:i'),
            'registration_deadline' => now()->addDays(11)->format('Y-m-d\TH:i'),
        ]))->assertUnprocessable()->assertJsonValidationErrors([
            'title', 'category', 'banner_url', 'capacity', 'end_at', 'registration_deadline',
        ]);
    }

    public function test_deleting_an_event_removes_its_registrations(): void
    {
        $this->actingAs($this->organizer(), 'sanctum');
        $event = Event::factory()->create();
        Registration::factory()->count(2)->create(['event_id' => $event->id]);

        $this->deleteJson("/api/organizer/events/{$event->id}")->assertOk();

        $this->assertDatabaseCount('registrations', 0);
    }

    public function test_draft_events_are_hidden_from_the_public(): void
    {
        $draft = Event::factory()->draft()->create(['title' => 'Secret Draft']);
        $published = Event::factory()->create(['title' => 'Public Event']);

        $this->getJson('/api/events')
            ->assertOk()
            ->assertJsonFragment(['title' => 'Public Event'])
            ->assertJsonMissing(['title' => 'Secret Draft']);

        $this->getJson("/api/events/{$draft->id}")->assertNotFound();
        $this->getJson("/api/events/{$published->id}")->assertOk();
    }

    public function test_publish_and_unpublish_workflow(): void
    {
        $this->actingAs($this->organizer(), 'sanctum');
        $event = Event::factory()->draft()->create();

        $this->patchJson("/api/organizer/events/{$event->id}/status", ['status' => 'published'])
            ->assertOk()->assertJsonPath('data.status', 'published');

        $this->patchJson("/api/organizer/events/{$event->id}/status", ['status' => 'draft'])
            ->assertOk()->assertJsonPath('data.status', 'draft');

        $completed = Event::factory()->completed()->create();
        $this->patchJson("/api/organizer/events/{$completed->id}/status", ['status' => 'published'])
            ->assertUnprocessable();
    }

    public function test_event_with_registrations_cannot_be_unpublished(): void
    {
        $this->actingAs($this->organizer(), 'sanctum');
        $event = Event::factory()->create();
        Registration::factory()->create(['event_id' => $event->id]);

        $this->patchJson("/api/organizer/events/{$event->id}/status", ['status' => 'draft'])
            ->assertUnprocessable()->assertJsonValidationErrors('status');
    }

    public function test_capacity_cannot_drop_below_current_registrations(): void
    {
        $this->actingAs($this->organizer(), 'sanctum');
        $event = Event::factory()->withCapacity(10)->create();
        Registration::factory()->count(3)->create(['event_id' => $event->id]);

        $this->putJson("/api/organizer/events/{$event->id}", $this->eventPayload(['capacity' => 2, 'status' => 'published']))
            ->assertUnprocessable()->assertJsonValidationErrors('capacity');
    }

    public function test_search_and_filters(): void
    {
        Event::factory()->create(['title' => 'Alpha Hackathon', 'category' => 'hackathon']);
        Event::factory()->create(['title' => 'Beta Seminar', 'category' => 'seminar']);
        Event::factory()->completed()->create(['title' => 'Gamma Workshop', 'category' => 'workshop']);

        $this->getJson('/api/events?search=alpha')->assertJsonCount(1, 'data');
        $this->getJson('/api/events?category=seminar')->assertJsonCount(1, 'data')->assertJsonPath('data.0.title', 'Beta Seminar');
        $this->getJson('/api/events')->assertJsonCount(2, 'data');
        $this->getJson('/api/events?time=past')->assertJsonCount(1, 'data')->assertJsonPath('data.0.title', 'Gamma Workshop');
        $this->getJson('/api/events?time=all')->assertJsonCount(3, 'data');
        $this->getJson('/api/events?search=%25')->assertJsonCount(0, 'data');
    }

    public function test_organizer_dashboard_matches_database(): void
    {
        $this->actingAs($this->organizer(), 'sanctum');
        Event::factory()->count(2)->create();
        Event::factory()->draft()->create();
        $done = Event::factory()->completed()->create();
        Registration::factory()->count(3)->create(['event_id' => $done->id]);
        Registration::factory()->cancelled()->create(['event_id' => $done->id]);

        $this->getJson('/api/organizer/dashboard')
            ->assertOk()
            ->assertJsonPath('stats.total_events', 4)
            ->assertJsonPath('stats.upcoming_events', 2)
            ->assertJsonPath('stats.completed_events', 1)
            ->assertJsonPath('stats.total_registrations', 3);
    }

    public function test_organizer_registrations_listing_and_search(): void
    {
        $this->actingAs($this->organizer(), 'sanctum');
        $event = Event::factory()->withCapacity(5)->create();
        $ana = User::factory()->create(['name' => 'Ana Reyes', 'student_number' => '2023-1']);
        $ben = User::factory()->create(['name' => 'Ben Santos']);
        Registration::factory()->create(['event_id' => $event->id, 'user_id' => $ana->id]);
        Registration::factory()->create(['event_id' => $event->id, 'user_id' => $ben->id]);

        $this->getJson("/api/organizer/events/{$event->id}/registrations")
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('summary.registered', 2)
            ->assertJsonPath('summary.event.remaining', 3);

        $this->getJson("/api/organizer/registrations?event_id={$event->id}&search=ana")
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.user.name', 'Ana Reyes');
    }
}
