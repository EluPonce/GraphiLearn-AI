<?php

namespace App\Services;

use App\Models\Actividad;
use App\Models\Student;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;

class ActividadService
{
    public function querySegunRol(User $user): Builder
    {
        $studentIds = Student::query()
            ->whereIn('id_curso', $user->cursosAccesibles()->select('id'))
            ->select('id');

        return Actividad::with(['estudiante.curso', 'ejercicio', 'imagen'])
            ->whereIn('id_estudiante', $studentIds);
    }

    public function estudiantePerteneceAlDocente(User $user, Student $student): bool
    {
        return $user->puedeAccederAlEstudiante($student);
    }
}
