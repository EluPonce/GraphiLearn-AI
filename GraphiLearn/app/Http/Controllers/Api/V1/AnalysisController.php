<?php

namespace App\Http\Controllers\Api\V1;

use App\Exceptions\AiServiceException;
use App\Exceptions\AiServiceTimeoutException;
use App\Exceptions\AiServiceUnavailableException;
use App\Http\Controllers\Controller;
use App\Http\Resources\AnalysisResultResource;
use App\Models\Actividad;
use App\Services\ActividadService;
use App\Services\AnalysisService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Symfony\Component\HttpKernel\Exception\HttpException;

class AnalysisController extends Controller
{
    public function __construct(
        protected AnalysisService $analysisService,
        protected ActividadService $actividadService
    ) {}

    /**
     * Procesar la imagen de una actividad grafomotora mediante visión artificial (HU-11).
     *
     * POST /api/v1/actividades/{actividad}/procesar
     */
    public function process(Request $request, Actividad $actividad): JsonResponse
    {
        $actividad->load(['estudiante.curso', 'ejercicio', 'imagen', 'analysisResult']);
        Gate::authorize('update', $actividad);

        // Verificar que el estudiante pertenezca al ámbito docente / institucional
        if (! $this->actividadService->estudiantePerteneceAlDocente($request->user(), $actividad->estudiante)) {
            return response()->json([
                'message' => 'No tiene permisos para procesar actividades de este estudiante.',
            ], 403);
        }

        try {
            $result = $this->analysisService->procesarActividad($actividad);

            return response()->json([
                'message' => 'Actividad procesada exitosamente. Mediciones cuantitativas extraídas.',
                'data'    => new AnalysisResultResource($result),
            ], 200);
        } catch (AiServiceUnavailableException $e) {
            return response()->json([
                'message' => $e->getMessage(),
                'error'   => 'AI_SERVICE_UNAVAILABLE',
            ], 503);
        } catch (AiServiceTimeoutException $e) {
            return response()->json([
                'message' => $e->getMessage(),
                'error'   => 'AI_SERVICE_TIMEOUT',
            ], 504);
        } catch (HttpException $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], $e->getStatusCode());
        } catch (AiServiceException $e) {
            return response()->json([
                'message' => 'Error durante el análisis en el microservicio: ' . $e->getMessage(),
                'error'   => 'AI_SERVICE_PROCESSING_ERROR',
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error interno al procesar la actividad: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Consultar el resultado de análisis almacenado de una actividad.
     *
     * GET /api/v1/actividades/{actividad}/resultado
     */
    public function show(Request $request, Actividad $actividad): JsonResponse
    {
        $actividad->load(['estudiante.curso', 'analysisResult.modelVersion', 'analysisResult.imagen']);
        Gate::authorize('view', $actividad);

        if (! $this->actividadService->estudiantePerteneceAlDocente($request->user(), $actividad->estudiante)) {
            return response()->json([
                'message' => 'No tiene permisos para visualizar este resultado.',
            ], 403);
        }

        if (! $actividad->analysisResult) {
            return response()->json([
                'message' => 'La actividad aún no cuenta con un resultado de análisis.',
            ], 404);
        }

        return response()->json([
            'data' => new AnalysisResultResource($actividad->analysisResult),
        ]);
    }
}
