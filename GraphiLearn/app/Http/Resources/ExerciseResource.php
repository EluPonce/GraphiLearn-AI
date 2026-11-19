<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ExerciseResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'nombre'      => $this->nombre,
            'tipo_trazo'  => $this->tipo_trazo,
            'descripcion' => $this->descripcion,
            'activo'      => $this->activo,
            'created_at'  => $this->created_at?->toIso8601String(),
        ];
    }
}
