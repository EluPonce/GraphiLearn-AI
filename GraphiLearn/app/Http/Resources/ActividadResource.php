<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ActividadResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'              => $this->id,
            'id_estudiante'   => $this->id_estudiante,
            'id_ejercicio'    => $this->id_ejercicio,
            'scheduled_activity_id' => $this->scheduled_activity_id,
            'fecha'           => $this->fecha?->format('Y-m-d'),
            'estado'          => $this->estado,
            'pedagogical_rating' => $this->pedagogical_rating,
            'evaluated_by_name' => $this->whenLoaded('evaluatedBy', fn () => $this->evaluatedBy?->nombre),
            'pedagogical_observations' => $this->pedagogical_observations,
            'period_reference' => $this->period_reference,
            'evaluation_history' => $this->whenLoaded('evaluationHistory'),
            'fecha_procesado' => $this->fecha_procesado?->toISOString(),
            'estudiante'      => new StudentResource($this->whenLoaded('estudiante')),
            'ejercicio'       => new ExerciseResource($this->whenLoaded('ejercicio')),
            'scheduled_activity' => $this->whenLoaded('scheduledActivity'),
            'imagen'          => new ImagenResource($this->whenLoaded('imagen')),
            'imagenes'        => $this->relationLoaded('imagen') && $this->imagen ? ImagenResource::collection(collect([$this->imagen])) : ImagenResource::collection($this->whenLoaded('imagenes')),
            'analysis_result' => new AnalysisResultResource($this->whenLoaded('analysisResult')),
            'created_at'      => $this->created_at?->toISOString(),
            'updated_at'      => $this->updated_at?->toISOString(),
        ];
    }
}
