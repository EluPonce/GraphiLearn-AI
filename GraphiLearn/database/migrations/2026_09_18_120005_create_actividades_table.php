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
        Schema::create('actividades', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_estudiante')
                ->constrained('students')
                ->cascadeOnDelete();
            $table->foreignId('id_ejercicio')
                ->constrained('exercises')
                ->restrictOnDelete(); // Ejercicios con actividades no pueden eliminarse
            $table->date('fecha');
            $table->timestamps();
            $table->softDeletes();

            $table->index('id_estudiante');
            $table->index('id_ejercicio');
            $table->index('fecha');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('actividades');
    }
};
