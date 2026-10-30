<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StudentResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'               => $this->id,
            'nombre'           => $this->nombre,
            'fecha_nacimiento' => $this->fecha_nacimiento?->format('Y-m-d'),
            'id_curso'         => $this->id_curso,
            'curso'            => $this->whenLoaded('curso', fn () => [
                'id'     => $this->curso->id,
                'nombre' => $this->curso->nombre,
                'nivel'  => $this->curso->nivel,
            ]),
            'created_at'  => $this->created_at?->toIso8601String(),
            'deleted_at'  => $this->deleted_at?->toIso8601String(),
        ];
    }
}
