<?php

use App\Http\Controllers\Api\V1\ExerciseController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Rutas del Catálogo de Ejercicios Grafomotores (API v1)
|--------------------------------------------------------------------------
*/

Route::middleware(['auth:sanctum', 'role:docente,administrador'])->group(function () {
    Route::apiResource('exercises', ExerciseController::class);
});
