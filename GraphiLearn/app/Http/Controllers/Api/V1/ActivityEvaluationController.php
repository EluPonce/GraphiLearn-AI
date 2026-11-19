<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Actividad;
use App\Models\ActivityEvaluationHistory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\DB;

class ActivityEvaluationController extends Controller
{
    public function update(Request $request, Actividad $actividad)
    {
        $actividad->load('estudiante.curso');
        Gate::authorize('update', $actividad);
        $data = $request->validate([
            'pedagogical_rating' => ['nullable', 'in:S,ED,NA'],
            'pedagogical_observations' => ['nullable', 'string', 'max:5000'],
            'period_reference' => ['nullable', 'string', 'max:100'],
        ]);

        DB::transaction(function () use ($actividad, $data, $request) {
            ActivityEvaluationHistory::create([
                'actividad_id' => $actividad->id,
                'changed_by' => $request->user()->id,
                'pedagogical_rating' => $actividad->pedagogical_rating,
                'pedagogical_observations' => $actividad->pedagogical_observations,
            ]);
            $actividad->update($data + ['evaluated_by' => $request->user()->id]);
        });

        return response()->json(['data' => $actividad->fresh(['evaluationHistory'])]);
    }

    public function history(Request $request, Actividad $actividad)
    {
        $actividad->load('estudiante.curso');
        Gate::authorize('view', $actividad);
        return response()->json(['data' => $actividad->evaluationHistory()->with('changedBy:id,nombre')->latest('created_at')->get()]);
    }
}
