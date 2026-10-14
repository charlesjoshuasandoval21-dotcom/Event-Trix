<?php

namespace App\Http\Controllers;

abstract class Controller
{
    protected function likeTerm(string $term): string
    {
        return '%'.addcslashes(trim($term), '\\%_').'%';
    }

    protected function perPage(\Illuminate\Http\Request $request, int $default = 10, int $max = 50): int
    {
        return max(1, min((int) $request->query('per_page', $default), $max));
    }
}
