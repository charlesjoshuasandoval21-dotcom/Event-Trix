<?php

namespace Tests\Feature;

use App\Models\Event;
use App\Models\Registration;
use App\Models\User;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_cannot_register(): void
    {
        $event = Event::factory()->create();

        $this->postJson("/api/events/{$event->id}/registrations")->assertUnauthorized();
    }

    public function test_student_can_register_and_see_it_listed(): void
    {
        $student = User::factory()->create();
        $event = Event::factory()->withCapacity(5)->create();

        $this->actingAs($student, 'sanctum')
            ->postJson("/api/events/{$event->id}/registrations")
            ->assertCreated()
            ->assertJsonPath('data.status', 'registered');

        $this->getJson('/api/my-registrations')->assertJsonCount(1, 'data');
        $this->getJson("/api/events/{$event->id}")
            ->assertJsonPath('data.registered_count', 1)
            ->assertJsonPath('data.remaining', 4)
            ->assertJsonPath('data.my_registration.status', 'registered');
    }

    public function test_duplicate_registration_is_prevented(): void
    {
        $student = User::factory()->create();
        $event = Event::factory()->create();

        $this->actingAs($student, 'sanctum');
        $this->postJson("/api/events/{$event->id}/registrations")->assertCreated();
        $this->postJson("/api/events/{$event->id}/registrations")->assertStatus(409);

        $this->assertDatabaseCount('registrations', 1);
    }

    public function test_database_enforces_unique_registration(): void
    {
        $r = Registration::factory()->create();

        $this->expectException(UniqueConstraintViolationException::class);
        Registration::factory()->create(['user_id' => $r->user_id, 'event_id' => $r->event_id]);
    }

    public function test_capacity_is_enforced(): void
    {
        $event = Event::factory()->withCapacity(1)->create();
        $first = User::factory()->create();
        $second = User::factory()->create();

        $this->actingAs($first, 'sanctum')->postJson("/api/events/{$event->id}/registrations")->assertCreated();

        $this->actingAs($second, 'sanctum')
            ->postJson("/api/events/{$event->id}/registrations")
            ->assertUnprocessable()
            ->assertJsonPath('reason', 'full');

        $this->assertDatabaseCount('registrations', 1);
    }

    public function test_cancelled_seat_can_be_taken_by_someone_else(): void
    {
        $event = Event::factory()->withCapacity(1)->create();
        $first = User::factory()->create();
        $second = User::factory()->create();

        $id = $this->actingAs($first, 'sanctum')
            ->postJson("/api/events/{$event->id}/registrations")->json('data.id');
        $this->deleteJson("/api/registrations/{$id}")->assertOk()->assertJsonPath('data.status', 'cancelled');

        $this->actingAs($second, 'sanctum')->postJson("/api/events/{$event->id}/registrations")->assertCreated();
        $this->assertSame(1, $event->activeRegistrationsCount());
    }

    public function test_student_can_re_register_after_cancelling(): void
    {
        $student = User::factory()->create();
        $event = Event::factory()->create();

        $this->actingAs($student, 'sanctum');
        $id = $this->postJson("/api/events/{$event->id}/registrations")->json('data.id');
        $this->deleteJson("/api/registrations/{$id}")->assertOk();
        $this->postJson("/api/events/{$event->id}/registrations")->assertCreated()->assertJsonPath('data.status', 'registered');

        $this->assertDatabaseCount('registrations', 1);
    }

    public function test_deadline_is_enforced(): void
    {
        $student = User::factory()->create();
        $event = Event::factory()->create(['registration_deadline' => now()->subHour()]);

        $this->actingAs($student, 'sanctum')
            ->postJson("/api/events/{$event->id}/registrations")
            ->assertUnprocessable()->assertJsonPath('reason', 'closed');
    }

    public function test_completed_cancelled_and_draft_events_reject_registration(): void
    {
        $student = User::factory()->create();
        $this->actingAs($student, 'sanctum');

        $completed = Event::factory()->completed()->create();
        $cancelled = Event::factory()->cancelled()->create();
        $draft = Event::factory()->draft()->create();

        $this->postJson("/api/events/{$completed->id}/registrations")->assertUnprocessable();
        $this->postJson("/api/events/{$cancelled->id}/registrations")->assertUnprocessable()->assertJsonPath('reason', 'cancelled');
        $this->postJson("/api/events/{$draft->id}/registrations")->assertNotFound();

        $this->assertDatabaseCount('registrations', 0);
    }

    public function test_organizers_cannot_register_for_events(): void
    {
        $organizer = User::factory()->organizer()->create();
        $event = Event::factory()->create();

        $this->actingAs($organizer, 'sanctum')
            ->postJson("/api/events/{$event->id}/registrations")->assertForbidden();
    }

    public function test_student_cannot_cancel_another_students_registration(): void
    {
        $owner = User::factory()->create();
        $intruder = User::factory()->create();
        $registration = Registration::factory()->create(['user_id' => $owner->id]);

        $this->actingAs($intruder, 'sanctum')
            ->deleteJson("/api/registrations/{$registration->id}")->assertForbidden();

        $this->assertDatabaseHas('registrations', ['id' => $registration->id, 'status' => 'registered']);
    }

    public function test_cancellation_is_blocked_once_event_started(): void
    {
        $student = User::factory()->create();
        $event = Event::factory()->create([
            'start_at' => now()->subHour(),
            'end_at' => now()->addHours(3),
        ]);
        $registration = Registration::factory()->create(['user_id' => $student->id, 'event_id' => $event->id]);

        $this->actingAs($student, 'sanctum')
            ->deleteJson("/api/registrations/{$registration->id}")
            ->assertUnprocessable()->assertJsonPath('reason', 'cancellation_closed');
    }

    public function test_student_only_sees_their_own_data(): void
    {
        $ana = User::factory()->create();
        $ben = User::factory()->create();
        Registration::factory()->create(['user_id' => $ana->id]);
        Registration::factory()->count(2)->create(['user_id' => $ben->id]);

        $this->actingAs($ana, 'sanctum');
        $this->getJson('/api/my-registrations')->assertJsonCount(1, 'data');
        $this->getJson('/api/student/dashboard')
            ->assertOk()
            ->assertJsonPath('stats.active_registrations', 1);
    }

    public function test_my_registrations_filters(): void
    {
        $student = User::factory()->create();
        $upcoming = Event::factory()->create();
        $past = Event::factory()->completed()->create();
        $cancelledEvent = Event::factory()->create();

        Registration::factory()->create(['user_id' => $student->id, 'event_id' => $upcoming->id]);
        Registration::factory()->create(['user_id' => $student->id, 'event_id' => $past->id]);
        Registration::factory()->cancelled()->create(['user_id' => $student->id, 'event_id' => $cancelledEvent->id]);

        $this->actingAs($student, 'sanctum');
        $this->getJson('/api/my-registrations')->assertJsonCount(3, 'data');
        $this->getJson('/api/my-registrations?filter=upcoming')->assertJsonCount(1, 'data');
        $this->getJson('/api/my-registrations?filter=past')->assertJsonCount(1, 'data');
        $this->getJson('/api/my-registrations?filter=cancelled')->assertJsonCount(1, 'data');
    }
}
