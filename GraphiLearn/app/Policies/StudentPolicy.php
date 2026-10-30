<?php

namespace App\Policies;

use App\Models\Student;
use App\Models\User;

class StudentPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->esDocente() || $user->esAdministrador();
    }

    public function view(User $user, Student $student): bool
    {
        return $user->puedeAccederAlEstudiante($student);
    }

    public function create(User $user): bool
    {
        return $user->esDocente();
    }

    public function update(User $user, Student $student): bool
    {
        return $user->esDocente() && $this->view($user, $student);
    }

    public function delete(User $user, Student $student): bool
    {
        return $user->esDocente() && $this->view($user, $student);
    }
}
