<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('scheduled_activities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained('courses')->restrictOnDelete();
            $table->foreignId('exercise_id')->constrained('exercises')->restrictOnDelete();
            $table->foreignId('created_by')->constrained('users')->restrictOnDelete();
            $table->string('name', 150);
            $table->text('instructions')->nullable();
            // Period labels remain free-form until confirmed with the licenciada.
            $table->string('period_reference', 100)->nullable();
            $table->date('scheduled_for')->nullable();
            $table->boolean('active')->default(true);
            $table->timestamps();
            $table->softDeletes();
            $table->index(['course_id', 'active']);
        });

        Schema::table('actividades', function (Blueprint $table) {
            $table->foreignId('scheduled_activity_id')->nullable()->after('id')
                ->constrained('scheduled_activities')->nullOnDelete();
            $table->foreignId('evaluated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('pedagogical_rating', ['S', 'ED', 'NA'])->nullable();
            $table->text('pedagogical_observations')->nullable();
            $table->string('period_reference', 100)->nullable();
        });

        Schema::create('activity_evaluation_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('actividad_id')->constrained('actividades')->cascadeOnDelete();
            $table->foreignId('changed_by')->constrained('users')->restrictOnDelete();
            $table->enum('pedagogical_rating', ['S', 'ED', 'NA'])->nullable();
            $table->text('pedagogical_observations')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->index(['actividad_id', 'created_at']);
        });

        Schema::table('courses', function (Blueprint $table) {
            $table->boolean('active')->default(true);
        });
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('active')->default(true);
        });
    }

    public function down(): void
    {
        Schema::table('users', fn (Blueprint $table) => $table->dropColumn('active'));
        Schema::table('courses', fn (Blueprint $table) => $table->dropColumn('active'));
        Schema::dropIfExists('activity_evaluation_history');
        Schema::table('actividades', function (Blueprint $table) {
            $table->dropForeign(['scheduled_activity_id']);
            $table->dropForeign(['evaluated_by']);
            $table->dropColumn(['scheduled_activity_id', 'evaluated_by', 'pedagogical_rating', 'pedagogical_observations', 'period_reference']);
        });
        Schema::dropIfExists('scheduled_activities');
    }
};
