<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\CourseResource;
use App\Models\Course;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Gate;

class CourseController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $user = $request->user();
        Gate::authorize('viewAny', Course::class);

        $query = $user->cursosAccesibles()->with(['docente', 'estudiantes']);

        if ($user->esAdministrador() && $request->filled('id_docente')) {
            $query->where('id_docente', $request->query('id_docente'));
        }

        $courses = $query->orderBy('gestion', 'desc')->orderBy('nombre')->get();

        return CourseResource::collection($courses);
    }

    public function show(Request $request, Course $course): CourseResource|JsonResponse
    {
        Gate::authorize('view', $course);
        $course->load(['docente', 'estudiantes']);

        return new CourseResource($course);
    }
}
