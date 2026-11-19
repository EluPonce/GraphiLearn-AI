<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE users DROP CONSTRAINT IF EXISTS users_rol_check');
        }

        Schema::table('users', function (Blueprint $table) {
            $table->string('rol', 50)->default('docente')->change();
        });
    }

    public function down(): void
    {
        DB::table('users')->where('rol', 'direccion')->update(['rol' => 'docente']);

        if (DB::getDriverName() === 'pgsql') {
            DB::statement("ALTER TABLE users ADD CONSTRAINT users_rol_check CHECK (rol IN ('administrador', 'docente'))");
        } elseif (DB::getDriverName() === 'sqlite') {
            // SQLite's schema rebuild via change() restores the original enum-like check.
        }

        Schema::table('users', function (Blueprint $table) {
            $table->enum('rol', ['administrador', 'docente'])->default('docente')->change();
        });
    }
};
