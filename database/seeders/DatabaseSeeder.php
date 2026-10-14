<?php

namespace Database\Seeders;

use App\Enums\EventCategory;
use App\Enums\EventStatus;
use App\Enums\RegistrationStatus;
use App\Models\Event;
use App\Models\Registration;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    private const PASSWORD = 'Password123';

    public function run(): void
    {
        $organizer = new User;
        $organizer->forceFill([
            'name' => 'Demo Organizer',
            'email' => 'organizer@eventrix.test',
            'password' => self::PASSWORD,
            'role' => User::ROLE_ORGANIZER,
            'email_verified_at' => now(),
        ])->save();

        $students = collect([
            ['Ana Reyes', 'ana.reyes@eventrix.test', '2023-00101'],
            ['Ben Santos', 'ben.santos@eventrix.test', '2023-00102'],
            ['Carla Mendoza', 'carla.mendoza@eventrix.test', '2023-00103'],
            ['Diego Cruz', 'diego.cruz@eventrix.test', '2023-00104'],
            ['Elise Navarro', 'elise.navarro@eventrix.test', '2024-00201'],
            ['Felix Ramos', 'felix.ramos@eventrix.test', null],
        ])->map(function (array $s) {
            $user = new User;
            $user->forceFill([
                'name' => $s[0],
                'email' => $s[1],
                'student_number' => $s[2],
                'password' => self::PASSWORD,
                'role' => User::ROLE_STUDENT,
                'email_verified_at' => now(),
            ])->save();

            return $user;
        });

        $at = fn (int $days, int $hour = 9) => now()->addDays($days)->setTime($hour, 0);

        $definitions = [

            ['CodeStorm 2026: 24-Hour Hackathon', EventCategory::Hackathon, null, 'IT Building, Innovation Lab', 21, 24, 3, 60, EventStatus::Published,
                'Build something useful in 24 hours with your team and pitch it to a panel of faculty judges.'],
            ['Intro to Cloud & DevOps Seminar', EventCategory::Seminar, null, 'Auditorium A', 9, 3, 2, 150, EventStatus::Published,
                'A beginner-friendly talk on cloud basics, CI/CD, and how modern teams ship software.'],
            ['React for Beginners Workshop', EventCategory::Workshop, null, 'Computer Lab 3', 14, 5, 2, 30, EventStatus::Published,
                'Hands-on workshop: build and deploy your first React application from scratch.'],
            ['Inter-Class Programming Contest', EventCategory::Competition, null, 'Computer Lab 1', 30, 6, 5, 40, EventStatus::Published,
                'Solve algorithmic problems against the clock in this ACM-style team contest.'],
            ['Valorant Campus Cup', EventCategory::Esports, null, 'Student Hub Arena', 18, 8, 4, 32, EventStatus::Published,
                'Five-on-five Valorant tournament. Form your squad and fight for the department trophy.'],
            ['IT Department Orientation', EventCategory::Other, null, 'Main Gymnasium', 6, 3, 1, null, EventStatus::Published,
                'Meet the faculty, student organizations, and learn what the IT department offers this year.'],
            ['Web Dev Sprint Challenge', EventCategory::Competition, null, 'Computer Lab 2', 12, 4, 2, 2, EventStatus::Published,
                'A tiny, nearly full web-design sprint, used to demonstrate the "Event Full" state.'],
            ['Capture the Flag: Security Basics', EventCategory::Workshop, null, 'Computer Lab 4', 25, 4, 3, 25, EventStatus::Draft,
                'Draft event: an introductory cybersecurity CTF workshop (not yet public).'],
            ['Git & GitHub Bootcamp', EventCategory::Workshop, null, 'Computer Lab 3', -12, 4, 2, 40, EventStatus::Completed,
                'Completed workshop on version control, branching, and collaborating with pull requests.'],
            ['Mobile Legends Showdown', EventCategory::Esports, null, 'Student Hub Arena', 15, 6, 3, 40, EventStatus::Cancelled,
                'This tournament was cancelled due to venue unavailability.'],
        ];

        $events = [];
        foreach ($definitions as [$title, $category, $banner, $venue, $startDays, $hours, $deadlineDays, $capacity, $status, $summary]) {
            $start = $at($startDays);
            $event = new Event([
                'title' => $title,
                'summary' => $summary,
                'description' => $summary."\n\nOpen to all IT students. Bring your student ID and a positive attitude. ".
                    "Organized by the IT Department student affairs team (fictional demo event).",
                'category' => $category,
                'banner_url' => $banner,
                'venue' => $venue,
                'start_at' => $start,
                'end_at' => $start->copy()->addHours($hours),
                'registration_deadline' => $start->copy()->subDays($deadlineDays),
                'capacity' => $capacity,
                'status' => $status,
            ]);
            $event->organizer_id = $organizer->id;
            $event->save();
            $events[$title] = $event;
        }

        $register = function (string $eventTitle, $users, RegistrationStatus $status = RegistrationStatus::Registered) use ($events) {
            foreach ($users as $user) {
                $r = new Registration;
                $r->user_id = $user->id;
                $r->event_id = $events[$eventTitle]->id;
                $r->status = $status;
                $r->registered_at = now()->subDays(rand(1, 5))->subMinutes(rand(0, 600));
                $r->cancelled_at = $status === RegistrationStatus::Cancelled ? now()->subHours(rand(1, 20)) : null;
                $r->save();
            }
        };

        $register('CodeStorm 2026: 24-Hour Hackathon', $students->take(4));
        $register('Intro to Cloud & DevOps Seminar', $students->take(3));
        $register('React for Beginners Workshop', $students->slice(1, 3));
        $register('Inter-Class Programming Contest', $students->slice(0, 2));
        $register('Valorant Campus Cup', $students->slice(2, 3));
        $register('Web Dev Sprint Challenge', $students->take(2));
        $register('Git & GitHub Bootcamp', $students->take(5));
        $register('IT Department Orientation', $students->take(1), RegistrationStatus::Cancelled);
    }
}
