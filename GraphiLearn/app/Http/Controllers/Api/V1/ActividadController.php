<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Actividad\StoreActividadRequest;
use App\Http\Resources\ActividadResource;
use App\Models\Actividad;
use App\Models\Student;
use App\Models\ScheduledActivity;
use App\Services\ActividadService;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Gate;

class ActividadController extends Controller
{
    public function __construct(
        protected ActividadService $actividadService
    ) {}

    /**
     * Listado de actividades grafomotoras con filtrado por rol y parámetros.
     *
     * GET /api/v1/actividades
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        Gate::authorize('viewAny', Actividad::class);

        $query = $this->actividadService->querySegunRol($request->user());

        if ($request->filled('id_estudiante')) {
            $query->where('id_estudiante', $request->query('id_estudiante'));
        }

        if ($request->filled('id_ejercicio')) {
            $query->where('id_ejercicio', $request->query('id_ejercicio'));
        }

        if ($request->filled('estado')) {
            $query->where('estado', $request->query('estado'));
        }

        if ($request->filled('fecha_desde')) {
            $query->whereDate('fecha', '>=', $request->query('fecha_desde'));
        }

        if ($request->filled('fecha_hasta')) {
            $query->whereDate('fecha', '<=', $request->query('fecha_hasta'));
        }

        $perPage = min((int) $request->query('per_page', 15), 50);
        $actividades = $query->latest('fecha')->paginate($perPage);

        return ActividadResource::collection($actividades);
    }

    /**
     * Registrar una nueva actividad grafomotora para un estudiante.
     *
     * POST /api/v1/actividades
     */
    public function store(StoreActividadRequest $request): JsonResponse
    {
        Gate::authorize('create', Actividad::class);

        $student = Student::with('curso')->findOrFail($request->validated('id_estudiante'));

        // Verificar pertenencia del estudiante
        if (! $this->actividadService->estudiantePerteneceAlDocente($request->user(), $student)) {
            return response()->json([
                'message' => 'No tiene permisos para registrar actividades para este estudiante.',
            ], 403);
        }

        $scheduledId = $request->validated('scheduled_activity_id');
        if ($scheduledId) {
            $scheduled = ScheduledActivity::with('exercises')->findOrFail($scheduledId);
            if (! $scheduled->active || (int) $scheduled->course_id !== (int) $student->id_curso
                || ! $scheduled->exercises->contains('id', (int) $request->validated('id_ejercicio'))) {
                return response()->json(['message' => 'La actividad programada no corresponde al curso y ejercicio seleccionados.'], 422);
            }

            $alreadyRecorded = Actividad::withTrashed()
                ->where('scheduled_activity_id', $scheduled->id)
                ->where('id_estudiante', $student->id)
                ->where('id_ejercicio', $request->validated('id_ejercicio'))
                ->exists();
            if ($alreadyRecorded) {
                return response()->json(['message' => 'Este ejercicio ya fue registrado para el estudiante en esta programación.'], 409);
            }
        }

        try {
            $actividad = Actividad::create([
                'id_estudiante' => $request->validated('id_estudiante'),
                'id_ejercicio'  => $request->validated('id_ejercicio'),
                'scheduled_activity_id' => $scheduledId,
                'fecha'         => $request->validated('fecha'),
                'estado'        => 'pendiente',
            ]);
        } catch (QueryException $exception) {
            if ($scheduledId && ($exception->errorInfo[0] ?? null) === '23505') {
                return response()->json(['message' => 'Este ejercicio ya fue registrado para el estudiante en esta programación.'], 409);
            }
            throw $exception;
        }

        $actividad->load(['estudiante.curso', 'ejercicio']);

        return response()->json([
            'message' => 'Actividad grafomotora registrada exitosamente.',
            'data'    => new ActividadResource($actividad),
        ], 201);
    }

    /**
     * Consultar detalle de una actividad.
     *
     * GET /api/v1/actividades/{actividad}
     */
    public function show(Actividad $actividad): JsonResponse
    {
        $actividad->load(['estudiante.curso', 'ejercicio', 'scheduledActivity.exercises', 'imagen', 'analysisResult', 'evaluationHistory.changedBy']);
        Gate::authorize('view', $actividad);

        return response()->json([
            'data' => new ActividadResource($actividad),
        ]);
    }

    /**
     * Eliminar una actividad grafomotora.
     *
     * DELETE /api/v1/actividades/{actividad}
     */
    public function destroy(Actividad $actividad): JsonResponse
    {
        $actividad->load('estudiante.curso');
        Gate::authorize('delete', $actividad);

        $actividad->delete();

        return response()->json([
            'message' => 'Actividad eliminada exitosamente.',
        ]);
    }
}
