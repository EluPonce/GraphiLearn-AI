<?php

namespace App\Services;

use App\Exceptions\AiServiceException;
use App\Models\Actividad;
use App\Models\AnalysisResult;
use App\Models\ModelVersion;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class AnalysisService
{
    public function __construct(
        protected FastApiClient $fastApiClient
    ) {}

    /**
     * Orquesta el flujo de análisis completo de una actividad (HU-11):
     * 1. Valida existencia de imagen asociada.
     * 2. Evita procesamientos duplicados y solicitudes concurrentes.
     * 3. Invoca a FastAPI fuera de la transacción de base de datos.
     * 4. Almacena atómicamente los resultados y actualiza el estado.
     *
     * @throws ConflictHttpException Si la actividad ya se está procesando o ya está procesada.
     * @throws UnprocessableEntityHttpException Si la actividad no tiene fotografía cargada.
     * @throws AiServiceException Si el microservicio falla o no está disponible.
     */
    public function procesarActividad(Actividad $actividad): AnalysisResult
    {
        $actividad->load(['imagen', 'ejercicio', 'analysisResult']);

        // 1. Validar que exista imagen asociada
        if (! $actividad->imagen) {
            throw new UnprocessableEntityHttpException(
                "La actividad no cuenta con una fotografía cargada para procesar."
            );
        }

        // 2. Control de duplicados y concurrencia
        if ($actividad->estado === 'procesando') {
            throw new ConflictHttpException(
                "La actividad ya se encuentra en proceso de análisis computacional."
            );
        }

        if ($actividad->estado === 'procesado' && $actividad->analysisResult) {
            throw new ConflictHttpException(
                "Esta actividad ya fue procesada previamente. No se permite procesamiento duplicado."
            );
        }

        // Marcar temporalmente como 'procesando' para bloquear solicitudes concurrentes
        $actividad->update(['estado' => 'procesando']);

        $tipoTrazo = $actividad->ejercicio?->tipo_trazo ?? 'circulo';
        $rutaImagen = $actividad->imagen->ruta;

        // 3. Comunicación HTTP con FastAPI (FUERA de la transacción de BD)
        try {
            $aiResponse = $this->fastApiClient->analizarImagen($rutaImagen, $tipoTrazo);
        } catch (\Throwable $e) {
            // Si FastAPI falla o no está disponible, restaurar estado original sin guardar resultados parciales
            $actividad->update(['estado' => 'pendiente']);
            throw $e;
        }

        // 4. Persistencia atómica en PostgreSQL
        return DB::transaction(function () use ($actividad, $aiResponse, $tipoTrazo) {
            $geom = $aiResponse['caracteristicas_geometricas'] ?? [];
            $ind  = $aiResponse['indicadores_cuantitativos'] ?? [];
            $clas = $aiResponse['clasificacion'] ?? [];

            // Determinar si hay una versión de modelo registrada aplicable
            $modelVersionId = null;
            if (! empty($clas['disponible']) && ! empty($clas['model_version'])) {
                $modelVersion = ModelVersion::where('name', $clas['model_version'])
                    ->orWhere('version', $clas['model_version'])
                    ->first();
                $modelVersionId = $modelVersion?->id;
            } elseif ($activeModel = ModelVersion::active()->first()) {
                $modelVersionId = $activeModel->id;
            }

            // Crear o actualizar el registro único de resultados
            $result = AnalysisResult::updateOrCreate(
                ['actividad_id' => $actividad->id],
                [
                    'imagen_id'                => $actividad->imagen->id,
                    'tipo_trazo'               => $tipoTrazo,
                    'longitud_trazo'           => $geom['longitud_trazo'] ?? null,
                    'alto'                     => $geom['alto'] ?? null,
                    'ancho'                    => $geom['ancho'] ?? null,
                    'proporcion'               => $geom['proporcion'] ?? null,
                    'inclinacion'              => $geom['inclinacion'] ?? null,
                    'curvatura'                => $geom['curvatura'] ?? null,
                    'separacion_componentes'   => $geom['separacion_componentes'] ?? null,
                    'posicion_normalizada'     => $geom['posicion_normalizada'] ?? null,
                    'desviacion'               => $ind['desviacion'] ?? null,
                    'rugosidad'                => $ind['rugosidad'] ?? null,
                    'continuidad'              => $ind['continuidad'] ?? null,
                    'regularidad'              => $ind['regularidad'] ?? null,
                    'risk_label'               => $clas['risk_label'] ?? 'no_disponible',
                    'risk_score'               => $clas['risk_score'] ?? null,
                    'model_version_id'         => $modelVersionId,
                    'estado'                   => 'procesado',
                    'estado_revision'          => 'pendiente', // Obligatorio por HU-11: inicia en pendiente
                    'error_message'            => null,
                    'detalles_computacionales' => $aiResponse['detalles_computacionales'] ?? null,
                ]
            );

            // Actualizar estado de la actividad a procesado
            $actividad->update([
                'estado'          => 'procesado',
                'fecha_procesado' => now(),
            ]);

            return $result->fresh(['actividad', 'imagen', 'modelVersion']);
        });
    }
}
