<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Student\StoreStudentRequest;
use App\Http\Requests\Student\UpdateStudentRequest;
use App\Http\Resources\StudentResource;
use App\Models\Course;
use App\Models\Student;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Gate;

class StudentController extends Controller
{
    /**
     * Listado paginado de estudiantes con filtro de visibilidad por rol.
     *
     * GET /api/v1/students
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        Gate::authorize('viewAny', Student::class);

        $user = $request->user();
        $query = Student::query()->with('curso')
            ->whereIn('id_curso', $user->cursosAccesibles()->select('id'));

        if ($user->esAdministrador() && $request->boolean('include_inactive')) {
            $query->withTrashed();
        }

        if ($request->filled('id_curso')) {
            $query->where('id_curso', $request->query('id_curso'));
        }

        if ($request->filled('search')) {
            $search = $request->query('search');
            $query->where('nombre', 'like', "%{$search}%");
        }

        $perPage = min((int) $request->query('per_page', 15), 50);
        $students = $query->latest()->paginate($perPage);

        return StudentResource::collection($students);
    }

    /**
     * Registrar un nuevo estudiante.
     *
     * POST /api/v1/students
     */
    public function store(StoreStudentRequest $request): JsonResponse
    {
        Gate::authorize('create', Student::class);

        $user = $request->user();
        $course = Course::findOrFail($request->validated('id_curso'));

        if (! $course->active || ! $user->puedeAccederAlCurso($course)) {
            return response()->json([
                'message' => 'No tiene permisos para asignar estudiantes a este curso.',
            ], 403);
        }

        // Si es docente, solo puede agregar estudiantes a sus propios cursos
        if ($user->esDocente() && $course->id_docente !== $user->id) {
            return response()->json([
                'message' => 'No tiene permisos para asignar estudiantes a este curso.',
            ], 403);
        }

        // Si es administrador, solo puede agregar en su institución
        if ($user->esAdministrador() && $user->institution_id && $course->institution_id !== $user->institution_id) {
            return response()->json([
                'message' => 'El curso no pertenece a su institución.',
            ], 403);
        }

        $student = Student::create($request->validated());
        $student->load('curso');

        return response()->json([
            'message' => 'Estudiante registrado exitosamente.',
            'data'    => new StudentResource($student),
        ], 201);
    }

    /**
     * Consultar detalle de un estudiante.
     *
     * GET /api/v1/students/{student}
     */
    public function show(Student $student): JsonResponse
    {
        $student->load('curso');
        Gate::authorize('view', $student);

        return response()->json([
            'data' => new StudentResource($student),
        ]);
    }

    /**
     * Actualizar datos del estudiante.
     *
     * PUT/PATCH /api/v1/students/{student}
     */
    public function update(UpdateStudentRequest $request, Student $student): JsonResponse
    {
        $student->load('curso');
        Gate::authorize('update', $student);

        if ($request->validated('id_curso')) {
            $targetCourse = Course::findOrFail($request->validated('id_curso'));
            if (! $targetCourse->active || ! $request->user()->puedeAccederAlCurso($targetCourse)) {
                return response()->json([
                    'message' => 'No tiene permisos para mover este estudiante al curso indicado.',
                ], 403);
            }
        }

        $student->update($request->validated());

        return response()->json([
            'message' => 'Estudiante actualizado exitosamente.',
            'data'    => new StudentResource($student->fresh(['curso'])),
        ]);
    }

    /**
     * Eliminar (soft delete) un estudiante.
     *
     * DELETE /api/v1/students/{student}
     */
    public function destroy(Student $student): JsonResponse
    {
        $student->load('curso');
        Gate::authorize('delete', $student);

        $student->delete();

        return response()->json([
            'message' => 'Estudiante eliminado exitosamente.',
        ]);
    }

    public function restore(Request $request, int $studentId): JsonResponse
    {
        $student = Student::withTrashed()->with('curso')->findOrFail($studentId);
        Gate::authorize('restore', $student);
        $student->restore();

        return response()->json([
            'message' => 'Inscripción reactivada exitosamente.',
            'data' => new StudentResource($student->fresh('curso')),
        ]);
    }
}
