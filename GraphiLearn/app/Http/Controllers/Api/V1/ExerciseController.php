<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Exercise\StoreExerciseRequest;
use App\Http\Requests\Exercise\UpdateExerciseRequest;
use App\Http\Resources\ExerciseResource;
use App\Models\Exercise;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Gate;

class ExerciseController extends Controller
{
    /**
     * Catálogo de ejercicios grafomotores disponibles.
     *
     * GET /api/v1/exercises
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        Gate::authorize('viewAny', Exercise::class);

        $query = Exercise::query();
        if ($request->user()->esDocente()) $query->where('activo', true);

        if ($request->filled('tipo_trazo')) {
            $query->where('tipo_trazo', $request->query('tipo_trazo'));
        }

        if ($request->filled('search')) {
            $search = $request->query('search');
            $query->where('nombre', 'like', "%{$search}%");
        }

        $perPage = min((int) $request->query('per_page', 20), 50);
        $exercises = $query->latest()->paginate($perPage);

        return ExerciseResource::collection($exercises);
    }

    /**
     * Registrar un nuevo ejercicio grafomotor en el catálogo.
     *
     * POST /api/v1/exercises
     */
    public function store(StoreExerciseRequest $request): JsonResponse
    {
        Gate::authorize('create', Exercise::class);

        $exercise = Exercise::create($request->validated());

        return response()->json([
            'message' => 'Ejercicio grafomotor registrado exitosamente.',
            'data'    => new ExerciseResource($exercise),
        ], 201);
    }

    /**
     * Consultar detalle de un ejercicio.
     *
     * GET /api/v1/exercises/{exercise}
     */
    public function show(Exercise $exercise): JsonResponse
    {
        Gate::authorize('view', $exercise);

        return response()->json([
            'data' => new ExerciseResource($exercise),
        ]);
    }

    /**
     * Actualizar datos de un ejercicio.
     *
     * PUT/PATCH /api/v1/exercises/{exercise}
     */
    public function update(UpdateExerciseRequest $request, Exercise $exercise): JsonResponse
    {
        Gate::authorize('update', $exercise);

        $exercise->update($request->validated());

        return response()->json([
            'message' => 'Ejercicio actualizado exitosamente.',
            'data'    => new ExerciseResource($exercise->fresh()),
        ]);
    }

    /**
     * Eliminar un ejercicio (solo si no tiene actividades asociadas).
     *
     * DELETE /api/v1/exercises/{exercise}
     */
    public function destroy(Exercise $exercise): JsonResponse
    {
        Gate::authorize('delete', $exercise);

        $exercise->update(['activo' => false]);

        return response()->json([
            'message' => 'Ejercicio desactivado exitosamente.',
        ]);
    }
}
