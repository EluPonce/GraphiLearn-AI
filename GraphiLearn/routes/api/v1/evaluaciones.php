<?php

use App\Http\Controllers\Api\V1\EvaluationFlowController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum', 'role:docente'])->group(function () {
    Route::get('cursos', [EvaluationFlowController::class, 'courses']);
    Route::post('evaluaciones', [EvaluationFlowController::class, 'create']);
    Route::post('evaluaciones/{evaluationId}/estudiantes/{studentId}/ejercicios/{exercise}/foto', [EvaluationFlowController::class, 'upload']);
    Route::put('evaluaciones/{evaluationId}/estudiantes/{studentId}/ejercicios/{exercise}/valoracion', [EvaluationFlowController::class, 'rate']);
});

Route::middleware(['auth:sanctum', 'role:docente,direccion'])->get('cursos/{courseId}/evaluaciones/{trimestre}', [EvaluationFlowController::class, 'grid']);

// Lectura compartida: Dirección solo lee (la Policy limita a su institución).
Route::middleware(['auth:sanctum', 'role:docente,direccion'])->group(function () {
    Route::get('informes/curso/{courseId}', [EvaluationFlowController::class, 'report']);
    Route::get('estudiantes/{studentId}/ficha', [EvaluationFlowController::class, 'studentSheet']);
    Route::get('fotos/{photoId}/etapas', [EvaluationFlowController::class, 'stages']);
});

Route::middleware(['auth:sanctum', 'role:direccion'])->get('direccion/cursos', [EvaluationFlowController::class, 'directionCourses']);
