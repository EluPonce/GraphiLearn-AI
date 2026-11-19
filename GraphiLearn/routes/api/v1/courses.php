<?php

use App\Http\Controllers\Api\V1\CourseController;
use App\Http\Controllers\Api\V1\CourseProgressController;
use App\Http\Controllers\Api\V1\TeacherController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Rutas del Módulo de Cursos (API v1)
|--------------------------------------------------------------------------
*/

// GET cursos ("Mis cursos" de la docente) se define en evaluaciones.php.
// Dirección consulta sus cursos en GET direccion/cursos. CourseController@index
// se conserva sin ruta para no sobrescribir en silencio la lista del flujo nuevo.
Route::middleware(['auth:sanctum', 'role:docente,direccion'])->group(function () {
    Route::get('cursos/{course}', [CourseController::class, 'show']);
});
