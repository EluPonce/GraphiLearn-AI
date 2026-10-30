<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Imagen\UploadImagenRequest;
use App\Http\Resources\ImagenResource;
use App\Models\Actividad;
use App\Models\Imagen;
use App\Services\ImageUploadService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ImagenController extends Controller
{
    public function __construct(
        protected ImageUploadService $uploadService
    ) {}

    /**
     * Cargar y registrar una imagen para una actividad grafomotora.
     *
     * POST /api/v1/actividades/{actividad}/imagen
     */
    public function store(UploadImagenRequest $request, Actividad $actividad): JsonResponse
    {
        $actividad->load('estudiante.curso');
        Gate::authorize('update', $actividad);

        try {
            $imagen = $this->uploadService->cargar(
                $request->file('imagen'),
                $actividad
            );

            return response()->json([
                'message' => 'Imagen cargada y registrada exitosamente.',
                'data'    => new ImagenResource($imagen),
            ], 201);
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error interno al procesar la imagen: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Descargar o visualizar la imagen protegida en storage privado.
     *
     * GET /api/v1/imagenes/{imagen}/download
     */
    public function download(Imagen $imagen): StreamedResponse|JsonResponse
    {
        $imagen->load('actividad.estudiante.curso');
        Gate::authorize('view', $imagen);

        if (! Storage::disk('private')->exists($imagen->ruta)) {
            return response()->json([
                'message' => 'El archivo físico de la imagen no fue encontrado.',
            ], 404);
        }

        return Storage::disk('private')->response($imagen->ruta);
    }

    /**
     * Eliminar una imagen asociada.
     *
     * DELETE /api/v1/imagenes/{imagen}
     */
    public function destroy(Imagen $imagen): JsonResponse
    {
        $imagen->load('actividad.estudiante.curso');
        Gate::authorize('view', $imagen);

        $this->uploadService->eliminar($imagen);
        $imagen->delete();

        return response()->json([
            'message' => 'Imagen eliminada exitosamente.',
        ]);
    }
}
