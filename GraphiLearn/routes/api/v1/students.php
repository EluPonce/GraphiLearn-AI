<?php

use App\Http\Controllers\Api\V1\StudentController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Rutas del Módulo de Estudiantes (API v1)
|--------------------------------------------------------------------------
*/

Route::middleware(['auth:sanctum', 'role:docente,administrador'])->group(function () {
    Route::apiResource('students', StudentController::class);
});
