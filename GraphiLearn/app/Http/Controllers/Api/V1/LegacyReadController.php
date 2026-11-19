<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\FotoEjercicio;
use App\Models\ScheduledActivity;
use App\Models\Student;
use Illuminate\Support\Facades\Gate;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

/** Read-only bridge for the existing React screens after the Phase 1 rename. */
class LegacyReadController extends Controller
{
    public function activities(Request $request): JsonResponse
    {
        $query = $this->visiblePhotos($request->user())->with([
            'estudiante.curso', 'ejercicio', 'analisis', 'valoradoPor',
        ]);
        foreach (['id_estudiante', 'id_ejercicio', 'estado'] as $filter) {
            if ($request->filled($filter)) $query->where($filter, $request->query($filter));
        }
        if ($request->filled('fecha_desde')) $query->whereDate('fecha', '>=', $request->query('fecha_desde'));
        if ($request->filled('fecha_hasta')) $query->whereDate('fecha', '<=', $request->query('fecha_hasta'));

        $items = $query->orderByDesc('fecha')->orderByDesc('id')->paginate(min((int) $request->query('per_page', 15), 50));
        return response()->json([
            'data' => $items->getCollection()->map(fn (FotoEjercicio $photo) => $this->photoData($photo))->values(),
            'links' => ['first' => $items->url(1), 'last' => $items->url($items->lastPage()), 'prev' => $items->previousPageUrl(), 'next' => $items->nextPageUrl()],
            'meta' => ['current_page' => $items->currentPage(), 'last_page' => $items->lastPage(), 'per_page' => $items->perPage(), 'total' => $items->total()],
        ]);
    }

    public function show(Request $request, int $photoId): JsonResponse
    {
        $photo = $this->visiblePhotos($request->user())->with(['estudiante.curso', 'ejercicio', 'analisis', 'valoradoPor'])->findOrFail($photoId);
        return response()->json(['data' => $this->photoData($photo)]);
    }

    public function result(Request $request, int $photoId): JsonResponse
    {
        $photo = $this->visiblePhotos($request->user())->with('analisis')->findOrFail($photoId);
        abort_unless($photo->analisis, 404, 'La foto no tiene un análisis guardado.');
        $analysis = $photo->analisis;
        $indicators = $analysis->indicadores ?? [];
        $features = $analysis->caracteristicas ?? [];
        return response()->json(['data' => [
            'id' => $analysis->id, 'actividad_id' => $photo->id,
            'caracteristicas_geometricas' => $features, 'indicadores_cuantitativos' => $indicators,
            'sugerencia' => $analysis->sugerencia,
            'clasificacion' => ['disponible' => in_array($analysis->sugerencia, ['S', 'ED', 'NA'], true), 'sugerencia' => $analysis->sugerencia],
            'estado' => $analysis->estado,
        ]]);
    }

    public function history(Request $request, int $photoId): JsonResponse
    {
        $photo = $this->visiblePhotos($request->user())->findOrFail($photoId);
        $rows = \Illuminate\Support\Facades\DB::table('activity_evaluation_history as h')
            ->leftJoin('users as u', 'u.id', '=', 'h.changed_by')->where('h.actividad_id', $photo->id)
            ->orderByDesc('h.created_at')->get(['h.id', 'h.created_at', 'h.pedagogical_rating', 'h.pedagogical_observations', 'u.nombre as changed_by_name'])
            ->map(fn ($row) => ['id' => $row->id, 'created_at' => $row->created_at, 'pedagogical_rating' => $row->pedagogical_rating, 'pedagogical_observations' => $row->pedagogical_observations, 'changed_by' => ['nombre' => $row->changed_by_name]]);
        return response()->json(['data' => $rows]);
    }

    public function image(Request $request, int $photoId): StreamedResponse
    {
        $photo = $this->visiblePhotos($request->user())->findOrFail($photoId);
        abort_unless($photo->ruta_imagen && Storage::disk('private')->exists($photo->ruta_imagen), 404, 'No se encontró la foto privada.');
        return Storage::disk('private')->response($photo->ruta_imagen);
    }

    public function scheduledActivities(Request $request): JsonResponse
    {
        $items = ScheduledActivity::with(['course', 'exercise', 'exercises'])
            ->whereIn('course_id', $request->user()->cursosAccesibles()->select('id'))
            ->when($request->user()->esDocente(), fn ($q) => $q->where('active', true))
            ->latest()->get()->map(function (ScheduledActivity $item) {
                $item->setAttribute('executions_count', FotoEjercicio::where('scheduled_activity_id', $item->id)->count());
                $item->setAttribute('evaluated_executions_count', FotoEjercicio::where('scheduled_activity_id', $item->id)->whereNotNull('valoracion')->count());
                return $item;
            });
        return response()->json(['data' => $items]);
    }

