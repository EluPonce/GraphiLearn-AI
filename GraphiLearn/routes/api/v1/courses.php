<?php

use App\Http\Controllers\Api\V1\CourseController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Rutas del Módulo de Cursos (API v1)
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {
    Route::get('cursos', [CourseController::class, 'index']);
    Route::get('cursos/{course}', [CourseController::class, 'show']);
});
