<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $duplicateExecutions = DB::table('actividades')
            ->select('scheduled_activity_id', 'id_estudiante', 'id_ejercicio')
            ->whereNotNull('scheduled_activity_id')
            ->groupBy('scheduled_activity_id', 'id_estudiante', 'id_ejercicio')
            ->havingRaw('COUNT(*) > 1')
            ->exists();

        if ($duplicateExecutions) {
            throw new RuntimeException(
                'No se puede agregar la restricción de ejecuciones únicas: existen ejecuciones duplicadas por programación, estudiante y ejercicio. Revise esos registros antes de migrar.'
            );
        }

        Schema::create('scheduled_activity_exercises', function (Blueprint $table) {
            $table->id();
            $table->foreignId('scheduled_activity_id')->constrained('scheduled_activities')->cascadeOnDelete();
            $table->foreignId('exercise_id')->constrained('exercises')->restrictOnDelete();
            $table->integer('position');
            $table->timestamps();
            $table->unique(['scheduled_activity_id', 'exercise_id'], 'scheduled_activity_exercise_unique');
            $table->unique(['scheduled_activity_id', 'position'], 'scheduled_activity_position_unique');
        });

        DB::table('scheduled_activities')->orderBy('id')->chunk(500, function ($activities): void {
            foreach ($activities as $activity) {
                DB::table('scheduled_activity_exercises')->insertOrIgnore([
                    'scheduled_activity_id' => $activity->id,
                    'exercise_id' => $activity->exercise_id,
                    'position' => 1,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        });

        Schema::table('actividades', function (Blueprint $table) {
            $table->unique(
                ['scheduled_activity_id', 'id_estudiante', 'id_ejercicio'],
                'scheduled_student_exercise_unique'
            );
        });
    }

    public function down(): void
    {
        Schema::table('actividades', fn (Blueprint $table) => $table->dropUnique('scheduled_student_exercise_unique'));
        Schema::dropIfExists('scheduled_activity_exercises');
    }
};
