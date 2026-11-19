<?php

namespace App\Providers;

use App\Models\Actividad;
use App\Models\Exercise;
use App\Models\Imagen;
use App\Models\Student;
use App\Models\Course;
use App\Models\Evaluacion;
use App\Models\FotoEjercicio;
use App\Policies\EvaluacionPolicy;
use App\Policies\FotoEjercicioPolicy;
use App\Policies\ActividadPolicy;
use App\Policies\ExercisePolicy;
use App\Policies\ImagenPolicy;
use App\Policies\StudentPolicy;
use App\Policies\CoursePolicy;
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
        Gate::policy(Course::class, CoursePolicy::class);
        Gate::policy(Exercise::class, ExercisePolicy::class);
        Gate::policy(Actividad::class, ActividadPolicy::class);
        Gate::policy(Imagen::class, ImagenPolicy::class);
        Gate::policy(Evaluacion::class, EvaluacionPolicy::class);
        Gate::policy(FotoEjercicio::class, FotoEjercicioPolicy::class);
    }
}
