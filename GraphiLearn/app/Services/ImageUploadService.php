<?php

namespace App\Services;

use App\Models\Actividad;
use App\Models\Imagen;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * ImageUploadService
 *
 * Responsable de almacenar físicamente la imagen y registrarla
 * en la tabla imagenes.
 *
 * Almacenamiento: storage/app/private/graphilearn/imagenes/{uuid}.{ext}
 * El nombre original NUNCA se usa; siempre se genera un UUID.
 *
 * Sprint 2 (preparado pero no implementado):
 *   Esta clase enviará la imagen al ai-service vía FastAPIClient
 *   para el pipeline de preprocesamiento y extracción de características.
 */
class ImageUploadService
{
    public function __construct(
        private readonly ImageValidationService $validationService
    ) {}

    /**
     * Valida, almacena y registra la imagen de una actividad.
     *
     * @throws \InvalidArgumentException Si la imagen no pasa validación
     * @throws \RuntimeException Si no se puede almacenar el archivo
     */
    public function cargar(UploadedFile $file, Actividad $actividad): Imagen
    {
        // 1. Validar la imagen
        $this->validationService->validar($file);

        // 2. Generar nombre único (UUID) con extensión del MIME real
        $extension     = $this->extensionDesdeMime($file->getMimeType());
        $uuid          = Str::uuid()->toString();
        $nombreArchivo = "{$uuid}.{$extension}";

        // 3. Almacenar en storage privado
        $ruta = $file->storeAs(
            'graphilearn/imagenes',
            $nombreArchivo,
            'private'
        );

        if ($ruta === false) {
            throw new \RuntimeException('No se pudo almacenar el archivo en el sistema de archivos.');
        }

        // 4. Registrar en la base de datos
        $imagen = Imagen::create([
            'id_actividad' => $actividad->id,
            'ruta'         => $ruta,
            'formato'      => $extension,
            'fecha_carga'  => now(),
        ]);

        // ---------------------------------------------------------------
        // Sprint 2: Aquí se invocará FastAPIClient para procesar la imagen
        // $resultado = app(FastAPIClient::class)->analizar($ruta, $actividad->ejercicio->tipo_trazo);
        // ---------------------------------------------------------------

        return $imagen;
    }

    /**
     * Elimina físicamente la imagen del storage.
     */
    public function eliminar(Imagen $imagen): void
    {
        Storage::disk('private')->delete($imagen->ruta);
    }

    // -------------------------------------------------------------------------

    private function extensionDesdeMime(string $mime): string
    {
        return match ($mime) {
            'image/jpeg' => 'jpg',
            'image/png'  => 'png',
            default      => 'jpg',
        };
    }
}
