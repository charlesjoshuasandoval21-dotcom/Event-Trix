<?php

namespace App\Enums;

enum EventCategory: string
{
    case Hackathon = 'hackathon';
    case Seminar = 'seminar';
    case Workshop = 'workshop';
    case Competition = 'competition';
    case Esports = 'esports';
    case Other = 'other';

    public function label(): string
    {
        return match ($this) {
            self::Hackathon => 'Hackathons',
            self::Seminar => 'Seminars',
            self::Workshop => 'Workshops',
            self::Competition => 'Competitions',
            self::Esports => 'Esports',
            self::Other => 'Other',
        };
    }

    public static function values(): array
    {
        return array_map(fn (self $c) => $c->value, self::cases());
    }
}
