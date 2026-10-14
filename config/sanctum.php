<?php

use Illuminate\Cookie\Middleware\EncryptCookies;
use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken;
use Laravel\Sanctum\Http\Middleware\AuthenticateSession;
use Laravel\Sanctum\Sanctum;

return [

    'stateful' => array_values(array_unique(array_filter(array_map('trim', array_merge(
        explode(',', env('SANCTUM_STATEFUL_DOMAINS', 'localhost,localhost:5173,localhost:8000,127.0.0.1,127.0.0.1:5173,127.0.0.1:8000')),
        [parse_url((string) env('APP_URL'), PHP_URL_HOST) ?: ''],
    ))))),

    'guard' => ['web'],

    'expiration' => null,

    'token_prefix' => env('SANCTUM_TOKEN_PREFIX', ''),

    'middleware' => [
        'authenticate_session' => AuthenticateSession::class,
        'encrypt_cookies' => EncryptCookies::class,
        'validate_csrf_token' => ValidateCsrfToken::class,
    ],

];

