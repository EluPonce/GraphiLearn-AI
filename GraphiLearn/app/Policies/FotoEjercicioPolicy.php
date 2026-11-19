<?php

namespace App\Policies;

use App\Models\FotoEjercicio;
use App\Models\User;

class FotoEjercicioPolicy
{
    public function view(User $user, FotoEjercicio $foto): bool
    {
        $foto->loadMissing('evaluacion.curso');
        return $foto->evaluacion !== null && $user->puedeAccederAlCurso($foto->evaluacion->curso);
    }

    public function update(User $user, FotoEjercicio $foto): bool
    {
        $foto->loadMissing('evaluacion.curso');
        return $user->esDocente() && $foto->evaluacion !== null && $foto->evaluacion->curso?->active && $user->puedeAccederAlCurso($foto->evaluacion->curso);
    }
}
