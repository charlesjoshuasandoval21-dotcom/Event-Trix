<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\Api\Organizer;
use App\Http\Controllers\Api\SettingsController;
use App\Http\Controllers\Api\Student;
use Illuminate\Support\Facades\Route;

Route::get('/events', [EventController::class, 'index']);
Route::get('/events/{event}', [EventController::class, 'show'])->whereNumber('event');
Route::get('/event-categories', [EventController::class, 'categories']);

Route::middleware('throttle:auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::middleware('role:student')->group(function () {
        Route::get('/student/dashboard', Student\DashboardController::class);
        Route::get('/my-registrations', [Student\RegistrationController::class, 'index']);
        Route::post('/events/{event}/registrations', [Student\RegistrationController::class, 'store'])->whereNumber('event');
        Route::delete('/registrations/{registration}', [Student\RegistrationController::class, 'destroy'])->whereNumber('registration');

        Route::get('/student/settings', [SettingsController::class, 'show']);
        Route::put('/student/settings', [SettingsController::class, 'updateProfile']);
        Route::put('/student/settings/password', [SettingsController::class, 'updatePassword']);
    });

    Route::prefix('organizer')->middleware('role:organizer,student')->group(function () {
        Route::get('/dashboard', Organizer\DashboardController::class);

        Route::get('/events', [Organizer\EventController::class, 'index']);
        Route::post('/events', [Organizer\EventController::class, 'store']);
        Route::get('/events/{event}', [Organizer\EventController::class, 'show'])->whereNumber('event');
        Route::put('/events/{event}', [Organizer\EventController::class, 'update'])->whereNumber('event');
        Route::patch('/events/{event}/status', [Organizer\EventController::class, 'updateStatus'])->whereNumber('event');
        Route::delete('/events/{event}', [Organizer\EventController::class, 'destroy'])->whereNumber('event');
        Route::get('/events/{event}/registrations', [Organizer\RegistrationController::class, 'forEvent'])->whereNumber('event');

        Route::get('/registrations', [Organizer\RegistrationController::class, 'index']);

        Route::get('/settings', [SettingsController::class, 'show']);
        Route::put('/settings', [SettingsController::class, 'updateProfile']);
        Route::put('/settings/password', [SettingsController::class, 'updatePassword']);
    });
});
