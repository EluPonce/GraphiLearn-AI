<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Exercise;
use App\Models\ScheduledActivity;
use App\Models\Actividad;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ScheduledActivityController extends Controller
{
    public function index(Request $request)
    {
        $query = ScheduledActivity::with(['course', 'exercise', 'exercises'])
            ->whereIn('course_id', $request->user()->cursosAccesibles()->select('id'));
        if ($request->user()->esDocente()) {
            $query->where('active', true)->withCount([
                'executions',
                'executions as evaluated_executions_count' => fn ($query) => $query->whereNotNull('pedagogical_rating'),
            ]);
        }
        return response()->json(['data' => $query->latest()->get()]);
    }

    public function store(Request $request)
    {
        abort_unless($request->user()->esAdministrador(), 403);
        $data = $request->validate([
            'course_id' => ['required', 'integer', 'exists:courses,id'],
            'exercise_ids' => ['required_without:exercise_id', 'array', 'min:1'],
            'exercise_ids.*' => ['integer', 'distinct', 'exists:exercises,id'],
            'exercise_id' => ['required_without:exercise_ids', 'integer', 'exists:exercises,id'],
            'name' => ['required', 'string', 'max:150'],
            'instructions' => ['nullable', 'string', 'max:5000'],
            'period_reference' => ['nullable', 'string', 'max:100'],
            'scheduled_for' => ['nullable', 'date'],
            'active' => ['sometimes', 'boolean'],
        ]);
        $exerciseIds = array_values(array_map('intval', $data['exercise_ids'] ?? [$data['exercise_id']]));
        $this->validateCourseAndExercises($data['course_id'], $exerciseIds, $request);
        $activity = DB::transaction(function () use ($data, $exerciseIds, $request) {
            $activity = ScheduledActivity::create([
                'course_id' => $data['course_id'],
                'exercise_id' => $exerciseIds[0], // Compatibility with older clients and records.
                'created_by' => $request->user()->id,
                'name' => $data['name'],
                'instructions' => $data['instructions'] ?? null,
                'period_reference' => $data['period_reference'] ?? null,
                'scheduled_for' => $data['scheduled_for'] ?? null,
                'active' => $data['active'] ?? true,
            ]);
            $activity->exercises()->sync($this->orderedExercises($exerciseIds));
            return $activity;
        });
        $activity->load(['course', 'exercise', 'exercises']);
        return response()->json(['data' => $activity], 201);
    }

    public function show(Request $request, ScheduledActivity $scheduledActivity)
    {
        abort_unless($request->user()->puedeAccederAlCurso($scheduledActivity->course), 403);
        return response()->json(['data' => $scheduledActivity->load(['course', 'exercise', 'exercises'])]);
    }

    public function update(Request $request, ScheduledActivity $scheduledActivity)
    {
        abort_unless($request->user()->esAdministrador() && $request->user()->puedeAccederAlCurso($scheduledActivity->course), 403);
        $data = $request->validate([
            'course_id' => ['sometimes', 'required', 'integer', 'exists:courses,id'],
            'exercise_ids' => ['sometimes', 'required', 'array', 'min:1'],
            'exercise_ids.*' => ['integer', 'distinct', 'exists:exercises,id'],
            'exercise_id' => ['sometimes', 'required', 'integer', 'exists:exercises,id'],
            'name' => ['sometimes', 'required', 'string', 'max:150'],
            'instructions' => ['nullable', 'string', 'max:5000'],
            'period_reference' => ['nullable', 'string', 'max:100'],
            'scheduled_for' => ['nullable', 'date'],
            'active' => ['sometimes', 'boolean'],
        ]);
        $exerciseIds = null;
        if (array_key_exists('exercise_ids', $data) || array_key_exists('exercise_id', $data)) {
            $exerciseIds = array_values(array_map('intval', $data['exercise_ids'] ?? [$data['exercise_id']]));
        }
        $targetCourseId = $data['course_id'] ?? $scheduledActivity->course_id;
        if ((int) $targetCourseId !== (int) $scheduledActivity->course_id) {
            abort_if(
                Actividad::withTrashed()->where('scheduled_activity_id', $scheduledActivity->id)->exists(),
                422,
                'No se puede mover una programación que ya tiene ejecuciones registradas a otro curso.'
            );
        }
        if (isset($data['course_id']) || $exerciseIds !== null) {
            $this->validateCourseAndExercises($targetCourseId, $exerciseIds ?? $scheduledActivity->exercises()->pluck('exercises.id')->all(), $request);
        }
        if ($exerciseIds !== null) {
            $removedExercisesHaveRuns = Actividad::withTrashed()
                ->where('scheduled_activity_id', $scheduledActivity->id)
                ->whereNotIn('id_ejercicio', $exerciseIds)
                ->exists();
            abort_if($removedExercisesHaveRuns, 422, 'No se puede quitar un ejercicio que ya tiene ejecuciones registradas.');
        }

        unset($data['exercise_ids'], $data['exercise_id']);
        DB::transaction(function () use ($scheduledActivity, $data, $exerciseIds, $targetCourseId) {
            $updates = $data;
            if (array_key_exists('course_id', $updates) || $exerciseIds !== null) {
                $updates['course_id'] = $targetCourseId;
            }
            if ($exerciseIds !== null) $updates['exercise_id'] = $exerciseIds[0];
            $scheduledActivity->update($updates);
            if ($exerciseIds !== null) {
                $scheduledActivity->exercises()->sync($this->orderedExercises($exerciseIds));
            }
        });
        return response()->json(['data' => $scheduledActivity->fresh(['course', 'exercise', 'exercises'])]);
    }

    public function destroy(Request $request, ScheduledActivity $scheduledActivity)
    {
        abort_unless($request->user()->esAdministrador() && $request->user()->puedeAccederAlCurso($scheduledActivity->course), 403);
        $scheduledActivity->update(['active' => false]);
        return response()->json(['message' => 'Actividad programada desactivada.']);
    }

    private function validateCourseAndExercises(int $courseId, array $exerciseIds, Request $request): void
    {
        $course = Course::findOrFail($courseId);
        abort_unless($course->active && $request->user()->puedeAccederAlCurso($course), 403);
        $activeIds = Exercise::whereIn('id', $exerciseIds)->where('activo', true)->pluck('id')->map(fn ($id) => (int) $id)->all();
        abort_unless(count($activeIds) === count($exerciseIds), 422, 'Todos los ejercicios deben estar activos.');
    }

    private function orderedExercises(array $exerciseIds): array
    {
        $sync = [];
        foreach (array_values($exerciseIds) as $index => $exerciseId) {
            $sync[$exerciseId] = ['position' => $index + 1];
        }
        return $sync;
    }
}
