<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('users', 'student_number')) {
            Schema::table('users', function (Blueprint $table) {
                $table->string('student_number', 50)->nullable()->unique()->after('email');
            });
        }

        if (! Schema::hasColumn('users', 'role')) {
            Schema::table('users', function (Blueprint $table) {
                $table->string('role', 20)->default('student')->index()->after('password');
            });
        }
    }

    public function down(): void
    {
    }
};
