<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GraphiLearnInitialBackendTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Verificar que los seeders cargan los datos de prueba iniciales sin errores.
     */
    public function test_database_seeder_loads_all_initial_data(): void
    {
        $this->seed(DatabaseSeeder::class);

        $this->assertDatabaseHas('institutions', [
            'nombre' => 'Unidad Educativa San José',
        ]);

        $this->assertDatabaseHas('users', [
            'correo' => 'docente@graphilearn.test',
            'rol' => 'docente',
        ]);

        $this->assertDatabaseHas('users', [
            'correo' => 'admin@graphilearn.test',
            'rol' => 'administrador',
        ]);

        $this->assertDatabaseHas('courses', [
            'nombre' => 'Kinder A (Nivel Inicial)',
        ]);

        $this->assertDatabaseCount('students', 6);
        $this->assertDatabaseCount('exercises', 4);
    }

    /**
     * Verificar registro de docente.
     */
    public function test_public_teacher_registration_is_disabled(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'nombre' => 'Docente Nuevo',
            'correo' => 'docente.nuevo@graphilearn.test',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'rol' => 'docente',
        ]);

        $response->assertForbidden();
        $this->assertDatabaseMissing('users', ['correo' => 'docente.nuevo@graphilearn.test']);
    }

    /**
     * Verificar login exitoso y fallido.
     */
    public function test_user_login_success_and_failure(): void
    {
        $this->seed(DatabaseSeeder::class);

        // Intento con clave incorrecta
        $failResponse = $this->postJson('/api/v1/auth/login', [
            'correo' => 'docente@graphilearn.test',
            'password' => 'clave_incorrecta',
        ]);
        $failResponse->assertStatus(422);

        // Login exitoso
        $successResponse = $this->postJson('/api/v1/auth/login', [
            'correo' => 'docente@graphilearn.test',
            'password' => 'password',
        ]);

        $successResponse->assertStatus(200)
            ->assertJsonStructure([
                'message',
                'access_token',
                'token_type',
                'user' => ['id', 'nombre', 'correo', 'rol'],
            ]);
    }

    /**
     * Verificar endpoint /api/v1/auth/me con token válido.
     */
    public function test_auth_me_returns_user_data_when_authenticated(): void
    {
        $user = User::factory()->create(['rol' => 'docente']);
        $token = $user->createToken('test_token')->plainTextToken;

        $this->withToken($token)
            ->getJson('/api/v1/auth/me')
            ->assertStatus(200)
            ->assertJsonPath('data.correo', $user->correo);
    }

    /**
     * Verificar que /api/v1/auth/me sin token retorna 401.
     */
    public function test_auth_me_unauthenticated_returns_401(): void
    {
        $this->getJson('/api/v1/auth/me')->assertStatus(401);
    }

    /**
     * Verificar endpoint logout revoca el token en base de datos.
     */
    public function test_logout_revokes_token(): void
    {
        $user = User::factory()->create(['rol' => 'docente']);
        $token = $user->createToken('test_token')->plainTextToken;

        $this->assertDatabaseCount('personal_access_tokens', 1);

        $response = $this->withToken($token)
            ->postJson('/api/v1/auth/logout');

        $response->assertStatus(200);
        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    /**
     * Verificar que el docente puede ver el listado de estudiantes de sus cursos (4 estudiantes).
     */
    public function test_teacher_can_access_students_list(): void
    {
        $this->seed(DatabaseSeeder::class);

        $teacher = User::where('correo', 'docente@graphilearn.test')->first();
        $token = $teacher->createToken('teacher')->plainTextToken;

        $response = $this->withToken($token)
            ->getJson('/api/v1/students');

        $response->assertStatus(200)
            ->assertJsonCount(4, 'data');
    }

    /** Administración de modelos no implica acceso a datos de estudiantes. */
    public function test_admin_cannot_access_students_list(): void
    {
        $this->seed(DatabaseSeeder::class);

        $admin = User::where('rol', 'administrador')->first();
        $token = $admin->createToken('admin')->plainTextToken;

        $response = $this->withToken($token)
            ->getJson('/api/v1/students');

        $response->assertForbidden();
    }

    /**
     * El administrador conserva su alcance exclusivo para versiones del modelo.
     */
    public function test_admin_cannot_access_courses(): void
    {
        $this->seed(DatabaseSeeder::class);

        $admin = User::where('rol', 'administrador')->first();
        $adminToken = $admin->createToken('admin')->plainTextToken;

        $this->withToken($adminToken)->getJson('/api/v1/cursos')->assertForbidden();
    }

    /**
     * Verificar que el docente solo ve sus cursos asignados (2 cursos).
     */
    public function test_teacher_can_access_assigned_courses(): void
    {
        $this->seed(DatabaseSeeder::class);

        $teacher = User::where('correo', 'docente@graphilearn.test')->first();
        $teacherToken = $teacher->createToken('teacher')->plainTextToken;

        $this->withToken($teacherToken)
            ->getJson('/api/v1/cursos')
            ->assertStatus(200)
            ->assertJsonCount(2, 'data');
    }

    /**
     * Verificar que peticiones no autenticadas a /students retornan 401.
     */
    public function test_unauthenticated_cannot_access_students_list(): void
    {
        $this->getJson('/api/v1/students')->assertStatus(401);
    }
}
