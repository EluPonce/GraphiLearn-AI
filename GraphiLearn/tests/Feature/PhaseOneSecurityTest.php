<?php

namespace Tests\Feature;

use App\Models\Course;
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
            'nombre' => 'Unauthorized Admin', 'correo' => 'attacker@example.test',
            'password' => 'password123', 'password_confirmation' => 'password123', 'rol' => 'administrador',
        ])->assertUnprocessable();
        $this->assertDatabaseMissing('users', ['correo' => 'attacker@example.test']);
    }

    public function test_teacher_cannot_access_another_teachers_student(): void
    {
        $this->seed(DatabaseSeeder::class);
        $teacher = User::where('correo', 'docente@graphilearn.test')->firstOrFail();
        $foreignStudent = Student::whereHas('curso', fn ($query) => $query->where('id_docente', '!=', $teacher->id))->firstOrFail();
        $this->withToken($teacher->createToken('teacher')->plainTextToken)
            ->getJson('/api/estudiantes/'.$foreignStudent->id.'/ficha')->assertForbidden();
    }

    public function test_direction_is_read_only_and_scoped_to_its_institution(): void
    {
        $this->seed(DatabaseSeeder::class);
        $institution = Institution::firstOrFail();
        $direction = User::create([
            'institution_id' => $institution->id, 'nombre' => 'Dirección ejemplo',
            'correo' => 'direccion-readonly@graphilearn.test', 'password' => 'password', 'rol' => 'direccion',
        ]);
        $token = $direction->createToken('direction')->plainTextToken;
        $this->withToken($token)->getJson('/api/direccion/cursos')->assertOk();
        auth()->forgetGuards();
        $this->withToken($token)->postJson('/api/evaluaciones', [
            'id_curso' => Course::firstOrFail()->id, 'trimestre' => 1, 'nivel' => 1, 'tamano_figura_mm' => 80,
        ])->assertForbidden();
    }

    public function test_administrator_is_limited_to_model_version_management(): void
    {
        $this->seed(DatabaseSeeder::class);
        $admin = User::where('rol', 'administrador')->firstOrFail();
        $token = $admin->createToken('admin')->plainTextToken;
        $this->withToken($token)->getJson('/api/v1/model-versions')->assertOk();
        auth()->forgetGuards();
        $this->withToken($token)->getJson('/api/v1/cursos')->assertForbidden();
        auth()->forgetGuards();
        $this->withToken($token)->getJson('/api/v1/students')->assertForbidden();
    }

    public function test_model_version_path_cannot_escape_ai_service_root(): void
    {
        $this->seed(DatabaseSeeder::class);
        $admin = User::where('rol', 'administrador')->firstOrFail();
        $this->withToken($admin->createToken('admin')->plainTextToken)->postJson('/api/v1/model-versions', [
            'name' => 'Invalid path', 'version' => '1.0', 'file_path' => '../.env',
        ])->assertUnprocessable();
        $this->assertDatabaseMissing('model_versions', ['name' => 'Invalid path']);
    }
}
