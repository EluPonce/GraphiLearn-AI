<?php

use App\Http\Controllers\Api\V1\StudentController;
use App\Http\Controllers\Api\V1\StudentProgressController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Rutas del Módulo de Estudiantes (API v1)
|--------------------------------------------------------------------------
*/

Route::middleware(['auth:sanctum', 'role:docente,direccion'])->group(function () {
    Route::get('students', [StudentController::class, 'index']);
    Route::get('students/{student}', [StudentController::class, 'show']);
});
