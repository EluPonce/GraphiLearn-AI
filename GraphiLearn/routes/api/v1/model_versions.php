<?php

use App\Http\Controllers\Api\V1\ModelVersionController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Rutas de Administración de Versiones del Modelo ML (HU-16)
| Solo accesibles por usuarios con rol 'administrador'
|--------------------------------------------------------------------------
*/

Route::middleware(['auth:sanctum', 'role:administrador'])->group(function () {
    Route::get('model-versions', [ModelVersionController::class, 'index']);
    Route::post('model-versions', [ModelVersionController::class, 'store']);
    Route::post('model-versions/{modelVersion}/activate', [ModelVersionController::class, 'activate']);
    Route::post('model-versions/{modelVersion}/deactivate', [ModelVersionController::class, 'deactivate']);
});
