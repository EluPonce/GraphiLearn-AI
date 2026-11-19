<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\CourseResource;
use App\Models\Course;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Gate;

class CourseController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        Gate::authorize('create', Course::class);
        $data = $request->validate([
            'nombre' => ['required', 'string', 'max:255'],
            'nivel' => ['required', 'string', 'max:100'],
            'gestion' => ['required', 'string', 'max:20'],
            'id_docente' => ['nullable', 'integer', 'exists:users,id'],
        ]);
        $this->validateTeacher($data['id_docente'] ?? null, $request->user());
        $course = Course::create($data + ['institution_id' => $request->user()->institution_id, 'active' => true]);
        return response()->json(['data' => new CourseResource($course->load('docente'))], 201);
    }

    public function index(Request $request): AnonymousResourceCollection
    {
        $user = $request->user();
        Gate::authorize('viewAny', Course::class);

        $query = $user->cursosAccesibles()->with('docente')->withCount('estudiantes');

        if ($user->esAdministrador() && $request->filled('id_docente')) {
            $query->where('id_docente', $request->query('id_docente'));
        }

        $courses = $query->orderBy('gestion', 'desc')->orderBy('nombre')->get();

        return CourseResource::collection($courses);
    }

    public function show(Request $request, Course $course): CourseResource|JsonResponse
    {
        Gate::authorize('view', $course);
        $course->load(['docente', 'estudiantes' => fn ($query) => $query->withTrashed(), 'scheduledActivities.exercises']);

        return new CourseResource($course);
    }

    public function update(Request $request, Course $course): JsonResponse
    {
        Gate::authorize('update', $course);
        $data = $request->validate([
            'nombre' => ['sometimes', 'required', 'string', 'max:255'],
            'nivel' => ['sometimes', 'required', 'string', 'max:100'],
            'gestion' => ['sometimes', 'required', 'string', 'max:20'],
            'id_docente' => ['sometimes', 'nullable', 'integer', 'exists:users,id'],
            'active' => ['sometimes', 'boolean'],
        ]);
        if (array_key_exists('id_docente', $data)) $this->validateTeacher($data['id_docente'], $request->user());
        $course->update($data);
        return response()->json(['data' => new CourseResource($course->fresh('docente'))]);
    }

    public function destroy(Course $course): JsonResponse
    {
        Gate::authorize('delete', $course);
        $course->update(['active' => false]);
        return response()->json(['message' => 'Curso desactivado.']);
    }

    private function validateTeacher(?int $teacherId, User $administrator): void
    {
        if ($teacherId === null) return;
        $teacher = User::findOrFail($teacherId);
        abort_unless($teacher->esDocente() && $teacher->active && (int) $teacher->institution_id === (int) $administrator->institution_id, 422, 'El docente debe estar activo y pertenecer a la institución.');
    }
}
