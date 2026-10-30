<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Actividad;
use App\Models\AnalysisResult;
use App\Models\Exercise;
use App\Models\Student;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $courses = $user->cursosAccesibles();

        if ($user->esAdministrador()) {
            $courseIds = (clone $courses)->pluck('id');
            $studentIds = Student::whereIn('id_curso', $courseIds)->pluck('id');
            $activities = Actividad::whereIn('id_estudiante', $studentIds);
            $results = AnalysisResult::whereHas('actividad', function ($query) use ($studentIds) {
                $query->whereIn('id_estudiante', $studentIds);
            });

            return response()->json([
                'rol' => 'administrador',
                'stats' => [
                    'total_cursos' => $courseIds->count(),
                    'total_docentes' => User::where('rol', 'docente')
                        ->where('institution_id', $user->institution_id)->count(),
                    'total_estudiantes' => $studentIds->count(),
                    'total_ejercicios' => Exercise::where('activo', true)->count(),
                    'total_actividades' => (clone $activities)->count(),
                    'actividades_pendientes' => (clone $activities)->where('estado', 'pendiente')->count(),
                    'actividades_con_imagen' => (clone $activities)->whereHas('imagen')->count(),
                    'resultados_revisados' => (clone $results)->whereIn('estado_revision', ['aprobada', 'rechazada'])->count(),
                ],
                'cursos' => $courses->with('docente')->withCount('estudiantes')->get(),
            ]);
        }

        $courseIds = (clone $courses)->pluck('id');
        $studentIds = Student::whereIn('id_curso', $courseIds)->pluck('id');
        $activities = Actividad::whereIn('id_estudiante', $studentIds);

        return response()->json([
            'rol' => 'docente',
            'stats' => [
                'mis_cursos' => $courseIds->count(),
                'mis_estudiantes' => $studentIds->count(),
                'total_ejercicios' => Exercise::where('activo', true)->count(),
                'total_actividades' => (clone $activities)->count(),
                'actividades_pendientes' => (clone $activities)->where('estado', 'pendiente')->count(),
                'actividades_con_imagen' => (clone $activities)->whereHas('imagen')->count(),
            ],
            'cursos' => $courses->withCount('estudiantes')->get(),
        ]);
    }
}
