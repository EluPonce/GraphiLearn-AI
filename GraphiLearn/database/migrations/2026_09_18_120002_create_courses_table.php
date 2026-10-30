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
        Schema::create('courses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('institution_id')
                ->constrained('institutions')
                ->cascadeOnDelete();
            $table->foreignId('id_docente')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();
            $table->string('nombre');
            $table->string('nivel');   // ej: "Inicial 1", "Inicial 2"
            $table->string('gestion'); // ej: "2026"
            $table->timestamps();

            $table->index('institution_id');
            $table->index('id_docente');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('courses');
    }
};
