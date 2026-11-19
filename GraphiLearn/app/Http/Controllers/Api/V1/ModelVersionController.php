<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ModelVersion;
use App\Services\FastApiClient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ModelVersionController extends Controller
{
    public function __construct(protected FastApiClient $fastApiClient) {}

    public function index(): JsonResponse
    {
        return response()->json([
            'data' => ModelVersion::with('creator:id,nombre,correo')->latest()->get(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'version' => 'required|string|max:50',
            'algorithm' => 'nullable|string|max:50',
            'description' => 'nullable|string|max:500',
            'file_path' => 'required|string|max:255',
            'metrics' => 'nullable|array',
        ]);

        if ($this->resolveModelPath($validated['file_path']) === null) {
            return response()->json([
                'message' => 'El archivo del modelo no existe dentro del directorio configurado para modelos.',
            ], 422);
        }

        $version = ModelVersion::create([
            'name' => $validated['name'],
            'version' => $validated['version'],
            'algorithm' => $validated['algorithm'] ?? 'RandomForest',
            'description' => $validated['description'] ?? null,
            'file_path' => $validated['file_path'],
            'metrics' => $validated['metrics'] ?? null,
            'active' => false,
            'created_by' => $request->user()->id,
        ]);

        return response()->json([
            'message' => 'Versión del modelo registrada exitosamente.',
            'data' => $version,
        ], 201);
    }

    public function activate(ModelVersion $modelVersion): JsonResponse
    {
        if ($this->resolveModelPathForService($modelVersion->file_path) === null) {
            return response()->json([
                'message' => 'No se puede activar el modelo porque el archivo no existe dentro del directorio configurado.',
            ], 422);
        }

        if (! $this->fastApiClient->cargarModeloEnFastApi($modelVersion->version, $modelVersion->version)) {
            return response()->json([
                'message' => 'FastAPI no confirmó la carga del modelo registrado; no se cambió la versión activa.',
            ], 503);
        }

        DB::transaction(function () use ($modelVersion) {
            ModelVersion::where('active', true)->update(['active' => false]);
            $modelVersion->update(['active' => true]);
        });

        return response()->json([
            'message' => "Versión {$modelVersion->name} ({$modelVersion->version}) activada exitosamente.",
            'data' => $modelVersion->fresh(),
        ]);
    }

    public function deactivate(ModelVersion $modelVersion): JsonResponse
    {
        if ($modelVersion->active && ! $this->fastApiClient->descargarModeloEnFastApi()) {
            return response()->json([
                'message' => 'FastAPI no confirmó la descarga del modelo; no se cambió su estado registrado.',
            ], 503);
        }

        $modelVersion->update(['active' => false]);

        return response()->json([
            'message' => "Versión {$modelVersion->name} desactivada. El clasificador operará en modo NO DISPONIBLE.",
            'data' => $modelVersion->fresh(),
        ]);
    }

    protected function resolveModelPath(string $path): ?string
    {
        $root = (string) config('services.ai_service.root_path', base_path('ai-service'));
        $root = $this->isAbsolutePath($root) ? $root : base_path($root);
        $realRoot = realpath($root);
        if ($realRoot === false) {
            return null;
        }

        $normalized = str_replace('\\', '/', trim($path));
        if (preg_match('/^[A-Za-z]:\//', $normalized) || str_starts_with($normalized, '/')) {
            $candidate = realpath($normalized);
        } else {
            $normalized = preg_replace('#^ai-service/#', '', ltrim($normalized, '/'));
            $candidate = realpath($realRoot . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $normalized));
        }

        if ($candidate === false || ! is_file($candidate)) {
            return null;
        }

        $prefix = rtrim($realRoot, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR;
        return str_starts_with(strtolower($candidate), strtolower($prefix)) ? $candidate : null;
    }

    protected function resolveModelPathForService(string $path): ?string
    {
        $resolved = $this->resolveModelPath($path);
        if ($resolved === null) {
            return null;
        }

        $root = (string) config('services.ai_service.root_path', base_path('ai-service'));
        $root = $this->isAbsolutePath($root) ? $root : base_path($root);
        $realRoot = realpath($root);
        if ($realRoot === false) {
            return null;
        }

        return ltrim(str_replace('\\', '/', substr($resolved, strlen(rtrim($realRoot, DIRECTORY_SEPARATOR)))), '/');
    }

    private function isAbsolutePath(string $path): bool
    {
        return str_starts_with($path, '/') || (bool) preg_match('/^[A-Za-z]:[\\\\\/]/', $path);
    }
}
