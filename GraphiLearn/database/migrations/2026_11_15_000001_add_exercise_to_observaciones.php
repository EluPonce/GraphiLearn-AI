<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Observación por celda: cada observación nueva queda asociada al Ejercicio valorado.
 * Las filas anteriores conservan id_ejercicio = NULL (observación general del trimestre).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('observaciones', function (Blueprint $table) {
            $table->foreignId('id_ejercicio')->nullable()->after('id_evaluacion')->constrained('exercises')->nullOnDelete();
            $table->index(['id_estudiante', 'id_evaluacion', 'id_ejercicio']);
        });
    }

    public function down(): void
    {
        Schema::table('observaciones', function (Blueprint $table) {
            $table->dropIndex(['id_estudiante', 'id_evaluacion', 'id_ejercicio']);
            $table->dropConstrainedForeignId('id_ejercicio');
        });
    }
};
