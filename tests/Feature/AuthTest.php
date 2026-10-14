<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    private function payload(array $overrides = []): array
    {
        return array_merge([
            'name' => 'New Student',
            'email' => 'new@example.com',
            'student_number' => '2024-0001',
            'password' => 'Password123',
            'password_confirmation' => 'Password123',
        ], $overrides);
    }

    public function test_student_can_register_and_is_logged_in(): void
    {
        $this->postJson('/api/register', $this->payload())
            ->assertCreated()
            ->assertJsonPath('data.role', 'student')
            ->assertJsonMissingPath('data.password');

        $this->assertDatabaseHas('users', ['email' => 'new@example.com', 'role' => 'student']);
        $this->app['auth']->forgetGuards();
        $this->getJson('/api/user')->assertOk()->assertJsonPath('data.email', 'new@example.com');
    }

    public function test_public_registration_cannot_create_an_organizer(): void
    {
        $this->postJson('/api/register', $this->payload(['role' => 'organizer']))->assertCreated();

        $this->assertDatabaseHas('users', ['email' => 'new@example.com', 'role' => 'student']);
    }

    public function test_registration_validates_input(): void
    {
        User::factory()->create(['email' => 'taken@example.com']);

        $this->postJson('/api/register', $this->payload(['email' => 'taken@example.com', 'password_confirmation' => 'nope']))
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['email', 'password']);
    }

    public function test_login_and_logout(): void
    {
        $user = User::factory()->create(['email' => 'ana@example.com']);

        $this->postJson('/api/login', ['email' => 'ana@example.com', 'password' => 'password'])
            ->assertOk()
            ->assertJsonPath('data.id', $user->id);

        $this->getJson('/api/user')->assertOk();

        $this->postJson('/api/logout')->assertOk();
        $this->app['auth']->forgetGuards();

        $this->getJson('/api/user')->assertUnauthorized();
    }

    public function test_invalid_credentials_are_rejected(): void
    {
        User::factory()->create(['email' => 'ana@example.com']);

        $this->postJson('/api/login', ['email' => 'ana@example.com', 'password' => 'wrong'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('email');
    }

    public function test_protected_routes_reject_guests(): void
    {
        $this->getJson('/api/user')->assertUnauthorized();
        $this->getJson('/api/my-registrations')->assertUnauthorized();
        $this->getJson('/api/organizer/dashboard')->assertUnauthorized();
    }

    public function test_settings_update_profile_and_password_but_never_role(): void
    {
        $student = User::factory()->create(['email' => 'ana@example.com']);
        $other = User::factory()->create(['email' => 'other@example.com']);

        $this->actingAs($student, 'sanctum')
            ->putJson('/api/student/settings', ['name' => 'Ana R', 'email' => 'ana2@example.com', 'role' => 'organizer'])
            ->assertOk();

        $student->refresh();
        $this->assertSame('Ana R', $student->name);
        $this->assertSame('ana2@example.com', $student->email);
        $this->assertSame('student', $student->role);

        $this->actingAs($student, 'sanctum')
            ->putJson('/api/student/settings', ['name' => 'Ana R', 'email' => $other->email])
            ->assertUnprocessable()->assertJsonValidationErrors('email');

        $this->actingAs($student, 'sanctum')
            ->putJson('/api/student/settings/password', [
                'current_password' => 'password',
                'password' => 'NewPassword456',
                'password_confirmation' => 'NewPassword456',
            ])->assertOk();

        $this->actingAs($student, 'sanctum')
            ->putJson('/api/student/settings/password', [
                'current_password' => 'wrong',
                'password' => 'AnotherPass789',
                'password_confirmation' => 'AnotherPass789',
            ])->assertUnprocessable();
    }
}
