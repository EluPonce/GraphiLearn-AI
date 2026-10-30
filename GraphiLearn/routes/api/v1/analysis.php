<?php

use App\Http\Controllers\Api\V1\AnalysisController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum', 'role:docente'])
    ->group(function () {
        Route::post('actividades/{actividad}/procesar', [AnalysisController::class, 'process']);
        Route::get('actividades/{actividad}/resultado', [AnalysisController::class, 'show']);
    });
