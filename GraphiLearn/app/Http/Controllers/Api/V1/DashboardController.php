<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\FotoEjercicio;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $courses = $user->cursosAccesibles();

        $courseIds = (clone $courses)->pluck('id');
        $studentIds = Student::whereIn('id_curso', $courseIds)->pluck('id');
        // Include legacy migrated photos with a null id_evaluacion, scoped through
        // the students in courses the current user can access.
        $photos = FotoEjercicio::whereIn('id_estudiante', $studentIds);

        return response()->json([
            'rol' => $user->rol,
            'stats' => [
                'cursos' => $courseIds->count(),
                'estudiantes' => $studentIds->count(),
                'fotos' => (clone $photos)->whereNotNull('ruta_imagen')->count(),
                'valoraciones' => (clone $photos)->where('estado', 'valorado')->count(),
            ],
            'cursos' => $courses->withCount('estudiantes')->get(),
        ]);
    }
}
