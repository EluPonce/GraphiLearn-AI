<?php

namespace App\Policies;

use App\Models\Imagen;
use App\Models\User;

class ImagenPolicy
{
    public function view(User $user, Imagen $imagen): bool
    {
        $imagen->loadMissing('actividad.estudiante.curso');
        $student = $imagen->actividad?->estudiante;

        return $user->esDocente() && $student !== null && $user->puedeAccederAlEstudiante($student);
    }

    public function create(User $user): bool
    {
        return $user->esDocente();
    }
}
