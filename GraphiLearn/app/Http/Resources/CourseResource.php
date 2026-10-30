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
            'id_docente'        => $this->id_docente,
            'docente'           => $this->docente ? [
                'id'     => $this->docente->id,
                'nombre' => $this->docente->nombre,
                'correo' => $this->docente->correo,
                'rol'    => $this->docente->rol,
            ] : null,
            'estudiantes_count' => $this->estudiantes_count ?? $this->estudiantes()->count(),
            'created_at'        => $this->created_at?->toIso8601String(),
        ];
    }
}
