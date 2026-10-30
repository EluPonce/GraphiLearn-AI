<?php

namespace Tests\Feature;

use App\Models\Actividad;
use App\Models\Course;
use App\Models\Exercise;
use App\Models\Imagen;
use App\Models\Institution;
use App\Models\Student;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PhaseOneSecurityTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_registration_cannot_create_an_administrator(): void
    {
        $this->postJson('/api/v1/auth/register', [
            'nombre' => 'Unauthorized Admin',
            'correo' => 'attacker@example.test',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'rol' => 'administrador',
        ])->assertUnprocessable();

        $this->assertDatabaseMissing('users', ['correo' => 'attacker@example.test']);
    }

    public function test_administrator_data_is_limited_to_its_institution(): void
    {
        $this->seed(DatabaseSeeder::class);
        $admin = User::where('rol', 'administrador')->firstOrFail();

        $otherInstitution = Institution::create(['nombre' => 'Otra institución']);
        $otherTeacher = User::factory()->create([
            'institution_id' => $otherInstitution->id,
            'rol' => 'docente',
        ]);
        $otherCourse = Course::create([
            'institution_id' => $otherInstitution->id,
            'id_docente' => $otherTeacher->id,
            'nombre' => 'Curso externo',
            'nivel' => 'Inicial',
            'gestion' => '2026',
        ]);
        $otherStudent = Student::create([
            'id_curso' => $otherCourse->id,
            'nombre' => 'Estudiante externo',
            'fecha_nacimiento' => '2020-01-01',
        ]);
        $token = $admin->createToken('phase-one-test')->plainTextToken;

        $this->withToken($token)->getJson('/api/v1/cursos')
            ->assertOk()->assertJsonCount(3, 'data')
            ->assertJsonMissing(['id' => $otherCourse->id]);

        $this->withToken($token)->getJson('/api/v1/cursos/'.$otherCourse->id)->assertForbidden();
        $this->withToken($token)->getJson('/api/v1/students')
            ->assertOk()->assertJsonCount(6, 'data')
            ->assertJsonMissing(['id' => $otherStudent->id]);

        $this->withToken($token)->getJson('/api/v1/dashboard')
            ->assertOk()
            ->assertJsonPath('stats.total_cursos', 3)
            ->assertJsonPath('stats.total_estudiantes', 6);
    }

    public function test_teacher_cannot_access_another_teachers_student(): void
    {
        $this->seed(DatabaseSeeder::class);
        $teacher = User::where('correo', 'docente@graphilearn.test')->firstOrFail();
        $foreignStudent = Student::whereHas('curso', fn ($query) => $query->where('id_docente', '!=', $teacher->id))->firstOrFail();
        $token = $teacher->createToken('phase-one-test')->plainTextToken;

        $this->withToken($token)->getJson('/api/v1/students/'.$foreignStudent->id)->assertForbidden();
    }

    public function test_administrator_cannot_download_a_private_student_image(): void
    {
        $this->seed(DatabaseSeeder::class);
        $admin = User::where('rol', 'administrador')->firstOrFail();
        $student = Student::firstOrFail();
        $exercise = Exercise::firstOrFail();
        $activity = Actividad::create([
            'id_estudiante' => $student->id,
            'id_ejercicio' => $exercise->id,
            'fecha' => '2026-10-29',
            'estado' => 'pendiente',
        ]);
        $image = Imagen::create([
            'id_actividad' => $activity->id,
            'ruta' => 'private/test-image.png',
            'formato' => 'png',
            'fecha_carga' => now(),
        ]);
        $token = $admin->createToken('phase-one-test')->plainTextToken;

        $this->withToken($token)->getJson('/api/v1/imagenes/'.$image->id.'/download')->assertForbidden();
        $this->withToken($token)->getJson('/api/v1/actividades/'.$activity->id)->assertForbidden();
        $this->withToken($token)->getJson('/api/v1/actividades/'.$activity->id.'/resultado')->assertForbidden();
    }

    public function test_model_version_path_cannot_escape_ai_service_root(): void
    {
        $this->seed(DatabaseSeeder::class);
        $admin = User::where('rol', 'administrador')->firstOrFail();
        $token = $admin->createToken('phase-one-test')->plainTextToken;

        $this->withToken($token)->postJson('/api/v1/model-versions', [
            'name' => 'Invalid path',
            'version' => '1.0',
            'file_path' => '../.env',
        ])->assertUnprocessable();

        $this->assertDatabaseMissing('model_versions', ['name' => 'Invalid path']);
    }
}
