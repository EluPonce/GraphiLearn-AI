<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes (GraphiLearn AI)
|--------------------------------------------------------------------------
*/

// Rutas con prefijo v1
Route::prefix('v1')->group(function () {
    require __DIR__.'/api/v1/auth.php';
    require __DIR__.'/api/v1/dashboard.php';
    require __DIR__.'/api/v1/courses.php';
    require __DIR__.'/api/v1/students.php';
    require __DIR__.'/api/v1/exercises.php';
    require __DIR__.'/api/v1/actividades.php';
    require __DIR__.'/api/v1/analysis.php';
    if (file_exists(__DIR__.'/api/v1/model_versions.php')) {
        require __DIR__.'/api/v1/model_versions.php';
    }
});

// Alias directos bajo /api/ para compatibilidad total con la especificación de Sprint 1
Route::group([], function () {
    require __DIR__.'/api/v1/auth.php';
    require __DIR__.'/api/v1/dashboard.php';
    require __DIR__.'/api/v1/courses.php';
    require __DIR__.'/api/v1/students.php';
    require __DIR__.'/api/v1/exercises.php';
    require __DIR__.'/api/v1/actividades.php';
    require __DIR__.'/api/v1/analysis.php';
    if (file_exists(__DIR__.'/api/v1/model_versions.php')) {
        require __DIR__.'/api/v1/model_versions.php';
    }
});
