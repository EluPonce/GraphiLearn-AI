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
        Schema::create('imagenes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_actividad')
                ->unique() // Una actividad = una sola imagen
                ->constrained('actividades')
                ->cascadeOnDelete();
            $table->string('ruta');           // Ruta relativa en storage/app/private
            $table->string('formato', 10);    // jpg, jpeg, png
            $table->timestamp('fecha_carga');
            $table->timestamps();

            $table->index('id_actividad');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('imagenes');
    }
};
