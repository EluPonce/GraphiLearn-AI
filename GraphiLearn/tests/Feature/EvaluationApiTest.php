<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\Evaluacion;
use App\Models\FotoEjercicio;
use App\Models\Exercise;
use App\Models\Student;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class EvaluationApiTest extends TestCase
{
    use RefreshDatabase;

    protected User $teacher;
    protected User $otherTeacher;
    protected User $admin;
    protected User $direction;
    protected Course $course;
    protected Student $student;
    protected string $teacherToken;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
        $institution = \App\Models\Institution::firstOrFail();
        $this->teacher = User::where('correo', 'docente@graphilearn.test')->firstOrFail();
        $this->otherTeacher = User::where('correo', 'laura@graphilearn.test')->firstOrFail();
        $this->admin = User::where('rol', 'administrador')->firstOrFail();
        $this->direction = User::create(['institution_id' => $institution->id, 'nombre' => 'Dirección test', 'correo' => 'direccion-test@graphilearn.test', 'password' => 'password', 'rol' => 'direccion']);
        $this->course = Course::where('id_docente', $this->teacher->id)->firstOrFail();
        $this->student = Student::where('id_curso', $this->course->id)->firstOrFail();
        $this->teacherToken = $this->teacher->createToken('evaluation-test')->plainTextToken;
        Storage::fake('private');
        config(['services.ai_service.analysis_enabled' => false]);
    }

    private function createEvaluation(int $courseId, int $term = 1): int
    {
        return $this->withToken($this->teacherToken)->postJson('/api/evaluaciones', [
            'id_curso' => $courseId, 'trimestre' => $term, 'nivel' => 1, 'tamano_figura_mm' => 80,
        ])->assertCreated()->json('data.id');
    }

    public function test_teacher_cannot_open_another_teachers_course(): void
    {
        $foreignCourse = Course::where('id_docente', $this->otherTeacher->id)->firstOrFail();
        $this->withToken($this->teacherToken)->getJson("/api/cursos/{$foreignCourse->id}/evaluaciones/1")->assertForbidden();
    }

    public function test_new_evaluation_creates_four_empty_slots_per_student_and_is_unique(): void
    {
        $evaluationId = $this->createEvaluation($this->course->id);
        $this->assertSame('direccion', $this->direction->fresh()->rol);
        $this->assertSame(4 * $this->course->estudiantes()->count(), FotoEjercicio::where('id_evaluacion', $evaluationId)->count());
        $this->assertSame(4, count($this->withToken($this->teacherToken)->getJson("/api/cursos/{$this->course->id}/evaluaciones/1")->assertOk()->json('data.estudiantes.0.ejercicios')));
        $this->withToken($this->teacherToken)->postJson('/api/evaluaciones', [
            'id_curso' => $this->course->id, 'trimestre' => 1, 'nivel' => 2, 'tamano_figura_mm' => 60,
        ])->assertStatus(409);
    }

    public function test_admin_cannot_create_or_rate_evaluations_but_can_keep_model_management_role(): void
    {
        $this->withToken($this->admin->createToken('admin')->plainTextToken)->postJson('/api/evaluaciones', [
            'id_curso' => $this->course->id, 'trimestre' => 1, 'nivel' => 1, 'tamano_figura_mm' => 80,
        ])->assertForbidden();
        $this->withToken($this->admin->createToken('admin-model')->plainTextToken)->getJson('/api/v1/model-versions')->assertOk();
    }

    public function test_direction_can_read_courses_but_cannot_rate(): void
    {
        $evaluationId = $this->createEvaluation($this->course->id);
        $this->assertSame('direccion', $this->direction->fresh()->rol);
        $token = $this->direction->createToken('direction')->plainTextToken;
        auth()->forgetGuards();
        $this->withToken($token)->getJson('/api/direccion/cursos')->assertOk();
        auth()->forgetGuards();
        $this->withToken($token)->getJson("/api/cursos/{$this->course->id}/evaluaciones/1")->assertOk();
        $photo = FotoEjercicio::where('id_evaluacion', $evaluationId)->where('id_estudiante', $this->student->id)->firstOrFail();
        auth()->forgetGuards();
        $this->withToken($token)->putJson("/api/evaluaciones/{$evaluationId}/estudiantes/{$this->student->id}/ejercicios/linea/valoracion", ['valoracion' => 'S'])->assertForbidden();
        $this->assertSame('sin_foto', $photo->fresh()->estado);
    }

    public function test_photo_upload_works_without_fastapi_and_stays_private_until_teacher_rates(): void
    {
        $evaluationId = $this->createEvaluation($this->course->id);
        $response = $this->withToken($this->teacherToken)->post("/api/evaluaciones/{$evaluationId}/estudiantes/{$this->student->id}/ejercicios/linea/foto", [
            'foto' => UploadedFile::fake()->image('sample.png', 800, 600)->size(300),
        ], ['Accept' => 'application/json']);
        $response->assertCreated()->assertJsonPath('data.estado', 'foto_lista')->assertJsonPath('data.analisis_disponible', false)->assertJsonPath('data.analisis', null);
        $photo = FotoEjercicio::where('id_evaluacion', $evaluationId)->where('id_estudiante', $this->student->id)->firstOrFail();
        $this->assertStringContainsString('/'.$photo->id.'/', '/'.$photo->ruta_imagen);
        Storage::disk('private')->assertExists($photo->ruta_imagen);

        $this->withToken($this->teacherToken)->putJson("/api/evaluaciones/{$evaluationId}/estudiantes/{$this->student->id}/ejercicios/linea/valoracion", ['valoracion' => 'ED', 'observacion' => 'Observación de ejemplo'])->assertOk();
        $this->assertSame('valorado', $photo->fresh()->estado);
        $this->assertSame('ED', $photo->fresh()->valoracion);
    }

    public function test_photo_upload_falls_back_to_manual_rating_when_fastapi_is_down(): void
    {
        $evaluationId = $this->createEvaluation($this->course->id);
        config(['services.ai_service.analysis_enabled' => true]);
        Http::fake(['*/api/analyze' => function () { throw new ConnectionException('Connection refused'); }]);

        $this->withToken($this->teacherToken)->post("/api/evaluaciones/{$evaluationId}/estudiantes/{$this->student->id}/ejercicios/zigzag/foto", [
            'foto' => UploadedFile::fake()->image('sample.png', 800, 600),
        ], ['Accept' => 'application/json'])->assertCreated()
            ->assertJsonPath('data.estado', 'foto_lista')
            ->assertJsonPath('data.analisis_disponible', false)
            ->assertJsonPath('data.analisis', null);
    }

    public function test_report_counts_ratings_and_two_na_items_for_observation(): void
    {
        $evaluationId = $this->createEvaluation($this->course->id);
        $student = $this->student;
        $photos = FotoEjercicio::where('id_evaluacion', $evaluationId)->where('id_estudiante', $student->id)->get();
        foreach ($photos as $index => $photo) {
            Storage::disk('private')->put("sample/{$photo->id}.png", 'fixture');
            $photo->update(['ruta_imagen' => "sample/{$photo->id}.png", 'estado' => 'foto_lista']);
            $photo->update(['estado' => 'valorado', 'valoracion' => $index < 2 ? 'NA' : 'S', 'valorado_por' => $this->teacher->id]);
        }
        $result = $this->withToken($this->teacherToken)->getJson("/api/informes/curso/{$this->course->id}?trimestre=1")->assertOk();
        $result->assertJsonPath('data.conteos.linea.NA', 1)->assertJsonPath('data.requieren_observacion.0.id', $student->id);
    }

    public function test_legacy_react_reads_assigned_courses_students_and_photos_after_rename(): void
    {
        $this->course->update(['active' => false]);
        $exerciseIds = Exercise::orderBy('id')->pluck('id');
        foreach (range(1, 6) as $index) {
            FotoEjercicio::create([
                'id_estudiante' => $this->student->id,
                'id_ejercicio' => $exerciseIds[($index - 1) % $exerciseIds->count()],
                'fecha' => '2026-10-30', 'estado' => 'valorado', 'valoracion' => 'S',
                'valorado_por' => $this->teacher->id,
            ]);
        }

        $courses = $this->withToken($this->teacherToken)->getJson('/api/v1/cursos')->assertOk();
        $courses->assertJsonFragment(['id' => $this->course->id, 'nombre' => $this->course->nombre]);
        $this->withToken($this->teacherToken)->getJson('/api/v1/students?per_page=50')->assertOk()
            ->assertJsonFragment(['id_curso' => $this->course->id]);
        $photos = $this->withToken($this->teacherToken)->getJson('/api/v1/actividades?per_page=50&fecha_desde=2026-10-30&fecha_hasta=2026-10-30')->assertOk();
        $this->assertCount(6, $photos->json('data'));
        $this->assertSame('2026-10-30', $photos->json('data.0.fecha'));
        $profile = $this->withToken($this->teacherToken)->getJson("/api/v1/students/{$this->student->id}/progress")->assertOk();
        $this->assertCount(6, $profile->json('data.executions'));
        $this->assertSame(6, FotoEjercicio::where('id_estudiante', $this->student->id)->count());
    }
}
