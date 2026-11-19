<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\ActividadResource;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class StudentProgressController extends Controller
{
    public function show(Request $request, Student $student)
    {
        abort_unless($request->user()->esDocente(), 403);
        $student->load('curso.docente');
        Gate::authorize('view', $student);

        $activities = $student->actividades()
            ->with([
                'ejercicio',
                'scheduledActivity.exercises',
                'imagen',
                'analysisResult.modelVersion',
                'evaluationHistory.changedBy:id,nombre',
                'evaluatedBy:id,nombre',
            ])
            ->orderBy('fecha')
            ->orderBy('id')
            ->get();

        $programs = $student->curso->scheduledActivities()
            ->where('active', true)
            ->with('exercises')
            ->orderBy('scheduled_for')
            ->orderBy('id')
            ->get();

        $comparisons = $activities
            ->filter(fn ($activity) => $activity->pedagogical_rating !== null && $activity->period_reference !== null)
            ->groupBy('id_ejercicio')
            ->map(function ($exerciseActivities) {
                $periods = $exerciseActivities
                    ->groupBy('period_reference')
                    ->map(fn ($periodActivities, $period) => [
                        'period_reference' => $period,
                        'evaluations' => $periodActivities->map(fn ($activity) => [
                            'activity_id' => $activity->id,
                            'date' => $activity->fecha?->format('Y-m-d'),
                            'rating' => $activity->pedagogical_rating,
                            'observations' => $activity->pedagogical_observations,
                        ])->values(),
                    ])->values();

                return $periods->count() >= 2 ? $periods : null;
            })
            ->filter()
            ->map(fn ($periods, $exerciseId) => [
                'exercise_id' => (int) $exerciseId,
                'exercise_name' => $activities->firstWhere('id_ejercicio', (int) $exerciseId)?->ejercicio?->nombre,
                'periods' => $periods,
            ])
            ->values();

        return response()->json([
            'data' => [
                'student' => [
                    'id' => $student->id,
                    'nombre' => $student->nombre,
                    'fecha_nacimiento' => $student->fecha_nacimiento?->format('Y-m-d'),
                    'administrative_status' => $student->deleted_at ? 'Inactivo' : 'Activo',
                    'course' => [
                        'id' => $student->curso->id,
                        'nombre' => $student->curso->nombre,
                        'nivel' => $student->curso->nivel,
                        'teacher' => $student->curso->docente?->nombre,
                    ],
                ],
                'scheduled_activities' => $programs,
                'executions' => ActividadResource::collection($activities)->resolve($request),
                'comparable_evolution' => $comparisons,
            ],
        ]);
    }
}
