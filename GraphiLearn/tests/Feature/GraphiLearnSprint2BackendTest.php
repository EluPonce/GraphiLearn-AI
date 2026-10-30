<?php

namespace Tests\Feature;

use App\Models\Actividad;
use App\Models\Course;
use App\Models\Exercise;
use App\Models\Imagen;
use App\Models\Institution;
use App\Models\ModelVersion;
use App\Models\Student;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class GraphiLearnSprint2BackendTest extends TestCase
{
    use RefreshDatabase;

    protected User $docente;
    protected User $otroDocente;
    protected User $admin;
    protected Course $curso;
    protected Student $estudiante;
    protected Exercise $ejercicio;
    protected Actividad $actividad;
    protected Imagen $imagen;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);

        Storage::fake('private');

        $this->docente = User::where('correo', 'docente@graphilearn.test')->first();
        $this->otroDocente = User::where('correo', 'laura@graphilearn.test')->first();
        $this->admin = User::where('correo', 'admin@graphilearn.test')->first();

        // Obtener curso del docente
        $this->curso = Course::where('id_docente', $this->docente->id)->first();
        $this->estudiante = Student::where('id_curso', $this->curso->id)->first();
        $this->ejercicio = Exercise::where('tipo_trazo', 'circulo')->first();

        // Crear actividad de prueba
        $this->actividad = Actividad::create([
            'id_estudiante' => $this->estudiante->id,
            'id_ejercicio'  => $this->ejercicio->id,
            'fecha'         => now()->toDateString(),
            'estado'        => 'pendiente',
        ]);

        // Simular archivo físico y registro de imagen
        $fakePath = 'graphilearn/imagenes/test_stroke.png';
        Storage::disk('private')->put($fakePath, 'fake-image-binary-data');

        $this->imagen = Imagen::create([
            'id_actividad' => $this->actividad->id,
            'ruta'         => $fakePath,
            'formato'      => 'png',
            'fecha_carga'  => now(),
        ]);
    }

    /**
     * Payload simulado consistente con el contrato JSON de FastAPI (HU-07 a HU-10)
     */
    protected function mockFastApiResponse(array $overrides = []): array
    {
        return array_merge([
            'estado' => 'procesado',
            'mensaje' => 'Análisis computacional completado exitosamente.',
            'tipo_trazo' => 'circulo',
            'caracteristicas_geometricas' => [
                'longitud_trazo' => 185.6,
                'alto' => 120,
                'ancho' => 122,
                'proporcion' => 1.017,
                'inclinacion' => 5.2,
                'curvatura' => 0.045,
                'separacion_componentes' => 0.0,
                'posicion_normalizada' => [
                    'center_x' => 0.51,
                    'center_y' => 0.49,
                    'bbox_normalized' => [0.1, 0.1, 0.9, 0.9],
                ],
            ],
            'indicadores_cuantitativos' => [
                'desviacion' => 0.054,
                'rugosidad' => 0.125,
                'continuidad' => 0.98,
                'regularidad' => 0.88,
            ],
            'clasificacion' => [
                'disponible' => false,
                'risk_label' => 'no_disponible',
                'risk_score' => null,
                'model_version' => null,
                'mensaje' => 'Clasificación orientativa no disponible: pendiente de entrenamiento con dataset clínico.',
            ],
            'detalles_computacionales' => [
                'etapas_completadas' => ['1. Filtro', '2. Otsu', '3. Esqueleto Zhang-Suen'],
            ],
        ], $overrides);
    }

    /**
     * Test 1: Procesamiento de actividad autorizada exitoso con persistencia atómica.
     */
    public function test_teacher_can_process_authorized_activity_successfully(): void
    {
        Http::fake([
            '*/api/analyze' => Http::response($this->mockFastApiResponse(), 200),
        ]);

        $token = $this->docente->createToken('test')->plainTextToken;

        $response = $this->withToken($token)
            ->postJson("/api/v1/actividades/{$this->actividad->id}/procesar");

        $response->assertStatus(200)
            ->assertJsonPath('data.estado', 'procesado')
            ->assertJsonPath('data.estado_revision', 'pendiente')
            ->assertJsonPath('data.caracteristicas_geometricas.longitud_trazo', 185.6)
            ->assertJsonPath('data.indicadores_cuantitativos.regularidad', 0.88)
            ->assertJsonPath('data.clasificacion.risk_label', 'no_disponible');

        // Verificar persistencia en base de datos PostgreSQL
        $this->assertDatabaseHas('analysis_results', [
            'actividad_id'    => $this->actividad->id,
            'imagen_id'       => $this->imagen->id,
            'estado'          => 'procesado',
            'estado_revision' => 'pendiente',
        ]);

        $this->assertDatabaseHas('actividades', [
            'id'     => $this->actividad->id,
            'estado' => 'procesado',
        ]);
    }

    /**
     * Test 2: Docente intentando procesar actividad de otro docente debe recibir 403 Forbidden.
     */
    public function test_teacher_cannot_process_activity_of_another_teachers_student(): void
    {
        $token = $this->otroDocente->createToken('test')->plainTextToken;

        $response = $this->withToken($token)
            ->postJson("/api/v1/actividades/{$this->actividad->id}/procesar");

        $response->assertStatus(403);
    }

    /**
     * Test 3: Actividad sin imagen asociada debe retornar 422 Unprocessable Entity.
     */
    public function test_cannot_process_activity_without_image(): void
    {
        $actividadSinImagen = Actividad::create([
            'id_estudiante' => $this->estudiante->id,
            'id_ejercicio'  => $this->ejercicio->id,
            'fecha'         => now()->toDateString(),
            'estado'        => 'pendiente',
        ]);

        $token = $this->docente->createToken('test')->plainTextToken;

        $response = $this->withToken($token)
            ->postJson("/api/v1/actividades/{$actividadSinImagen->id}/procesar");

        $response->assertStatus(422)
            ->assertJsonFragment(['message' => 'La actividad no cuenta con una fotografía cargada para procesar.']);
    }

    /**
     * Test 4: Cuando FastAPI no está disponible, debe retornar 503 y no dejar resultados parciales.
     */
    public function test_ai_service_unavailable_returns_503_and_rolls_back(): void
    {
        Http::fake([
            '*/api/analyze' => function () {
                throw new ConnectionException('Connection refused to FastAPI service');
            },
        ]);

        $token = $this->docente->createToken('test')->plainTextToken;

        $response = $this->withToken($token)
            ->postJson("/api/v1/actividades/{$this->actividad->id}/procesar");

        $response->assertStatus(503)
            ->assertJsonPath('error', 'AI_SERVICE_UNAVAILABLE');

        // La actividad no debe quedar como procesada
        $this->assertDatabaseHas('actividades', [
            'id'     => $this->actividad->id,
            'estado' => 'pendiente',
        ]);

        // No debe existir resultado en analysis_results
        $this->assertDatabaseMissing('analysis_results', [
            'actividad_id' => $this->actividad->id,
        ]);
    }

    /**
     * Test 5: Timeout en el microservicio debe retornar 504.
     */
    public function test_ai_service_timeout_returns_504(): void
    {
        Http::fake([
            '*/api/analyze' => function () {
                throw new ConnectionException('cURL error 28: Operation timed out');
            },
        ]);

        $token = $this->docente->createToken('test')->plainTextToken;

        $response = $this->withToken($token)
            ->postJson("/api/v1/actividades/{$this->actividad->id}/procesar");

        $response->assertStatus(504)
            ->assertJsonPath('error', 'AI_SERVICE_TIMEOUT');

        $this->assertDatabaseMissing('analysis_results', [
            'actividad_id' => $this->actividad->id,
        ]);
    }

    /**
     * Test 6: Respuesta inválida o con error del microservicio retorna error controlado.
     */
    public function test_invalid_microservice_response_is_handled(): void
    {
        Http::fake([
            '*/api/analyze' => Http::response(['error' => 'Formato no soportado'], 422),
        ]);

        $token = $this->docente->createToken('test')->plainTextToken;

        $response = $this->withToken($token)
            ->postJson("/api/v1/actividades/{$this->actividad->id}/procesar");

        $response->assertStatus(422);
    }

    /**
     * Test 7: Procesamiento duplicado de una actividad ya procesada retorna 409 Conflict.
     */
    public function test_duplicate_processing_returns_409_conflict(): void
    {
        Http::fake([
            '*/api/analyze' => Http::response($this->mockFastApiResponse(), 200),
        ]);

        $token = $this->docente->createToken('test')->plainTextToken;

        // Primer procesamiento exitoso
        $this->withToken($token)
            ->postJson("/api/v1/actividades/{$this->actividad->id}/procesar")
            ->assertStatus(200);

        // Segundo intento de procesamiento sobre la misma actividad
        $response = $this->withToken($token)
            ->postJson("/api/v1/actividades/{$this->actividad->id}/procesar");

        $response->assertStatus(409)
            ->assertJsonFragment(['message' => 'Esta actividad ya fue procesada previamente. No se permite procesamiento duplicado.']);
    }

    /**
     * Test 8: Control de solicitudes concurrentes (actividad con estado 'procesando' retorna 409).
     */
    public function test_concurrent_processing_request_returns_409(): void
    {
        $this->actividad->update(['estado' => 'procesando']);

        $token = $this->docente->createToken('test')->plainTextToken;

        $response = $this->withToken($token)
            ->postJson("/api/v1/actividades/{$this->actividad->id}/procesar");

        $response->assertStatus(409)
            ->assertJsonFragment(['message' => 'La actividad ya se encuentra en proceso de análisis computacional.']);
    }

    /**
     * Test 9: Resultado de clasificación se inicializa con estado_revision = 'pendiente' (HU-11).
     */
    public function test_classification_result_initializes_with_pending_review(): void
    {
        Http::fake([
            '*/api/analyze' => Http::response($this->mockFastApiResponse(), 200),
        ]);

        $token = $this->docente->createToken('test')->plainTextToken;

        $this->withToken($token)
            ->postJson("/api/v1/actividades/{$this->actividad->id}/procesar")
            ->assertStatus(200);

        $this->assertDatabaseHas('analysis_results', [
            'actividad_id'    => $this->actividad->id,
            'estado_revision' => 'pendiente',
        ]);
    }

    /**
     * Test 10: Gestión de versiones de modelo (HU-16): solo el administrador puede acceder.
     */
    public function test_model_version_management_restricted_to_admin(): void
    {
        $teacherToken = $this->docente->createToken('teacher')->plainTextToken;
        $adminToken = $this->admin->createToken('admin')->plainTextToken;

        // Docente no puede listar ni registrar versiones
        $this->withToken($teacherToken)
            ->getJson('/api/v1/model-versions')
            ->assertStatus(403);

        $this->withToken($teacherToken)
            ->postJson('/api/v1/model-versions', [
                'name'      => 'Modelo RF',
                'version'   => 'v1.0',
                'file_path' => 'ai-service/models/randomforest_v1.0-benchmark.joblib',
            ])
            ->assertStatus(403);

        auth()->forgetGuards();

        // Administrador sí puede listar versiones
        $this->withToken($adminToken)
            ->getJson('/api/v1/model-versions')
            ->assertStatus(200);
    }

    /**
     * Test 11: Administrador no puede activar un modelo cuyo archivo no existe (HU-16).
     */
    public function test_admin_cannot_activate_non_existent_model_file(): void
    {
        $adminToken = $this->admin->createToken('admin')->plainTextToken;

        $versionInvalida = ModelVersion::create([
            'name'        => 'Modelo Inexistente',
            'version'     => 'v0.0-ghost',
            'algorithm'   => 'RandomForest',
            'file_path'   => 'ai-service/models/archivo_que_no_existe_en_disco.joblib',
            'active'      => false,
            'created_by'  => $this->admin->id,
        ]);

        $response = $this->withToken($adminToken)
            ->postJson("/api/v1/model-versions/{$versionInvalida->id}/activate");

        $response->assertStatus(422)
            ->assertJsonPath('message', 'No se puede activar el modelo porque el archivo no existe dentro del directorio configurado.');

        $this->assertDatabaseHas('model_versions', [
            'id'     => $versionInvalida->id,
            'active' => false,
        ]);
    }

    /**
     * Test 12: Administrador puede registrar y activar un modelo con archivo válido (HU-16).
     */
    public function test_admin_can_register_and_activate_valid_model(): void
    {
        Http::fake([
            '*/api/models/load' => Http::response(['mensaje' => 'Modelo cargado'], 200),
        ]);

        $adminToken = $this->admin->createToken('admin')->plainTextToken;

        $response = $this->withToken($adminToken)
            ->postJson('/api/v1/model-versions', [
                'name'        => 'RandomForest Benchmark',
                'version'     => 'v1.0-benchmark',
                'algorithm'   => 'RandomForest',
                'description' => 'Modelo entrenado para benchmark con partición por sujeto',
                'file_path'   => 'ai-service/models/randomforest_v1.0-benchmark.joblib',
                'metrics'     => ['f1_score' => 1.0, 'precision' => 1.0, 'recall' => 1.0],
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.name', 'RandomForest Benchmark');

        $versionId = $response->json('data.id');

        // Activar la versión
        $activateResponse = $this->withToken($adminToken)
            ->postJson("/api/v1/model-versions/{$versionId}/activate");

        $activateResponse->assertStatus(200)
            ->assertJsonPath('data.active', true);

        $this->assertDatabaseHas('model_versions', [
            'id'     => $versionId,
            'active' => true,
        ]);
    }
}
