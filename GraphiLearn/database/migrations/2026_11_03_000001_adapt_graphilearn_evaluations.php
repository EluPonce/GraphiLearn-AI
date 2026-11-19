<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $this->preflight();

        Schema::create('evaluaciones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_curso')->constrained('courses')->cascadeOnDelete();
            $table->unsignedSmallInteger('trimestre');
            $table->unsignedTinyInteger('nivel');
            $table->decimal('tamano_figura_mm', 7, 2);
            $table->date('fecha');
            $table->timestamps();
            $table->unique(['id_curso', 'trimestre'], 'evaluaciones_curso_trimestre_unique');
        });

        Schema::rename('actividades', 'fotos_ejercicio');
        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE fotos_ejercicio DROP CONSTRAINT IF EXISTS actividades_estado_check');
            DB::statement('ALTER TABLE fotos_ejercicio DROP CONSTRAINT IF EXISTS fotos_ejercicio_estado_check');
        }
        $this->renamePostgresObjects('fotos_ejercicio', 'actividades', 'fotos_ejercicio');
        Schema::table('fotos_ejercicio', function (Blueprint $table) {
            $table->foreignId('id_evaluacion')->nullable()->after('id')->constrained('evaluaciones')->cascadeOnDelete();
            $table->string('ruta_imagen')->nullable();
            $table->string('legacy_estado', 50)->nullable();
            $table->unsignedBigInteger('legacy_imagen_id')->nullable();
            $table->string('legacy_imagen_formato', 10)->nullable();
            $table->timestamp('legacy_imagen_fecha_carga')->nullable();
            $table->timestamp('legacy_imagen_created_at')->nullable();
            $table->timestamp('legacy_imagen_updated_at')->nullable();
            $table->timestamp('valorado_en')->nullable();
        });

        DB::table('fotos_ejercicio')->update(['legacy_estado' => DB::raw('estado')]);

        if (Schema::hasTable('imagenes')) {
            DB::table('imagenes')->orderBy('id')->chunk(500, function ($images): void {
                foreach ($images as $image) {
                    DB::table('fotos_ejercicio')->where('id', $image->id_actividad)->update([
                        'ruta_imagen' => $image->ruta,
                        'legacy_imagen_id' => $image->id,
                        'legacy_imagen_formato' => $image->formato,
                        'legacy_imagen_fecha_carga' => $image->fecha_carga,
                        'legacy_imagen_created_at' => $image->created_at,
                        'legacy_imagen_updated_at' => $image->updated_at,
                    ]);
                }
            });
        }

        Schema::table('fotos_ejercicio', function (Blueprint $table) {
            $table->renameColumn('pedagogical_rating', 'valoracion');
            $table->renameColumn('evaluated_by', 'valorado_por');
        });
        if (DB::getDriverName() === 'pgsql') {
            $this->renamePostgresConstraint('fotos_ejercicio', 'fotos_ejercicio_evaluated_by_foreign', 'fotos_ejercicio_valorado_por_foreign');
            $this->renamePostgresConstraint('fotos_ejercicio', 'fotos_ejercicio_pedagogical_rating_check', 'fotos_ejercicio_valoracion_check');
            $this->renamePostgresConstraint('fotos_ejercicio', 'scheduled_student_exercise_unique', 'fotos_ejercicio_scheduled_student_exercise_unique');
        }

        DB::table('fotos_ejercicio')->whereNotNull('valoracion')->update(['valorado_en' => DB::raw('updated_at')]);
        DB::table('fotos_ejercicio')->whereNotNull('valoracion')->update(['estado' => 'valorado']);
        DB::table('fotos_ejercicio')->whereNull('valoracion')->whereNotNull('ruta_imagen')->update(['estado' => 'foto_lista']);
        DB::table('fotos_ejercicio')->whereNull('valoracion')->whereNull('ruta_imagen')->update(['estado' => 'sin_foto']);

        $migratedRowsByState = DB::table('fotos_ejercicio')
            ->select('estado')->selectRaw('COUNT(*) AS total')->groupBy('estado')->pluck('total', 'estado')->all();
        logger()->info('Fase 1: filas históricas migradas a estados de foto', ['filas_por_estado' => $migratedRowsByState]);

        Schema::table('fotos_ejercicio', function (Blueprint $table) {
            $table->string('estado')->default('sin_foto')->change();
            $table->unique(['id_evaluacion', 'id_estudiante', 'id_ejercicio'], 'foto_evaluacion_estudiante_ejercicio_unique');
        });
        if (DB::getDriverName() === 'pgsql') {
            DB::statement("ALTER TABLE fotos_ejercicio ADD CONSTRAINT fotos_ejercicio_estado_check CHECK (estado IN ('sin_foto', 'foto_lista', 'valorado'))");
        }

        Schema::create('observaciones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_estudiante')->constrained('students')->cascadeOnDelete();
            $table->foreignId('id_evaluacion')->nullable()->constrained('evaluaciones')->nullOnDelete();
            $table->text('texto');
            $table->foreignId('autor')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('legacy_foto_id')->nullable()->constrained('fotos_ejercicio')->nullOnDelete();
            $table->timestamps();
            $table->index(['id_estudiante', 'id_evaluacion']);
        });

        if (Schema::hasColumn('fotos_ejercicio', 'pedagogical_observations')) {
            DB::table('fotos_ejercicio')
                ->whereNotNull('pedagogical_observations')
                ->where('pedagogical_observations', '<>', '')
                ->orderBy('id')->chunk(500, function ($photos): void {
                    foreach ($photos as $photo) {
                        DB::table('observaciones')->insert([
                            'id_estudiante' => $photo->id_estudiante,
                            'id_evaluacion' => null,
                            'texto' => $photo->pedagogical_observations,
                            'autor' => $photo->valorado_por,
                            'legacy_foto_id' => $photo->id,
                            'created_at' => $photo->updated_at ?? now(),
                            'updated_at' => $photo->updated_at ?? now(),
                        ]);
                    }
                });
            Schema::table('fotos_ejercicio', fn (Blueprint $table) => $table->dropColumn('pedagogical_observations'));
        }

        Schema::table('analysis_results', function (Blueprint $table) {
            if (Schema::hasColumn('analysis_results', 'imagen_id')) {
                $table->dropForeign(['imagen_id']);
                $table->dropColumn('imagen_id');
            }
        });

        if (Schema::hasTable('imagenes')) {
            Schema::drop('imagenes');
        }

        Schema::rename('analysis_results', 'analisis');
        $this->renamePostgresObjects('analisis', 'analysis_results', 'analisis');
        Schema::table('analisis', function (Blueprint $table) {
            $table->renameColumn('actividad_id', 'id_foto');
            $table->renameColumn('model_version_id', 'id_modelo');
            $table->json('indicadores')->nullable();
            $table->json('caracteristicas')->nullable();
            $table->json('rutas_etapas')->nullable();
        });
        if (DB::getDriverName() === 'pgsql') {
            $this->renamePostgresConstraint('analisis', 'analisis_actividad_id_unique', 'analisis_id_foto_unique');
            $this->renamePostgresConstraint('analisis', 'analisis_actividad_id_foreign', 'analisis_id_foto_foreign');
            $this->renamePostgresConstraint('analisis', 'analisis_model_version_id_foreign', 'analisis_id_modelo_foreign');
        }

        DB::table('analisis')->orderBy('id')->chunk(500, function ($analyses): void {
            foreach ($analyses as $analysis) {
                DB::table('analisis')->where('id', $analysis->id)->update([
                    'indicadores' => json_encode([
                        'desviacion' => $analysis->desviacion,
                        'rugosidad' => $analysis->rugosidad,
                        'continuidad' => $analysis->continuidad,
                        'regularidad' => $analysis->regularidad,
                    ], JSON_THROW_ON_ERROR),
                    'caracteristicas' => json_encode([
                        'longitud_trazo' => $analysis->longitud_trazo,
                        'alto' => $analysis->alto,
                        'ancho' => $analysis->ancho,
                        'proporcion' => $analysis->proporcion,
                        'inclinacion' => $analysis->inclinacion,
                        'curvatura' => $analysis->curvatura,
                        'separacion_componentes' => $analysis->separacion_componentes,
                        'posicion_normalizada' => $analysis->posicion_normalizada,
                    ], JSON_THROW_ON_ERROR),
                ]);
            }
        });
    }

    public function down(): void
    {
        if (DB::table('evaluaciones')->exists()
            || DB::table('observaciones')->whereNotNull('id_evaluacion')->exists()
            || DB::table('observaciones')->whereNull('legacy_foto_id')->exists()) {
            throw new RuntimeException('No se revierte la migración porque hay evaluaciones u observaciones nuevas sin equivalente en el esquema anterior. Exporte esos datos antes de continuar.');
        }

        Schema::create('imagenes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_actividad')->unique()->constrained('fotos_ejercicio')->cascadeOnDelete();
            $table->string('ruta');
            $table->string('formato', 10);
            $table->timestamp('fecha_carga');
            $table->timestamps();
        });

        DB::table('fotos_ejercicio')->whereNotNull('legacy_imagen_id')->orderBy('id')->each(function ($photo): void {
            DB::table('imagenes')->insert([
                'id' => $photo->legacy_imagen_id,
                'id_actividad' => $photo->id,
                'ruta' => $photo->ruta_imagen,
                'formato' => $photo->legacy_imagen_formato,
                'fecha_carga' => $photo->legacy_imagen_fecha_carga,
                'created_at' => $photo->legacy_imagen_created_at ?? $photo->created_at ?? now(),
                'updated_at' => $photo->legacy_imagen_updated_at ?? $photo->updated_at ?? now(),
            ]);
        });
        if (DB::getDriverName() === 'pgsql') {
            DB::statement("SELECT setval(pg_get_serial_sequence('imagenes', 'id'), COALESCE(MAX(id), 1), MAX(id) IS NOT NULL) FROM imagenes");
        }

        Schema::table('analisis', function (Blueprint $table) {
            $table->foreignId('imagen_id')->nullable()->constrained('imagenes')->nullOnDelete();
        });
        DB::table('analisis')->orderBy('id')->each(function ($analysis): void {
            $photo = DB::table('fotos_ejercicio')->where('id', $analysis->id_foto)->first();
            DB::table('analisis')->where('id', $analysis->id)->update(['imagen_id' => $photo?->legacy_imagen_id]);
        });

        Schema::rename('analisis', 'analysis_results');
        $this->renamePostgresObjects('analysis_results', 'analisis', 'analysis_results');
        if (DB::getDriverName() === 'pgsql') {
            $this->renamePostgresConstraint('analysis_results', 'analysis_results_id_foto_unique', 'analysis_results_actividad_id_unique');
            $this->renamePostgresConstraint('analysis_results', 'analysis_results_id_foto_foreign', 'analysis_results_actividad_id_foreign');
            $this->renamePostgresConstraint('analysis_results', 'analysis_results_id_modelo_foreign', 'analysis_results_model_version_id_foreign');
        }
        Schema::table('analysis_results', function (Blueprint $table) {
            $table->renameColumn('id_foto', 'actividad_id');
            $table->renameColumn('id_modelo', 'model_version_id');
            $table->dropColumn(['indicadores', 'caracteristicas', 'rutas_etapas']);
        });
        Schema::table('fotos_ejercicio', function (Blueprint $table) {
            $table->text('pedagogical_observations')->nullable();
        });
        DB::table('observaciones')->whereNotNull('legacy_foto_id')->orderBy('id')->each(function ($observation): void {
            DB::table('fotos_ejercicio')->where('id', $observation->legacy_foto_id)->update([
                'pedagogical_observations' => $observation->texto,
            ]);
        });
        Schema::dropIfExists('observaciones');
        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE fotos_ejercicio DROP CONSTRAINT IF EXISTS fotos_ejercicio_estado_check');
        }
        DB::table('fotos_ejercicio')->whereNotNull('legacy_estado')->update(['estado' => DB::raw('legacy_estado')]);
        DB::table('fotos_ejercicio')->whereNull('legacy_estado')->where('estado', 'valorado')->update(['estado' => 'procesado']);
        DB::table('fotos_ejercicio')->whereNull('legacy_estado')->whereIn('estado', ['sin_foto', 'foto_lista'])->update(['estado' => 'pendiente']);
        Schema::rename('fotos_ejercicio', 'actividades');
        $this->renamePostgresObjects('actividades', 'fotos_ejercicio', 'actividades');
        Schema::table('actividades', function (Blueprint $table) {
            $table->renameColumn('valoracion', 'pedagogical_rating');
            $table->renameColumn('valorado_por', 'evaluated_by');
            $table->string('estado')->default('pendiente')->change();
            $table->dropUnique('foto_evaluacion_estudiante_ejercicio_unique');
            $table->dropForeign(['id_evaluacion']);
            $table->dropColumn(['id_evaluacion', 'ruta_imagen', 'legacy_estado', 'legacy_imagen_id', 'legacy_imagen_formato', 'legacy_imagen_fecha_carga', 'legacy_imagen_created_at', 'legacy_imagen_updated_at', 'valorado_en']);
        });
        if (DB::getDriverName() === 'pgsql') {
            $this->renamePostgresConstraint('actividades', 'actividades_valorado_por_foreign', 'actividades_evaluated_by_foreign');
            $this->renamePostgresConstraint('actividades', 'actividades_valoracion_check', 'actividades_pedagogical_rating_check');
            $this->renamePostgresConstraint('actividades', 'actividades_scheduled_student_exercise_unique', 'scheduled_student_exercise_unique');
            DB::statement("ALTER TABLE actividades ADD CONSTRAINT actividades_estado_check CHECK (estado IN ('pendiente', 'procesando', 'procesado', 'error'))");
        }
        Schema::dropIfExists('evaluaciones');
    }

    private function preflight(): void
    {
        $issues = [];
        $requiredTypes = ['linea', 'circulo', 'zigzag', 'espiral'];
        if (Schema::hasTable('exercises') && DB::table('courses')->exists()) {
            foreach ($requiredTypes as $type) {
                $matches = DB::table('exercises')->where('tipo_trazo', $type)->where('activo', true)->count();
                if ($matches > 1) {
                    $issues[] = "tipo de ejercicio activo duplicado '{$type}' ({$matches})";
                } elseif ($matches === 0) {
                    $issues[] = "falta el ejercicio activo requerido '{$type}'";
                }
            }
        }

        $duplicateRuns = DB::table('actividades')->select('scheduled_activity_id', 'id_estudiante', 'id_ejercicio')
            ->whereNotNull('scheduled_activity_id')->groupBy('scheduled_activity_id', 'id_estudiante', 'id_ejercicio')
            ->havingRaw('COUNT(*) > 1')->count();
        if ($duplicateRuns > 0) {
            $issues[] = "{$duplicateRuns} grupos de ejecuciones duplicadas por programación, estudiante y ejercicio";
        }

        $missingExercise = DB::table('actividades as a')->leftJoin('exercises as e', 'e.id', '=', 'a.id_ejercicio')
            ->whereNull('e.id')->count();
        $missingStudent = DB::table('actividades as a')->leftJoin('students as s', 's.id', '=', 'a.id_estudiante')
            ->whereNull('s.id')->count();
        if ($missingExercise > 0) $issues[] = "{$missingExercise} ejecuciones sin ejercicio asociado";
        if ($missingStudent > 0) $issues[] = "{$missingStudent} ejecuciones sin estudiante asociado";

        if (Schema::hasTable('imagenes')) {
            $orphanImages = DB::table('imagenes as i')->leftJoin('actividades as a', 'a.id', '=', 'i.id_actividad')->whereNull('a.id')->count();
            $emptyImagePaths = DB::table('imagenes')->whereNull('ruta')->orWhere('ruta', '')->count();
            if ($orphanImages > 0) $issues[] = "{$orphanImages} fotos sin ejecución asociada";
            if ($emptyImagePaths > 0) $issues[] = "{$emptyImagePaths} fotos sin ruta de archivo";
        }

        if (Schema::hasTable('scheduled_activities')) {
            $courseMismatch = DB::table('actividades as a')->join('scheduled_activities as sa', 'sa.id', '=', 'a.scheduled_activity_id')
                ->join('students as s', 's.id', '=', 'a.id_estudiante')->whereColumn('sa.course_id', '<>', 's.id_curso')->count();
            if ($courseMismatch > 0) $issues[] = "{$courseMismatch} ejecuciones cuyo curso no coincide con la programación";
        }

        if ($issues !== []) {
            throw new RuntimeException("Migración detenida antes de modificar datos. Corrija estas inconsistencias y vuelva a intentarlo: ".implode('; ', $issues).'.');
        }
    }

    private function renamePostgresObjects(string $table, string $oldPrefix, string $newPrefix): void
    {
        if (DB::getDriverName() !== 'pgsql') return;

        $constraints = DB::select(
            'SELECT conname FROM pg_constraint WHERE conrelid = to_regclass(?) ORDER BY conname',
            [$table],
        );
        foreach ($constraints as $constraint) {
            $oldName = $constraint->conname;
            if (! str_starts_with($oldName, $oldPrefix.'_')) continue;
            $newName = $newPrefix.substr($oldName, strlen($oldPrefix));
            $this->renamePostgresConstraint($table, $oldName, $newName);
        }

        $indexes = DB::select('SELECT indexname FROM pg_indexes WHERE schemaname = current_schema() AND tablename = ?', [$table]);
        $schema = DB::selectOne('SELECT current_schema() AS schema_name')->schema_name ?? 'public';
        foreach ($indexes as $index) {
            $oldName = $index->indexname;
            if (! str_starts_with($oldName, $oldPrefix.'_')) continue;
            $newName = $newPrefix.substr($oldName, strlen($oldPrefix));
            if (DB::selectOne('SELECT to_regclass(?) AS object_name', [$schema.'.'.$newName])?->object_name) continue;
            DB::statement('ALTER INDEX '.$this->quotePgIdentifier($schema).'.'.$this->quotePgIdentifier($oldName).' RENAME TO '.$this->quotePgIdentifier($newName));
        }

        $sequence = DB::selectOne("SELECT pg_get_serial_sequence(?, 'id') AS sequence_name", [$table])?->sequence_name;
        if ($sequence && str_contains($sequence, $oldPrefix.'_')) {
            $sequenceParts = explode('.', str_replace('"', '', $sequence));
            $sequenceName = end($sequenceParts);
            $newName = $newPrefix.substr($sequenceName, strlen($oldPrefix));
            $qualified = count($sequenceParts) > 1 ? [reset($sequenceParts), $sequenceName] : [$schema, $sequenceName];
            DB::statement('ALTER SEQUENCE '.$this->quotePgIdentifier($qualified[0]).'.'.$this->quotePgIdentifier($sequenceName).' RENAME TO '.$this->quotePgIdentifier($newName));
        }
    }

    private function renamePostgresConstraint(string $table, string $oldName, string $newName): void
    {
        if (DB::getDriverName() !== 'pgsql' || $oldName === $newName) return;
        $exists = DB::selectOne('SELECT 1 FROM pg_constraint WHERE conrelid = to_regclass(?) AND conname = ?', [$table, $oldName]);
        if (! $exists) return;
        DB::statement('ALTER TABLE '.$this->quotePgIdentifier($table).' RENAME CONSTRAINT '.$this->quotePgIdentifier($oldName).' TO '.$this->quotePgIdentifier($newName));
    }

    private function quotePgIdentifier(string $identifier): string
    {
        return '"'.str_replace('"', '""', $identifier).'"';
    }
};
