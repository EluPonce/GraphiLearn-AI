<?php

namespace App\Policies;

use App\Models\Actividad;
use App\Models\User;

class ActividadPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->esDocente();
    }

    public function view(User $user, Actividad $actividad): bool
    {
        return $this->puedeAcceder($user, $actividad);
    }

    public function create(User $user): bool
    {
        return $user->esDocente();
    }

    public function update(User $user, Actividad $actividad): bool
    {
        return $this->puedeAcceder($user, $actividad);
    }

    public function delete(User $user, Actividad $actividad): bool
    {
        return $this->puedeAcceder($user, $actividad);
    }

    private function puedeAcceder(User $user, Actividad $actividad): bool
    {
        $actividad->loadMissing('estudiante.curso');

        return $user->esDocente() && $actividad->estudiante !== null
            && $user->puedeAccederAlEstudiante($actividad->estudiante);
    }
}
