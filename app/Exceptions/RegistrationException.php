<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Http\JsonResponse;

class RegistrationException extends Exception
{
    public function __construct(string $message, private readonly int $status = 422, private readonly ?string $reason = null)
    {
        parent::__construct($message);
    }

    public function render(): JsonResponse
    {
        return response()->json([
            'message' => $this->getMessage(),
            'reason' => $this->reason,
        ], $this->status);
    }
}
