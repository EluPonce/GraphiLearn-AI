<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'nombre'         => $this->nombre,
            'correo'         => $this->correo,
            'rol'            => $this->rol,
            'institution_id' => $this->institution_id,
            'created_at'     => $this->created_at?->toIso8601String(),
        ];
    }
}
