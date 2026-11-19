<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AnalysisResultResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'                       => $this->id,
            'actividad_id'             => $this->actividad_id,
            'imagen_id'                => $this->imagen_id,
            'tipo_trazo'               => $this->tipo_trazo,
            'longitud_trazo'           => $this->longitud_trazo,
            'alto'                     => $this->alto,
            'ancho'                    => $this->ancho,
            'proporcion'               => $this->proporcion,
            'inclinacion'              => $this->inclinacion,
            'curvatura'                => $this->curvatura,
            'separacion_componentes'   => $this->separacion_componentes,
            'posicion_normalizada'     => $this->posicion_normalizada,
            'desviacion'               => $this->desviacion,
            'rugosidad'                => $this->rugosidad,
            'continuidad'              => $this->continuidad,
            'regularidad'              => $this->regularidad,
            'sugerencia'               => $this->sugerencia,
            'model_version_id'         => $this->model_version_id,
            'model_version'            => $this->whenLoaded('modelVersion'),
            'estado'                   => $this->estado,
            'estado_revision'          => $this->estado_revision,
            'error_message'            => $this->error_message,
            'detalles_computacionales' => $this->detalles_computacionales,
            'caracteristicas_geometricas' => [
                'longitud_trazo'         => $this->longitud_trazo,
                'alto'                   => $this->alto,
                'ancho'                  => $this->ancho,
                'proporcion'             => $this->proporcion,
                'inclinacion'            => $this->inclinacion,
                'curvatura'              => $this->curvatura,
                'separacion_componentes' => $this->separacion_componentes,
                'posicion_normalizada'   => $this->posicion_normalizada,
            ],
            'indicadores_cuantitativos' => [
                'desviacion'  => $this->desviacion,
                'rugosidad'   => $this->rugosidad,
                'continuidad' => $this->continuidad,
                'regularidad' => $this->regularidad,
            ],
            'clasificacion' => [
                'disponible'    => in_array($this->sugerencia, ['S', 'ED', 'NA'], true),
                'sugerencia'    => $this->sugerencia,
                'model_version' => $this->modelVersion?->version ?? $this->modelVersion?->name,
            ],
            'created_at'               => $this->created_at?->toISOString(),
            'updated_at'               => $this->updated_at?->toISOString(),
        ];
    }
}
