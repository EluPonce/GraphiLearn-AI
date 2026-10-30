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
            'fecha'           => $this->fecha?->format('Y-m-d'),
            'estado'          => $this->estado,
            'fecha_procesado' => $this->fecha_procesado?->toISOString(),
            'estudiante'      => new StudentResource($this->whenLoaded('estudiante')),
            'ejercicio'       => new ExerciseResource($this->whenLoaded('ejercicio')),
            'imagen'          => new ImagenResource($this->whenLoaded('imagen')),
            'imagenes'        => $this->relationLoaded('imagen') && $this->imagen ? ImagenResource::collection(collect([$this->imagen])) : ImagenResource::collection($this->whenLoaded('imagenes')),
            'analysis_result' => new AnalysisResultResource($this->whenLoaded('analysisResult')),
            'created_at'      => $this->created_at?->toISOString(),
            'updated_at'      => $this->updated_at?->toISOString(),
        ];
    }
}
