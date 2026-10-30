<?php

namespace App\Services;

use App\Exceptions\AiServiceException;
use App\Exceptions\AiServiceTimeoutException;
use App\Exceptions\AiServiceUnavailableException;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

class FastApiClient
{
    protected string $baseUrl;
    protected int $timeout;

    public function __construct()
    {
        $this->baseUrl = rtrim(config('services.ai_service.base_url', 'http://127.0.0.1:8001'), '/');
        $this->timeout = (int) config('services.ai_service.timeout', 30);
    }

    /**
     * Envía la imagen privada al microservicio FastAPI para procesamiento con OpenCV y extracción de características.
     *
     * @param string $storageRelativePath Ruta relativa dentro del disco privado ('graphilearn/imagenes/{uuid}.ext')
     * @param string $tipoTrazo Tipo de ejercicio ('linea', 'circulo', 'espiral', 'zigzag')
     * @return array Datos JSON decodificados con características, indicadores y clasificación
     *
     * @throws AiServiceUnavailableException Si FastAPI está apagado o inalcanzable
     * @throws AiServiceTimeoutException Si expira el tiempo de espera configurado
     * @throws AiServiceException Si la respuesta no es 200 o el formato es inválido
     */
    public function analizarImagen(string $storageRelativePath, string $tipoTrazo): array
    {
        if (! Storage::disk('private')->exists($storageRelativePath)) {
            throw new \InvalidArgumentException("El archivo físico de la imagen no existe en el almacenamiento privado.");
        }

        $fileContents = Storage::disk('private')->get($storageRelativePath);
        $fileName     = basename($storageRelativePath);

        try {
            $response = Http::timeout($this->timeout)
                ->attach('file', $fileContents, $fileName)
                ->asMultipart()
                ->post("{$this->baseUrl}/api/analyze", [
                    'tipo_esperado' => $tipoTrazo,
                ]);
        } catch (ConnectionException $e) {
            // Error de conexión o timeout de conexión
            $msg = strtolower($e->getMessage());
            if (str_contains($msg, 'timed out') || str_contains($msg, 'timeout')) {
                throw new AiServiceTimeoutException("Tiempo de espera agotado al conectar con el microservicio de IA ({$this->timeout}s).");
            }
            throw new AiServiceUnavailableException("No se pudo establecer conexión con el microservicio de IA en {$this->baseUrl}. Asegúrese de que el servicio esté activo.");
        } catch (\Exception $e) {
            throw new AiServiceException("Error en la solicitud HTTP al microservicio de IA: " . $e->getMessage(), 500, $e);
        }

        if ($response->status() === 504 || $response->status() === 408) {
            throw new AiServiceTimeoutException("El microservicio de IA agotó el tiempo de procesamiento (HTTP {$response->status()}).");
        }

        if (! $response->successful()) {
            $errorDetail = $response->json('detail') ?? $response->body() ?? 'Error desconocido';
            $statusCode  = $response->status();
            throw new AiServiceException("El microservicio de IA devolvió un error (HTTP {$statusCode}): {$errorDetail}", $statusCode);
        }

        $data = $response->json();
        if (! is_array($data) || ! isset($data['caracteristicas_geometricas']) || ! isset($data['indicadores_cuantitativos'])) {
            throw new AiServiceException("La respuesta del microservicio de IA no cumple el contrato de datos esperado.", 502);
        }

        return $data;
    }

    /**
     * Consulta el estado del microservicio y del clasificador activo.
     */
    public function obtenerEstado(): array
    {
        try {
            $response = Http::timeout(5)->get("{$this->baseUrl}/api/models/status");
            if ($response->successful()) {
                return $response->json();
            }
        } catch (\Exception $e) {
            // Ignorar para comprobaciones de salud suaves
        }

        return ['disponible' => false, 'error' => 'Servicio no disponible'];
    }

    /**
     * Solicita al microservicio cargar un modelo entrenado específico.
     */
    public function cargarModeloEnFastApi(string $filePath, ?string $versionName = null): bool
    {
        try {
            $response = Http::timeout(10)->post("{$this->baseUrl}/api/models/load", [
                'file_path' => $filePath,
                'version_name' => $versionName,
            ]);
            return $response->successful();
        } catch (\Exception $e) {
            return false;
        }
    }
}
