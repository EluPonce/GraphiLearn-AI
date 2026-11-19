<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GraphiLearnSprint2BackendTest extends TestCase
{
    use RefreshDatabase;

    public function test_legacy_activity_read_is_available_but_old_processing_route_is_not_exposed(): void
    {
        $this->seed(DatabaseSeeder::class);
        $teacher = User::where('correo', 'docente@graphilearn.test')->firstOrFail();
        $this->withToken($teacher->createToken('legacy-read')->plainTextToken)->getJson('/api/v1/actividades')->assertOk();
        $this->postJson('/api/v1/actividades/1/procesar')->assertNotFound();
    }

    public function test_only_administrator_can_access_model_version_management(): void
    {
        $this->seed(DatabaseSeeder::class);
        $admin = User::where('rol', 'administrador')->firstOrFail();
        $teacher = User::where('rol', 'docente')->firstOrFail();

        $this->withToken($admin->createToken('admin-models')->plainTextToken)
            ->getJson('/api/v1/model-versions')->assertOk();
        auth()->forgetGuards();
        $this->withToken($teacher->createToken('teacher-models')->plainTextToken)
            ->getJson('/api/v1/model-versions')->assertForbidden();
    }
}
