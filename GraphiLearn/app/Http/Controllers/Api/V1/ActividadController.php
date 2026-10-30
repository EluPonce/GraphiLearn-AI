<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Actividad\StoreActividadRequest;
use App\Http\Resources\ActividadResource;
use App\Models\Actividad;
use App\Models\Student;
use App\Services\ActividadService;
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

        $actividad = Actividad::create([
            'id_estudiante' => $request->validated('id_estudiante'),
            'id_ejercicio'  => $request->validated('id_ejercicio'),
            'fecha'         => $request->validated('fecha'),
            'estado'        => 'pendiente',
        ]);

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
        $actividad->load(['estudiante.curso', 'ejercicio', 'imagen', 'analysisResult']);
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
