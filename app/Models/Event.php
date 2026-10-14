<?php

namespace App\Models;

use App\Enums\EventCategory;
use App\Enums\EventStatus;
use App\Enums\RegistrationStatus;
use Database\Factories\EventFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Event extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'summary',
        'description',
        'category',
        'banner_url',
        'venue',
        'start_at',
        'end_at',
        'registration_deadline',
        'capacity',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'category' => EventCategory::class,
            'status' => EventStatus::class,
            'start_at' => 'datetime',
            'end_at' => 'datetime',
            'registration_deadline' => 'datetime',
            'capacity' => 'integer',
        ];
    }

    public function organizer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'organizer_id');
    }

    public function registrations(): HasMany
    {
        return $this->hasMany(Registration::class);
    }

    public function myRegistration(): HasOne
    {
        return $this->hasOne(Registration::class);
    }

    public function scopePubliclyVisible(Builder $query): Builder
    {
        return $query->where('status', '!=', EventStatus::Draft->value);
    }

    public function scopeWithRegisteredCount(Builder $query): Builder
    {
        return $query->withCount([
            'registrations as registered_count' => fn (Builder $q) => $q->where('status', RegistrationStatus::Registered->value),
        ]);
    }

    public function activeRegistrationsCount(): int
    {
        if (array_key_exists('registered_count', $this->attributes)) {
            return (int) $this->attributes['registered_count'];
        }

        return $this->registrations()->where('status', RegistrationStatus::Registered->value)->count();
    }

    public function registrationAvailability(?int $activeCount = null): array
    {
        $activeCount ??= $this->activeRegistrationsCount();

        $reason = match (true) {
            $this->status === EventStatus::Draft => 'unavailable',
            $this->status === EventStatus::Cancelled => 'cancelled',
            $this->status === EventStatus::Completed => 'completed',
            now()->greaterThan($this->end_at) => 'ended',
            now()->greaterThan($this->registration_deadline) => 'closed',
            $this->capacity !== null && $activeCount >= $this->capacity => 'full',
            default => null,
        };

        $messages = [
            'unavailable' => 'This event is not open for registration.',
            'cancelled' => 'This event has been cancelled.',
            'completed' => 'This event has already been completed.',
            'ended' => 'This event has already ended.',
            'closed' => 'The registration deadline has passed.',
            'full' => 'This event has reached its participant limit.',
        ];

        return [
            'open' => $reason === null,
            'reason' => $reason,
            'message' => $reason ? $messages[$reason] : null,
        ];
    }

    public function allowsCancellation(): bool
    {
        return $this->status === EventStatus::Published && now()->lessThan($this->start_at);
    }
}
