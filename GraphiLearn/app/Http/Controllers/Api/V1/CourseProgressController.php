<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class CourseProgressController extends Controller
{
    public function show(Request $request, Course $course)
    {
        abort_unless($request->user()->esDocente(), 403);
        Gate::authorize('view', $course);

        $executions = $course->estudiantes()->withCount('actividades')->get()->sum('actividades_count');
        $evaluated = $course->estudiantes()->with(['actividades' => fn ($query) => $query->whereNotNull('pedagogical_rating')])->get()
            ->sum(fn ($student) => $student->actividades->count());
        $byExercise = $course->estudiantes()
            ->join('actividades', 'actividades.id_estudiante', '=', 'students.id')
            ->join('exercises', 'exercises.id', '=', 'actividades.id_ejercicio')
            ->whereNull('actividades.deleted_at')
            ->selectRaw('exercises.id, exercises.nombre, COUNT(actividades.id) AS executions_count, COUNT(actividades.pedagogical_rating) AS evaluated_count')
            ->groupBy('exercises.id', 'exercises.nombre')
            ->orderBy('exercises.id')
            ->get();

        return response()->json(['data' => [
            'course_id' => $course->id,
            'executions_count' => (int) $executions,
            'evaluated_count' => (int) $evaluated,
            'by_exercise' => $byExercise,
        ]]);
    }
}
