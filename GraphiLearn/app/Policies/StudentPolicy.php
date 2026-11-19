<?php

namespace App\Policies;

use App\Models\Student;
use App\Models\User;

class StudentPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->esDocente() || $user->esDireccion();
    }

    public function view(User $user, Student $student): bool
    {
        return $user->puedeAccederAlEstudiante($student);
    }

    public function create(User $user): bool
    {
        return false;
    }

    public function update(User $user, Student $student): bool
    {
        return false;
    }

    public function delete(User $user, Student $student): bool
    {
        return false;
    }

    public function restore(User $user, Student $student): bool
    {
        return false;
    }
}
