<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\Institution;
use App\Models\Student;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/**
 * Rutas del flujo de Evaluación expuestas bajo /api/v1 para el cliente React,
 * separación de la lista de cursos de Dirección y lectura de informes.
 */
class EvaluationRoutesV1Test extends TestCase
{
    use RefreshDatabase;

    private User $teacher;
    private User $otherTeacher;
    private User $direction;
    private Course $course;
    private Student $student;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
        Storage::fake('private');
        config(['services.ai_service.analysis_enabled' => false]);

        $institution = Institution::firstOrFail();
        $this->teacher = User::where('correo', 'docente@graphilearn.test')->firstOrFail();
        $this->otherTeacher = User::where('correo', 'laura@graphilearn.test')->firstOrFail();
        $this->direction = User::create([
            'institution_id' => $institution->id, 'nombre' => 'Dirección prueba',
            'correo' => 'direccion-v1@graphilearn.test', 'password' => 'password', 'rol' => 'direccion',
        ]);
        $this->course = Course::where('id_docente', $this->teacher->id)->orderBy('id')->firstOrFail();
        $this->student = Student::where('id_curso', $this->course->id)->orderBy('id')->firstOrFail();
    }

    /** Cambia de usuario entre peticiones del mismo test (Sanctum cachea el guard). */
    private function as(User $user): static
    {
        $this->app['auth']->forgetGuards();

        return $this->withToken($user->createToken('test')->plainTextToken);
    }

    private function createEvaluation(string $prefix = '/api/v1'): int
    {
        return $this->as($this->teacher)->postJson("{$prefix}/evaluaciones", [
            'id_curso' => $this->course->id, 'trimestre' => 1, 'nivel' => 1, 'tamano_figura_mm' => 80,
        ])->assertCreated()->json('data.id');
    }

    public function test_evaluation_flow_is_available_under_v1(): void
    {
        $evaluationId = $this->createEvaluation('/api/v1');

        $this->as($this->teacher)->getJson("/api/v1/cursos/{$this->course->id}/evaluaciones/1")
            ->assertOk()
            ->assertJsonPath('data.evaluacion.id', $evaluationId)
            ->assertJsonCount(4, 'data.ejercicios');

        $this->as($this->teacher)->getJson('/api/v1/cursos')
            ->assertOk()
            ->assertJsonFragment([
                'id' => $this->course->id, 'trimestre_actual' => 1, 'nivel' => 1, 'evaluacion_id' => $evaluationId,
            ])
            ->assertJsonStructure(['data' => [['id', 'nombre', 'trimestre_actual', 'nivel', 'estudiantes_completos', 'total_estudiantes', 'evaluacion_id']]]);
    }

    public function test_direction_uses_its_own_course_route(): void
    {
        foreach (['/api', '/api/v1'] as $prefix) {
            $this->as($this->direction)->getJson("{$prefix}/cursos")->assertForbidden();
            $this->as($this->direction)->getJson("{$prefix}/direccion/cursos")
                ->assertOk()
                ->assertJsonFragment(['id' => $this->course->id, 'curso' => $this->course->nombre]);
        }
    }

    public function test_direction_can_read_course_report_but_cannot_rate(): void
    {
        $evaluationId = $this->createEvaluation();

        foreach (['/api', '/api/v1'] as $prefix) {
            $this->as($this->direction)->getJson("{$prefix}/informes/curso/{$this->course->id}?trimestre=1")
                ->assertOk()
                ->assertJsonPath('data.curso_id', $this->course->id);
        }

        $this->as($this->direction)
            ->putJson("/api/v1/evaluaciones/{$evaluationId}/estudiantes/{$this->student->id}/ejercicios/linea/valoracion", ['valoracion' => 'S'])
            ->assertForbidden();
    }

    public function test_teacher_cannot_read_report_of_another_teachers_course(): void
    {
        $this->createEvaluation();

        $this->as($this->otherTeacher)->getJson("/api/v1/informes/curso/{$this->course->id}?trimestre=1")
            ->assertForbidden();
    }

    public function test_rating_response_exposes_only_id_and_name_of_the_rater(): void
    {
        $evaluationId = $this->createEvaluation();
        $base = "/api/v1/evaluaciones/{$evaluationId}/estudiantes/{$this->student->id}/ejercicios/linea";

        $this->as($this->teacher)->post("{$base}/foto", [
            'foto' => UploadedFile::fake()->image('linea.png', 800, 600),
        ], ['Accept' => 'application/json'])->assertCreated();

        $response = $this->as($this->teacher)->putJson("{$base}/valoracion", ['valoracion' => 'ED', 'observacion' => 'Observación de prueba'])
            ->assertOk()
            ->assertJsonPath('data.valoracion', 'ED');

        $this->assertSame(
            ['id' => $this->teacher->id, 'nombre' => $this->teacher->nombre],
            $response->json('data.valorado_por'),
        );
        $response->assertJsonMissingPath('data.valorado_por.correo');
    }

    public function test_grid_exposes_exercise_description_and_analysis_summary(): void
    {
        $evaluationId = $this->createEvaluation();
        $base = "/api/v1/evaluaciones/{$evaluationId}/estudiantes/{$this->student->id}/ejercicios/circulos";
        $this->as($this->teacher)->post("{$base}/foto", [
            'foto' => UploadedFile::fake()->image('circulos.png', 800, 600),
        ], ['Accept' => 'application/json'])->assertCreated()->assertJsonPath('data.analisis_disponible', false);

        $photo = \App\Models\FotoEjercicio::where('id_evaluacion', $evaluationId)->where('id_estudiante', $this->student->id)
            ->where('estado', 'foto_lista')->firstOrFail();
        \App\Models\Analisis::create([
            'id_foto' => $photo->id, 'tipo_trazo' => 'circulo', 'estado' => 'procesado', 'sugerencia' => 'ED',
            'indicadores' => ['desviacion' => 0.2, 'rugosidad' => 0.3, 'continuidad' => 0.9, 'regularidad' => 0.7],
            'detalles_computacionales' => ['aviso_pedagogico' => 'Aviso de prueba', 'archivo' => 'x.png'],
        ]);

        $response = $this->as($this->teacher)->getJson("/api/v1/cursos/{$this->course->id}/evaluaciones/1")->assertOk();

        $catalog = collect($response->json('data.ejercicios'))->keyBy('ejercicio');
        $this->assertSame(\App\Models\Exercise::find($catalog['circulos']['id_ejercicio'])->descripcion, $catalog['circulos']['descripcion']);
        $this->assertArrayHasKey('descripcion', $catalog['linea']);

        $row = collect($response->json('data.estudiantes'))->firstWhere('id_estudiante', $this->student->id);
        $cells = collect($row['ejercicios'])->keyBy('ejercicio');
        $this->assertTrue($cells['circulos']['analisis_disponible']);
        $this->assertSame([
            'indicadores' => ['desviacion' => 0.2, 'rugosidad' => 0.3, 'continuidad' => 0.9, 'regularidad' => 0.7],
            'sugerencia' => 'ED',
            'aviso_pedagogico' => 'Aviso de prueba',
        ], $cells['circulos']['analisis']);
        // Sin análisis: null; y la descripción no se repite en cada celda.
        $this->assertNull($cells['linea']['analisis']);
        $this->assertArrayNotHasKey('descripcion', $cells['circulos']);
        // Otros detalles computacionales no se exponen en el cuadro.
        $this->assertArrayNotHasKey('archivo', $cells['circulos']['analisis']);
    }

    public function test_rating_stores_observation_per_exercise_and_sheet_returns_it(): void
    {
        $this->assertTrue(\Illuminate\Support\Facades\Schema::hasColumn('observaciones', 'id_ejercicio'));
        $evaluationId = $this->createEvaluation();
        $base = "/api/v1/evaluaciones/{$evaluationId}/estudiantes/{$this->student->id}/ejercicios";
        foreach (['linea' => ['ED', 'Se sale al final.'], 'espiral' => ['NA', null]] as $token => [$rating, $note]) {
            $this->as($this->teacher)->post("{$base}/{$token}/foto", ['foto' => UploadedFile::fake()->image("{$token}.png", 800, 600)], ['Accept' => 'application/json'])->assertCreated();
            $this->as($this->teacher)->putJson("{$base}/{$token}/valoracion", ['valoracion' => $rating, 'observacion' => $note])->assertOk();
        }
        // Una segunda valoración de la misma celda: la ficha muestra la observación más reciente.
        $this->as($this->teacher)->putJson("{$base}/linea/valoracion", ['valoracion' => 'S', 'observacion' => 'Ya no se sale.'])->assertOk();
        // Observación antigua sin Ejercicio (filas previas a la migración).
        \App\Models\Observacion::create(['id_estudiante' => $this->student->id, 'id_evaluacion' => $evaluationId, 'texto' => 'General', 'autor' => $this->teacher->id]);

        $lineaId = \App\Models\Exercise::where('tipo_trazo', 'linea')->where('activo', true)->value('id');
        $this->assertDatabaseHas('observaciones', ['id_estudiante' => $this->student->id, 'id_evaluacion' => $evaluationId, 'id_ejercicio' => $lineaId, 'texto' => 'Se sale al final.']);
        $this->assertSame(2, \App\Models\Observacion::where('id_ejercicio', $lineaId)->count());

        $response = $this->as($this->teacher)->getJson("/api/v1/estudiantes/{$this->student->id}/ficha")->assertOk()
            ->assertJsonPath('data.estudiante.id', $this->student->id)
            ->assertJsonPath('data.trimestres.T1.id_evaluacion', $evaluationId)
            ->assertJsonPath('data.trimestres.T1.nivel', 1)
            ->assertJsonPath('data.trimestres.T2', null)
            ->assertJsonMissingPath('data.estudiante.fecha_nacimiento');
        $rows = collect($response->json('data.ejercicios'))->keyBy('ejercicio');
        $this->assertSame(['estado' => 'valorado', 'valoracion' => 'S', 'observacion' => 'Ya no se sale.'], collect($rows['linea']['T1'])->only(['estado', 'valoracion', 'observacion'])->all());
        $this->assertSame('NA', $rows['espiral']['T1']['valoracion']);
        $this->assertNull($rows['espiral']['T1']['observacion']);
        $this->assertNull($rows['linea']['T2']['valoracion']);
        $observaciones = collect($response->json('data.observaciones'));
        $this->assertCount(3, $observaciones);
        $this->assertSame('linea', $observaciones->firstWhere('texto', 'Se sale al final.')['ejercicio']);
        $this->assertNull($observaciones->firstWhere('texto', 'General')['ejercicio']);
        $this->assertSame(['id' => $this->teacher->id, 'nombre' => $this->teacher->nombre], $observaciones->first()['autor']);

        // Dirección lee la ficha; otra docente no.
        $this->as($this->direction)->getJson("/api/v1/estudiantes/{$this->student->id}/ficha")->assertOk();
        $this->as($this->otherTeacher)->getJson("/api/v1/estudiantes/{$this->student->id}/ficha")->assertForbidden();
    }

    public function test_direction_course_list_reports_completed_students(): void
    {
        $evaluationId = $this->createEvaluation();
        $base = "/api/v1/evaluaciones/{$evaluationId}/estudiantes/{$this->student->id}/ejercicios";
        foreach (['linea', 'circulos', 'zigzag', 'espiral'] as $token) {
            $this->as($this->teacher)->post("{$base}/{$token}/foto", ['foto' => UploadedFile::fake()->image("{$token}.png", 800, 600)], ['Accept' => 'application/json'])->assertCreated();
            $this->as($this->teacher)->putJson("{$base}/{$token}/valoracion", ['valoracion' => $token === 'espiral' ? 'NA' : 'S'])->assertOk();
        }
        $total = Student::where('id_curso', $this->course->id)->count();

        $row = collect($this->as($this->direction)->getJson('/api/v1/direccion/cursos')->assertOk()->json('data'))
            ->firstWhere('id', $this->course->id);
        $this->assertSame(1, $row['estudiantes_completos']);
        $this->assertSame($total, $row['total_estudiantes']);
        $this->assertSame(1, $row['trimestre']);
        $this->assertSame(1, $row['nivel']);
        $this->assertSame(['S' => 3, 'ED' => 0, 'NA' => 1], $row['valoraciones']);
        $this->assertSame($total === 1, $row['evaluacion_completa']);
    }

    public function test_successful_analysis_is_stored_with_features_indicators_and_notice(): void
    {
        $evaluationId = $this->createEvaluation();
        config(['services.ai_service.analysis_enabled' => true, 'services.ai_service.token' => 'test-internal-token']);
        \Illuminate\Support\Facades\Http::fake(['*/api/analyze' => \Illuminate\Support\Facades\Http::response([
            'estado' => 'procesado', 'mensaje' => 'ok', 'tipo_trazo' => 'circulo',
            'caracteristicas_geometricas' => ['longitud_trazo' => 410.5, 'alto' => 120, 'ancho' => 118, 'proporcion' => 0.98, 'inclinacion' => 3.2, 'curvatura' => 0.05, 'separacion_componentes' => 0.0, 'posicion_normalizada' => ['center_x' => 0.5, 'center_y' => 0.5, 'bbox_normalized' => [0.4, 0.4, 0.6, 0.6]]],
            'indicadores_cuantitativos' => ['desviacion' => 0.08, 'rugosidad' => 0.3, 'continuidad' => 1.0, 'regularidad' => 0.85],
            'clasificacion' => ['disponible' => false, 'sugerencia' => null, 'model_version' => null, 'mensaje' => 'Sin modelo'],
            'detalles_computacionales' => ['aviso_pedagogico' => 'La sugerencia es experimental y la valoración final corresponde a la docente.'],
        ])]);

        $this->as($this->teacher)->post("/api/v1/evaluaciones/{$evaluationId}/estudiantes/{$this->student->id}/ejercicios/circulos/foto", [
            'foto' => UploadedFile::fake()->image('circulos.png', 800, 600),
        ], ['Accept' => 'application/json'])->assertCreated()
            ->assertJsonPath('data.estado', 'foto_lista')
            ->assertJsonPath('data.analisis_disponible', true)
            ->assertJsonPath('data.analisis.indicadores.desviacion', 0.08)
            ->assertJsonPath('data.analisis.sugerencia', null);

        \Illuminate\Support\Facades\Http::assertSent(fn ($request) => $request->hasHeader('X-Internal-Token', 'test-internal-token')
            && str_ends_with($request->url(), '/api/analyze'));
        $photo = \App\Models\FotoEjercicio::where('id_evaluacion', $evaluationId)->where('id_estudiante', $this->student->id)->where('estado', 'foto_lista')->firstOrFail();
        $analysis = \App\Models\Analisis::where('id_foto', $photo->id)->firstOrFail();
        $this->assertSame('procesado', $analysis->estado);
        $this->assertSame('circulo', $analysis->tipo_trazo);
        $this->assertSame(410.5, $analysis->caracteristicas['longitud_trazo']);
        $this->assertSame(0.85, $analysis->indicadores['regularidad']);
        $this->assertSame('La sugerencia es experimental y la valoración final corresponde a la docente.', $analysis->detalles_computacionales['aviso_pedagogico']);
        $this->assertNull($analysis->id_modelo);
    }

    public function test_photo_upload_rejects_wrong_format_and_oversized_files_with_reason(): void
    {
        $evaluationId = $this->createEvaluation();
        $url = "/api/v1/evaluaciones/{$evaluationId}/estudiantes/{$this->student->id}/ejercicios/linea/foto";

        $this->as($this->teacher)->post($url, ['foto' => UploadedFile::fake()->create('hoja.pdf', 100, 'application/pdf')], ['Accept' => 'application/json'])
            ->assertStatus(422)->assertJsonPath('errors.foto.0', 'La foto debe estar en formato JPG o PNG.');
        $this->as($this->teacher)->post($url, ['foto' => UploadedFile::fake()->image('grande.jpg', 800, 600)->size(6000)], ['Accept' => 'application/json'])
            ->assertStatus(422)->assertJsonPath('errors.foto.0', 'La foto no puede superar los 5 MB.');
        $this->as($this->teacher)->post($url, ['foto' => UploadedFile::fake()->image('ok.jpg', 800, 600)->size(4000)], ['Accept' => 'application/json'])
            ->assertCreated();
    }
}
