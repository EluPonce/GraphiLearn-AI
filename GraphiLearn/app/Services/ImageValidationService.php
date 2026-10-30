<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;

/**
 * ImageValidationService
 *
 * Valida las condiciones mínimas que debe cumplir una imagen
 * antes de procesarla o almacenarla.
 *
 * Responsabilidades Sprint 1:
 *   - Tipo MIME real (no solo extensión)
 *   - Formatos permitidos: JPG, JPEG, PNG
 *   - Tamaño máximo: 5 MB
 *   - Resolución mínima: 640 × 480 px
 *
 * Responsabilidades Sprint 2 (NO implementadas aquí):
 *   - Nitidez mínima (Laplacian variance via OpenCV en ai-service)
 *   - Contraste adecuado
 *   - Detección de bordes del trazo
 */
class ImageValidationService
{
    private const ALLOWED_MIMES = ['image/jpeg', 'image/png'];
    private const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
    private const MIN_WIDTH  = 640;
    private const MIN_HEIGHT = 480;

    /**
     * Valida el archivo de imagen. Lanza excepción con mensaje claro si falla.
     *
     * @throws \InvalidArgumentException
     */
    public function validar(UploadedFile $file): void
    {
        $this->validarMimeReal($file);
        $this->validarTamano($file);
        $this->validarResolucion($file);
    }

    /**
     * Retorna true si el archivo pasa todas las validaciones, false en caso contrario.
     * Útil para verificaciones sin lanzar excepciones.
     */
    public function esValido(UploadedFile $file): bool
    {
        try {
            $this->validar($file);
            return true;
        } catch (\InvalidArgumentException) {
            return false;
        }
    }

    // -------------------------------------------------------------------------
    // Validaciones privadas
    // -------------------------------------------------------------------------

    private function validarMimeReal(UploadedFile $file): void
    {
        $mimeReal = $file->getMimeType(); // Lee el tipo MIME real del contenido

        if (! in_array($mimeReal, self::ALLOWED_MIMES, true)) {
            throw new \InvalidArgumentException(
                "El tipo de archivo '{$mimeReal}' no está permitido. "
                . 'Solo se aceptan imágenes JPG, JPEG y PNG.'
            );
        }
    }

    private function validarTamano(UploadedFile $file): void
    {
        if ($file->getSize() > self::MAX_SIZE_BYTES) {
            $sizeMB = round($file->getSize() / (1024 * 1024), 2);
            throw new \InvalidArgumentException(
                "El archivo pesa {$sizeMB} MB. El tamaño máximo permitido es 5 MB."
            );
        }
    }

    private function validarResolucion(UploadedFile $file): void
    {
        $imageInfo = @getimagesize($file->getRealPath());

        if ($imageInfo === false) {
            throw new \InvalidArgumentException(
                'No se pudo leer la información de la imagen. El archivo puede estar corrupto.'
            );
        }

        [$width, $height] = $imageInfo;

        if ($width < self::MIN_WIDTH || $height < self::MIN_HEIGHT) {
            throw new \InvalidArgumentException(
                "La resolución de la imagen ({$width}×{$height} px) es insuficiente. "
                . 'Se requiere un mínimo de ' . self::MIN_WIDTH . '×' . self::MIN_HEIGHT . ' px.'
            );
        }
    }
}
