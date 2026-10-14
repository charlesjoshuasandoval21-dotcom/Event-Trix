<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organizer_id')->constrained('users')->restrictOnDelete();
            $table->string('title', 150);
            $table->string('summary', 300)->nullable();
            $table->text('description');
            $table->string('category', 30);
            $table->string('banner_url', 2048)->nullable();
            $table->string('venue', 200);
            $table->dateTime('start_at');
            $table->dateTime('end_at');
            $table->dateTime('registration_deadline');
            $table->unsignedInteger('capacity')->nullable();
            $table->string('status', 20)->default('draft');
            $table->timestamps();

            $table->index(['status', 'start_at']);
            $table->index('category');
            $table->index('start_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};
