<?php

namespace App\Providers;

use App\Models\Actividad;
use App\Models\Exercise;
use App\Models\Imagen;
use App\Models\Student;
use App\Policies\ActividadPolicy;
use App\Policies\ExercisePolicy;
use App\Policies\ImagenPolicy;
use App\Policies\StudentPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Registro explícito de Policies (Sprint 1)
        Gate::policy(Student::class, StudentPolicy::class);
        Gate::policy(Exercise::class, ExercisePolicy::class);
        Gate::policy(Actividad::class, ActividadPolicy::class);
        Gate::policy(Imagen::class, ImagenPolicy::class);
    }
}
