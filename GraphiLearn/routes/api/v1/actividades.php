<?php

use App\Http\Controllers\Api\V1\ActividadController;
use App\Http\Controllers\Api\V1\ImagenController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Rutas del Módulo de Actividades e Imágenes Grafomotoras (API v1)
|--------------------------------------------------------------------------
*/

Route::middleware(['auth:sanctum', 'role:docente,administrador'])->group(function () {
    // Actividades
    Route::apiResource('actividades', ActividadController::class)->except(['update']);

    // Carga de Imagen para Actividad
    Route::post('actividades/{actividad}/imagen', [ImagenController::class, 'store']);

    // Descarga y eliminación de imagen
    Route::get('imagenes/{imagen}/download', [ImagenController::class, 'download']);
    Route::delete('imagenes/{imagen}', [ImagenController::class, 'destroy']);
});
