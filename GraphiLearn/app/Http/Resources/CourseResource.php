<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CourseResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'                => $this->id,
            'nombre'            => $this->nombre,
            'nivel'             => $this->nivel,
            'gestion'           => $this->gestion,
            'active'            => $this->active,
            'id_docente'        => $this->id_docente,
            'docente'           => $this->docente ? [
                'id'     => $this->docente->id,
                'nombre' => $this->docente->nombre,
                'correo' => $this->docente->correo,
                'rol'    => $this->docente->rol,
            ] : null,
            'estudiantes_count' => $this->estudiantes_count ?? $this->estudiantes()->count(),
            'estudiantes'       => StudentResource::collection($this->whenLoaded('estudiantes')),
            'actividades_programadas' => $this->whenLoaded('scheduledActivities', fn () => $this->scheduledActivities->map(function ($scheduled) {
                $scheduled->setAttribute('executions_count', \App\Models\FotoEjercicio::where('scheduled_activity_id', $scheduled->id)->count());
                $scheduled->setAttribute('evaluated_executions_count', \App\Models\FotoEjercicio::where('scheduled_activity_id', $scheduled->id)->whereNotNull('valoracion')->count());
                return $scheduled;
            })),
            'created_at'        => $this->created_at?->toIso8601String(),
        ];
    }
}
