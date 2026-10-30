<?php

use App\Http\Controllers\Api\V1\DashboardController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Rutas del Módulo de Dashboard (API v1)
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index']);
});
