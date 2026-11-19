<?php

use App\Http\Controllers\Api\V1\ExerciseController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Rutas del Catálogo de Ejercicios Grafomotores (API v1)
|--------------------------------------------------------------------------
*/

Route::middleware(['auth:sanctum', 'role:docente,direccion'])->group(function () {
    Route::get('exercises', [ExerciseController::class, 'index']);
    Route::get('exercises/{exercise}', [ExerciseController::class, 'show']);
});
