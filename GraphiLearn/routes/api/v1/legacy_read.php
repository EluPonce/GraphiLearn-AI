<?php

use App\Http\Controllers\Api\V1\LegacyReadController;
use Illuminate\Support\Facades\Route;

// Read-only compatibility endpoints used by the currently deployed React client.
Route::middleware(['auth:sanctum', 'role:docente,direccion'])->group(function () {
    Route::get('actividades', [LegacyReadController::class, 'activities']);
    Route::get('actividades/{photoId}', [LegacyReadController::class, 'show']);
    Route::get('actividades/{photoId}/resultado', [LegacyReadController::class, 'result']);
    Route::get('actividades/{photoId}/evaluacion/historial', [LegacyReadController::class, 'history']);
    Route::get('imagenes/{photoId}/download', [LegacyReadController::class, 'image']);
    Route::get('actividades-programadas', [LegacyReadController::class, 'scheduledActivities']);
    Route::get('students/{studentId}/progress', [LegacyReadController::class, 'studentProgress']);
    Route::get('cursos/{courseId}/seguimiento', [LegacyReadController::class, 'courseProgress']);
});
