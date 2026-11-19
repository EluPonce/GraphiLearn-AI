<?php

namespace App\Policies;

use App\Models\Evaluacion;
use App\Models\User;

class EvaluacionPolicy
{
    public function viewAny(User $user): bool { return $user->esDocente() || $user->esDireccion(); }
    public function view(User $user, Evaluacion $evaluacion): bool { return $user->puedeAccederAlCurso($evaluacion->curso); }
    public function create(User $user): bool { return $user->esDocente(); }
    public function update(User $user, Evaluacion $evaluacion): bool { return $user->esDocente() && $evaluacion->curso?->active && $user->puedeAccederAlCurso($evaluacion->curso); }
}
