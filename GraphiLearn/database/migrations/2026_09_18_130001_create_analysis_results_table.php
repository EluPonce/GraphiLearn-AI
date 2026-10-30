<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('analysis_results', function (Blueprint $table) {
            $table->id();
            $table->foreignId('actividad_id')
                ->constrained('actividades')
                ->cascadeOnDelete()
                ->unique();
            $table->foreignId('imagen_id')
                ->nullable()
                ->constrained('imagenes')
                ->nullOnDelete();
            $table->string('tipo_trazo')->nullable();
            // Características geométricas
            $table->float('longitud_trazo')->nullable();
            $table->integer('alto')->nullable();
            $table->integer('ancho')->nullable();
            $table->float('proporcion')->nullable();
            $table->float('inclinacion')->nullable();
            $table->float('curvatura')->nullable();
            $table->float('separacion_componentes')->nullable();
            $table->json('posicion_normalizada')->nullable();
            // Indicadores cuantitativos
            $table->float('desviacion')->nullable();
            $table->float('rugosidad')->nullable();
            $table->float('continuidad')->nullable();
            $table->float('regularidad')->nullable();
            // Clasificación
            $table->string('risk_label')->nullable();
            $table->float('risk_score')->nullable();
            $table->foreignId('model_version_id')
                ->nullable()
                ->constrained('model_versions')
                ->nullOnDelete();
            // Estados de procesamiento y revisión
            $table->enum('estado', ['pendiente', 'procesando', 'procesado', 'error'])->default('pendiente');
            $table->enum('estado_revision', ['pendiente', 'aprobada', 'rechazada'])->default('pendiente');
            $table->text('error_message')->nullable();
            $table->json('detalles_computacionales')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('analysis_results');
    }
};
?>
