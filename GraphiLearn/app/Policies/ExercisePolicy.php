<?php

namespace App\Policies;

use App\Models\Exercise;
use App\Models\User;

class ExercisePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->esDocente() || $user->esDireccion();
    }

    public function view(User $user, Exercise $exercise): bool
    {
        return ($user->esDocente() || $user->esDireccion()) && $exercise->activo;
    }

    /**
     * Docente y administrador pueden crear ejercicios.
     */
    public function create(User $user): bool
    {
        return false;
    }

    /**
     * Docente y administrador pueden editar ejercicios.
     */
    public function update(User $user, Exercise $exercise): bool
    {
        return false;
    }

    /**
     * Solo el administrador puede eliminar ejercicios.
     * Además, un ejercicio con actividades no puede eliminarse
     * (enforced via restrictOnDelete en BD y en el service).
     */
    public function delete(User $user, Exercise $exercise): bool
    {
        return false;
    }
}
