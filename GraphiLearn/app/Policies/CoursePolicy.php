<?php

namespace App\Policies;

use App\Models\Course;
use App\Models\User;

class CoursePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->esDocente() || $user->esAdministrador();
    }

    public function view(User $user, Course $course): bool
    {
        return $user->puedeAccederAlCurso($course);
    }

    public function create(User $user): bool
    {
        return $user->esAdministrador() && $user->institution_id !== null;
    }

    public function update(User $user, Course $course): bool
    {
        return $user->esAdministrador() && $user->puedeAccederAlCurso($course);
    }

    public function delete(User $user, Course $course): bool
    {
        return $this->update($user, $course);
    }
}