    public function studentProgress(Request $request, int $studentId): JsonResponse
    {
        $student = Student::withTrashed()->with('curso.docente')->findOrFail($studentId);
        Gate::authorize('view', $student);
        $photos = $this->visiblePhotos($request->user())->where('id_estudiante', $student->id)
            ->with(['estudiante.curso', 'ejercicio', 'analisis', 'valoradoPor', 'evaluacion'])
            ->orderBy('fecha')->orderBy('id')->get();
        $programs = $student->curso->scheduledActivities()->where('active', true)->with(['exercise', 'exercises'])->orderBy('scheduled_for')->get();
        $comparisons = $photos->filter(fn ($photo) => $photo->valoracion && $photo->evaluacion?->trimestre)
            ->groupBy('id_ejercicio')->map(function ($items, $exerciseId) {
                $periods = $items->groupBy(fn ($photo) => 'T'.$photo->evaluacion->trimestre)->map(fn ($periodItems, $term) => [
                    'period_reference' => $term,
                    'evaluations' => $periodItems->map(fn ($photo) => ['activity_id' => $photo->id, 'date' => $photo->fecha?->format('Y-m-d'), 'rating' => $photo->valoracion, 'observations' => null])->values(),
                ])->values();
                if ($periods->count() < 2) return null;
                return ['exercise_id' => (int) $exerciseId, 'exercise_name' => $items->first()->ejercicio?->nombre, 'periods' => $periods];
            })->filter()->values();

        return response()->json(['data' => [
            'student' => ['id' => $student->id, 'nombre' => $student->nombre, 'fecha_nacimiento' => $student->fecha_nacimiento?->format('Y-m-d'), 'administrative_status' => $student->deleted_at ? 'Inactivo' : 'Activo', 'course' => ['id' => $student->curso->id, 'nombre' => $student->curso->nombre, 'nivel' => $student->curso->nivel, 'teacher' => $student->curso->docente?->nombre]],
            'scheduled_activities' => $programs,
            'executions' => $photos->map(fn (FotoEjercicio $photo) => $this->photoData($photo))->values(),
            'comparable_evolution' => $comparisons,
        ]]);
    }

    public function courseProgress(Request $request, int $courseId): JsonResponse
    {
        $course = Course::findOrFail($courseId);
        abort_unless($request->user()->puedeAccederAlCurso($course), 403);
        $query = FotoEjercicio::whereIn('id_estudiante', Student::where('id_curso', $course->id)->select('id'));
        $total = (clone $query)->count();
        $rated = (clone $query)->whereNotNull('valoracion')->count();
        $rows = (clone $query)->join('exercises', 'exercises.id', '=', 'fotos_ejercicio.id_ejercicio')
            ->selectRaw('exercises.id, exercises.nombre, COUNT(fotos_ejercicio.id) AS executions_count, COUNT(fotos_ejercicio.valoracion) AS evaluated_count')
            ->groupBy('exercises.id', 'exercises.nombre')->orderBy('exercises.id')->get();
        return response()->json(['data' => ['course_id' => $course->id, 'executions_count' => $total, 'evaluated_count' => $rated, 'by_exercise' => $rows]]);
    }

    private function visiblePhotos($user)
    {
        $studentIds = Student::whereIn('id_curso', $user->cursosAccesibles()->select('id'))->select('id');
        return FotoEjercicio::whereIn('id_estudiante', $studentIds);
    }

    private function photoData(FotoEjercicio $photo): array
    {
        $oldStatus = $photo->valoracion ? 'procesado' : ($photo->ruta_imagen ? 'foto_lista' : 'sin_foto');
        $analysis = $photo->analisis;
        $hasImage = filled($photo->ruta_imagen);
        return [
            'id' => $photo->id, 'id_estudiante' => $photo->id_estudiante, 'id_ejercicio' => $photo->id_ejercicio,
            'scheduled_activity_id' => $photo->scheduled_activity_id, 'fecha' => $photo->fecha?->format('Y-m-d'),
            'estado' => $oldStatus, 'pedagogical_rating' => $photo->valoracion,
            'evaluated_by_name' => $photo->valoradoPor?->nombre, 'pedagogical_observations' => null,
            'period_reference' => $photo->evaluacion?->trimestre ? 'T'.$photo->evaluacion->trimestre : null,
            'estudiante' => $photo->estudiante ? ['id' => $photo->estudiante->id, 'nombre' => $photo->estudiante->nombre, 'id_curso' => $photo->estudiante->id_curso, 'curso' => $photo->estudiante->curso ? ['id' => $photo->estudiante->curso->id, 'nombre' => $photo->estudiante->curso->nombre, 'nivel' => $photo->estudiante->curso->nivel] : null] : null,
            'ejercicio' => $photo->ejercicio ? ['id' => $photo->ejercicio->id, 'nombre' => $photo->ejercicio->nombre, 'tipo_trazo' => $photo->ejercicio->tipo_trazo] : null,
            'imagen' => $hasImage ? ['id' => $photo->id, 'id_actividad' => $photo->id, 'formato' => $photo->legacy_imagen_formato, 'fecha_carga' => $photo->legacy_imagen_fecha_carga] : null,
            'imagenes' => $hasImage ? [['id' => $photo->id]] : [],
            'analysis_result' => $analysis ? ['id' => $analysis->id, 'sugerencia' => $analysis->sugerencia, 'indicadores_cuantitativos' => $analysis->indicadores, 'caracteristicas_geometricas' => $analysis->caracteristicas] : null,
            'created_at' => $photo->created_at?->toISOString(), 'updated_at' => $photo->updated_at?->toISOString(),
        ];
    }
}
