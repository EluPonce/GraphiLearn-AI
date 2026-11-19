# 04 · Base de datos

Fuente: base PostgreSQL 17.7 de desarrollo (`graphilearn`, 22 tablas), volcada el 2026-11-14 con:

```
pg_dump --schema-only --no-owner --no-privileges   (credenciales leídas de GraphiLearn/.env, no se incluyen)
```

El volcado completo, sin comentarios ni líneas `SET`, está pegado en el **Anexo A**. Las tablas de la sección 2 se generaron automáticamente a partir de ese volcado.

## 1. Filas actuales por tabla (base de desarrollo)

```
          ?column?           | count
-----------------------------+-------
 users                       |     8
 institutions                |     2
 courses                     |     7
 students                    |    20
 exercises                   |     4
 evaluaciones                |     0
 fotos_ejercicio             |     6
 analisis                    |     3
 observaciones               |     5
 model_versions              |     0
 scheduled_activities        |     6
 activity_evaluation_history |     8
 personal_access_tokens      |     7
 migrations                  |    18
```

Las 6 filas de `fotos_ejercicio`, los 3 `analisis` y las 5 `observaciones` vienen del diseño anterior (migradas por `adapt_graphilearn_evaluations`). **No hay ninguna fila en `evaluaciones`**, así que el nuevo flujo todavía no se usó con la base de desarrollo.

Catálogo de ejercicios:

```
 id |        nombre        | tipo_trazo | activo
----+----------------------+------------+--------
  1 | Trazo de Línea Recta | linea      | t
  2 | Trazo de Círculo     | circulo    | t
  3 | Trazo de Espiral     | espiral    | t
  4 | Trazo de Zigzag      | zigzag     | t
```

## 2. Tablas: columnas, claves, restricciones e índices

Columna "FK": tabla.columna referenciada y la acción `ON DELETE`. Cuando no se indica acción, es `NO ACTION`.

### `activity_evaluation_history`

| Columna | Tipo | Nulo | Por defecto | PK | FK |
|---|---|---|---|---|---|
| id | bigint | No | `nextval('public.activity_evaluation_history_id_seq'::regclass)` | PK |  |
| actividad_id | bigint | No | — |  | → fotos_ejercicio.id (ON DELETE CASCADE) |
| changed_by | bigint | No | — |  | → users.id (ON DELETE RESTRICT) |
| pedagogical_rating | character varying(255) | Sí | — |  |  |
| pedagogical_observations | text | Sí | — |  |  |
| created_at | timestamp(0) without time zone | No | `CURRENT_TIMESTAMP` |  |  |

Restricciones e índices:

- PRIMARY KEY `activity_evaluation_history_pkey` (id)
- CHECK `activity_evaluation_history_pedagogical_rating_check`: `((pedagogical_rating)::text = ANY ((ARRAY['S'::character varying, 'ED'::character varying, 'NA'::character varying])::text[]))`
- INDEX `activity_evaluation_history_actividad_id_created_at_index` (actividad_id, created_at)

### `analisis`

| Columna | Tipo | Nulo | Por defecto | PK | FK |
|---|---|---|---|---|---|
| id | bigint | No | `nextval('public.analisis_id_seq'::regclass)` | PK |  |
| id_foto | bigint | No | — |  | → fotos_ejercicio.id (ON DELETE CASCADE) |
| tipo_trazo | character varying(255) | Sí | — |  |  |
| longitud_trazo | double precision | Sí | — |  |  |
| alto | integer | Sí | — |  |  |
| ancho | integer | Sí | — |  |  |
| proporcion | double precision | Sí | — |  |  |
| inclinacion | double precision | Sí | — |  |  |
| curvatura | double precision | Sí | — |  |  |
| separacion_componentes | double precision | Sí | — |  |  |
| posicion_normalizada | json | Sí | — |  |  |
| desviacion | double precision | Sí | — |  |  |
| rugosidad | double precision | Sí | — |  |  |
| continuidad | double precision | Sí | — |  |  |
| regularidad | double precision | Sí | — |  |  |
| sugerencia | character varying(255) | Sí | — |  |  |
| id_modelo | bigint | Sí | — |  | → model_versions.id (ON DELETE SET NULL) |
| estado | character varying(255) | No | `'pendiente'::character varying` |  |  |
| estado_revision | character varying(255) | No | `'pendiente'::character varying` |  |  |
| error_message | text | Sí | — |  |  |
| detalles_computacionales | json | Sí | — |  |  |
| created_at | timestamp(0) without time zone | Sí | — |  |  |
| updated_at | timestamp(0) without time zone | Sí | — |  |  |
| deleted_at | timestamp(0) without time zone | Sí | — |  |  |
| indicadores | json | Sí | — |  |  |
| caracteristicas | json | Sí | — |  |  |
| rutas_etapas | json | Sí | — |  |  |

Restricciones e índices:

- PRIMARY KEY `analisis_pkey` (id)
- CHECK `analisis_estado_check`: `((estado)::text = ANY ((ARRAY['pendiente'::character varying, 'procesando'::character varying, 'procesado'::character varying, 'error'::character varying])::text[]))`
- CHECK `analisis_estado_revision_check`: `((estado_revision)::text = ANY ((ARRAY['pendiente'::character varying, 'aprobada'::character varying, 'rechazada'::character varying])::text[]))`

### `cache`

| Columna | Tipo | Nulo | Por defecto | PK | FK |
|---|---|---|---|---|---|
| key | character varying(255) | No | — | PK |  |
| value | text | No | — |  |  |
| expiration | integer | No | — |  |  |

Restricciones e índices:

- PRIMARY KEY `cache_pkey` (key)
- INDEX `cache_expiration_index` (expiration)

### `cache_locks`

| Columna | Tipo | Nulo | Por defecto | PK | FK |
|---|---|---|---|---|---|
| key | character varying(255) | No | — | PK |  |
| owner | character varying(255) | No | — |  |  |
| expiration | integer | No | — |  |  |

Restricciones e índices:

- PRIMARY KEY `cache_locks_pkey` (key)
- INDEX `cache_locks_expiration_index` (expiration)

### `courses`

| Columna | Tipo | Nulo | Por defecto | PK | FK |
|---|---|---|---|---|---|
| id | bigint | No | `nextval('public.courses_id_seq'::regclass)` | PK |  |
| institution_id | bigint | No | — |  | → institutions.id (ON DELETE CASCADE) |
| id_docente | bigint | Sí | — |  | → users.id (ON DELETE SET NULL) |
| nombre | character varying(255) | No | — |  |  |
| nivel | character varying(255) | No | — |  |  |
| gestion | character varying(255) | No | — |  |  |
| created_at | timestamp(0) without time zone | Sí | — |  |  |
| updated_at | timestamp(0) without time zone | Sí | — |  |  |
| active | boolean | No | `true` |  |  |

Restricciones e índices:

- PRIMARY KEY `courses_pkey` (id)
- INDEX `courses_id_docente_index` (id_docente)
- INDEX `courses_institution_id_index` (institution_id)

### `evaluaciones`

| Columna | Tipo | Nulo | Por defecto | PK | FK |
|---|---|---|---|---|---|
| id | bigint | No | `nextval('public.evaluaciones_id_seq'::regclass)` | PK |  |
| id_curso | bigint | No | — |  | → courses.id (ON DELETE CASCADE) |
| trimestre | smallint | No | — |  |  |
| nivel | smallint | No | — |  |  |
| tamano_figura_mm | numeric(7,2) | No | — |  |  |
| fecha | date | No | — |  |  |
| created_at | timestamp(0) without time zone | Sí | — |  |  |
| updated_at | timestamp(0) without time zone | Sí | — |  |  |

Restricciones e índices:

- PRIMARY KEY `evaluaciones_pkey` (id)
- UNIQUE `evaluaciones_curso_trimestre_unique` (id_curso, trimestre)

### `exercises`

| Columna | Tipo | Nulo | Por defecto | PK | FK |
|---|---|---|---|---|---|
| id | bigint | No | `nextval('public.exercises_id_seq'::regclass)` | PK |  |
| nombre | character varying(255) | No | — |  |  |
| tipo_trazo | character varying(255) | No | — |  |  |
| descripcion | text | Sí | — |  |  |
| activo | boolean | No | `true` |  |  |
| created_at | timestamp(0) without time zone | Sí | — |  |  |
| updated_at | timestamp(0) without time zone | Sí | — |  |  |

Restricciones e índices:

- PRIMARY KEY `exercises_pkey` (id)
- CHECK `exercises_tipo_trazo_check`: `((tipo_trazo)::text = ANY ((ARRAY['linea'::character varying, 'circulo'::character varying, 'espiral'::character varying, 'zigzag'::character varying])::text[]))`
- INDEX `exercises_tipo_trazo_index` (tipo_trazo)

### `failed_jobs`

| Columna | Tipo | Nulo | Por defecto | PK | FK |
|---|---|---|---|---|---|
| id | bigint | No | `nextval('public.failed_jobs_id_seq'::regclass)` | PK |  |
| uuid | character varying(255) | No | — |  |  |
| connection | text | No | — |  |  |
| queue | text | No | — |  |  |
| payload | text | No | — |  |  |
| exception | text | No | — |  |  |
| failed_at | timestamp(0) without time zone | No | `CURRENT_TIMESTAMP` |  |  |

Restricciones e índices:

- PRIMARY KEY `failed_jobs_pkey` (id)
- UNIQUE `failed_jobs_uuid_unique` (uuid)

### `fotos_ejercicio`

| Columna | Tipo | Nulo | Por defecto | PK | FK |
|---|---|---|---|---|---|
| id | bigint | No | `nextval('public.fotos_ejercicio_id_seq'::regclass)` | PK |  |
| id_estudiante | bigint | No | — |  | → students.id (ON DELETE CASCADE) |
| id_ejercicio | bigint | No | — |  | → exercises.id (ON DELETE RESTRICT) |
| fecha | date | No | — |  |  |
| created_at | timestamp(0) without time zone | Sí | — |  |  |
| updated_at | timestamp(0) without time zone | Sí | — |  |  |
| deleted_at | timestamp(0) without time zone | Sí | — |  |  |
| estado | character varying(255) | No | `'sin_foto'::character varying` |  |  |
| fecha_procesado | timestamp(0) without time zone | Sí | — |  |  |
| scheduled_activity_id | bigint | Sí | — |  | → scheduled_activities.id (ON DELETE SET NULL) |
| valorado_por | bigint | Sí | — |  | → users.id (ON DELETE SET NULL) |
| valoracion | character varying(255) | Sí | — |  |  |
| period_reference | character varying(100) | Sí | — |  |  |
| id_evaluacion | bigint | Sí | — |  | → evaluaciones.id (ON DELETE CASCADE) |
| ruta_imagen | character varying(255) | Sí | — |  |  |
| legacy_estado | character varying(50) | Sí | — |  |  |
| legacy_imagen_id | bigint | Sí | — |  |  |
| legacy_imagen_formato | character varying(10) | Sí | — |  |  |
| legacy_imagen_fecha_carga | timestamp(0) without time zone | Sí | — |  |  |
| legacy_imagen_created_at | timestamp(0) without time zone | Sí | — |  |  |
| legacy_imagen_updated_at | timestamp(0) without time zone | Sí | — |  |  |
| valorado_en | timestamp(0) without time zone | Sí | — |  |  |

Restricciones e índices:

- PRIMARY KEY `fotos_ejercicio_pkey` (id)
- UNIQUE `foto_evaluacion_estudiante_ejercicio_unique` (id_evaluacion, id_estudiante, id_ejercicio)
- UNIQUE `fotos_ejercicio_scheduled_student_exercise_unique` (scheduled_activity_id, id_estudiante, id_ejercicio)
- CHECK `fotos_ejercicio_estado_check`: `((estado)::text = ANY ((ARRAY['sin_foto'::character varying, 'foto_lista'::character varying, 'valorado'::character varying])::text[]))`
- CHECK `fotos_ejercicio_valoracion_check`: `((valoracion)::text = ANY ((ARRAY['S'::character varying, 'ED'::character varying, 'NA'::character varying])::text[]))`
- INDEX `fotos_ejercicio_fecha_index` (fecha)
- INDEX `fotos_ejercicio_id_ejercicio_index` (id_ejercicio)
- INDEX `fotos_ejercicio_id_estudiante_index` (id_estudiante)

### `institutions`

| Columna | Tipo | Nulo | Por defecto | PK | FK |
|---|---|---|---|---|---|
| id | bigint | No | `nextval('public.institutions_id_seq'::regclass)` | PK |  |
| nombre | character varying(255) | No | — |  |  |
| direccion | character varying(255) | Sí | — |  |  |
| created_at | timestamp(0) without time zone | Sí | — |  |  |
| updated_at | timestamp(0) without time zone | Sí | — |  |  |

Restricciones e índices:

- PRIMARY KEY `institutions_pkey` (id)

### `job_batches`

| Columna | Tipo | Nulo | Por defecto | PK | FK |
|---|---|---|---|---|---|
| id | character varying(255) | No | — | PK |  |
| name | character varying(255) | No | — |  |  |
| total_jobs | integer | No | — |  |  |
| pending_jobs | integer | No | — |  |  |
| failed_jobs | integer | No | — |  |  |
| failed_job_ids | text | No | — |  |  |
| options | text | Sí | — |  |  |
| cancelled_at | integer | Sí | — |  |  |
| created_at | integer | No | — |  |  |
| finished_at | integer | Sí | — |  |  |

Restricciones e índices:

- PRIMARY KEY `job_batches_pkey` (id)

### `jobs`

| Columna | Tipo | Nulo | Por defecto | PK | FK |
|---|---|---|---|---|---|
| id | bigint | No | `nextval('public.jobs_id_seq'::regclass)` | PK |  |
| queue | character varying(255) | No | — |  |  |
| payload | text | No | — |  |  |
| attempts | smallint | No | — |  |  |
| reserved_at | integer | Sí | — |  |  |
| available_at | integer | No | — |  |  |
| created_at | integer | No | — |  |  |

Restricciones e índices:

- PRIMARY KEY `jobs_pkey` (id)
- INDEX `jobs_queue_index` (queue)

### `migrations`

| Columna | Tipo | Nulo | Por defecto | PK | FK |
|---|---|---|---|---|---|
| id | integer | No | `nextval('public.migrations_id_seq'::regclass)` | PK |  |
| migration | character varying(255) | No | — |  |  |
| batch | integer | No | — |  |  |

Restricciones e índices:

- PRIMARY KEY `migrations_pkey` (id)

### `model_versions`

| Columna | Tipo | Nulo | Por defecto | PK | FK |
|---|---|---|---|---|---|
| id | bigint | No | `nextval('public.model_versions_id_seq'::regclass)` | PK |  |
| name | character varying(255) | No | — |  |  |
| version | character varying(255) | Sí | — |  |  |
| algorithm | character varying(255) | Sí | — |  |  |
| description | character varying(255) | Sí | — |  |  |
| file_path | character varying(255) | No | — |  |  |
| metrics | json | Sí | — |  |  |
| active | boolean | No | `false` |  |  |
| created_by | bigint | Sí | — |  | → users.id (ON DELETE SET NULL) |
| created_at | timestamp(0) without time zone | Sí | — |  |  |
| updated_at | timestamp(0) without time zone | Sí | — |  |  |

Restricciones e índices:

- PRIMARY KEY `model_versions_pkey` (id)

### `observaciones`

| Columna | Tipo | Nulo | Por defecto | PK | FK |
|---|---|---|---|---|---|
| id | bigint | No | `nextval('public.observaciones_id_seq'::regclass)` | PK |  |
| id_estudiante | bigint | No | — |  | → students.id (ON DELETE CASCADE) |
| id_evaluacion | bigint | Sí | — |  | → evaluaciones.id (ON DELETE SET NULL) |
| texto | text | No | — |  |  |
| autor | bigint | Sí | — |  | → users.id (ON DELETE SET NULL) |
| legacy_foto_id | bigint | Sí | — |  | → fotos_ejercicio.id (ON DELETE SET NULL) |
| created_at | timestamp(0) without time zone | Sí | — |  |  |
| updated_at | timestamp(0) without time zone | Sí | — |  |  |

Restricciones e índices:

- PRIMARY KEY `observaciones_pkey` (id)
- INDEX `observaciones_id_estudiante_id_evaluacion_index` (id_estudiante, id_evaluacion)

### `password_reset_tokens`

| Columna | Tipo | Nulo | Por defecto | PK | FK |
|---|---|---|---|---|---|
| email | character varying(255) | No | — | PK |  |
| token | character varying(255) | No | — |  |  |
| created_at | timestamp(0) without time zone | Sí | — |  |  |

Restricciones e índices:

- PRIMARY KEY `password_reset_tokens_pkey` (email)

### `personal_access_tokens`

| Columna | Tipo | Nulo | Por defecto | PK | FK |
|---|---|---|---|---|---|
| id | bigint | No | `nextval('public.personal_access_tokens_id_seq'::regclass)` | PK |  |
| tokenable_type | character varying(255) | No | — |  |  |
| tokenable_id | bigint | No | — |  |  |
| name | text | No | — |  |  |
| token | character varying(64) | No | — |  |  |
| abilities | text | Sí | — |  |  |
| last_used_at | timestamp(0) without time zone | Sí | — |  |  |
| expires_at | timestamp(0) without time zone | Sí | — |  |  |
| created_at | timestamp(0) without time zone | Sí | — |  |  |
| updated_at | timestamp(0) without time zone | Sí | — |  |  |

Restricciones e índices:

- PRIMARY KEY `personal_access_tokens_pkey` (id)
- UNIQUE `personal_access_tokens_token_unique` (token)
- INDEX `personal_access_tokens_expires_at_index` (expires_at)
- INDEX `personal_access_tokens_tokenable_type_tokenable_id_index` (tokenable_type, tokenable_id)

### `scheduled_activities`

| Columna | Tipo | Nulo | Por defecto | PK | FK |
|---|---|---|---|---|---|
| id | bigint | No | `nextval('public.scheduled_activities_id_seq'::regclass)` | PK |  |
| course_id | bigint | No | — |  | → courses.id (ON DELETE RESTRICT) |
| exercise_id | bigint | No | — |  | → exercises.id (ON DELETE RESTRICT) |
| created_by | bigint | No | — |  | → users.id (ON DELETE RESTRICT) |
| name | character varying(150) | No | — |  |  |
| instructions | text | Sí | — |  |  |
| period_reference | character varying(100) | Sí | — |  |  |
| scheduled_for | date | Sí | — |  |  |
| active | boolean | No | `true` |  |  |
| created_at | timestamp(0) without time zone | Sí | — |  |  |
| updated_at | timestamp(0) without time zone | Sí | — |  |  |
| deleted_at | timestamp(0) without time zone | Sí | — |  |  |

Restricciones e índices:

- PRIMARY KEY `scheduled_activities_pkey` (id)
- INDEX `scheduled_activities_course_id_active_index` (course_id, active)

### `scheduled_activity_exercises`

| Columna | Tipo | Nulo | Por defecto | PK | FK |
|---|---|---|---|---|---|
| id | bigint | No | `nextval('public.scheduled_activity_exercises_id_seq'::regclass)` | PK |  |
| scheduled_activity_id | bigint | No | — |  | → scheduled_activities.id (ON DELETE CASCADE) |
| exercise_id | bigint | No | — |  | → exercises.id (ON DELETE RESTRICT) |
| position | integer | No | — |  |  |
| created_at | timestamp(0) without time zone | Sí | — |  |  |
| updated_at | timestamp(0) without time zone | Sí | — |  |  |

Restricciones e índices:

- PRIMARY KEY `scheduled_activity_exercises_pkey` (id)
- UNIQUE `scheduled_activity_exercise_unique` (scheduled_activity_id, exercise_id)
- UNIQUE `scheduled_activity_position_unique` (scheduled_activity_id, "position")

### `sessions`

| Columna | Tipo | Nulo | Por defecto | PK | FK |
|---|---|---|---|---|---|
| id | character varying(255) | No | — | PK |  |
| user_id | bigint | Sí | — |  |  |
| ip_address | character varying(45) | Sí | — |  |  |
| user_agent | text | Sí | — |  |  |
| payload | text | No | — |  |  |
| last_activity | integer | No | — |  |  |

Restricciones e índices:

- PRIMARY KEY `sessions_pkey` (id)
- INDEX `sessions_last_activity_index` (last_activity)
- INDEX `sessions_user_id_index` (user_id)

### `students`

| Columna | Tipo | Nulo | Por defecto | PK | FK |
|---|---|---|---|---|---|
| id | bigint | No | `nextval('public.students_id_seq'::regclass)` | PK |  |
| id_curso | bigint | No | — |  | → courses.id (ON DELETE CASCADE) |
| nombre | character varying(255) | No | — |  |  |
| fecha_nacimiento | date | No | — |  |  |
| created_at | timestamp(0) without time zone | Sí | — |  |  |
| updated_at | timestamp(0) without time zone | Sí | — |  |  |
| deleted_at | timestamp(0) without time zone | Sí | — |  |  |

Restricciones e índices:

- PRIMARY KEY `students_pkey` (id)
- INDEX `students_id_curso_index` (id_curso)

### `users`

| Columna | Tipo | Nulo | Por defecto | PK | FK |
|---|---|---|---|---|---|
| id | bigint | No | `nextval('public.users_id_seq'::regclass)` | PK |  |
| institution_id | bigint | Sí | — |  | → institutions.id (ON DELETE SET NULL) |
| nombre | character varying(255) | No | — |  |  |
| correo | character varying(255) | No | — |  |  |
| email_verified_at | timestamp(0) without time zone | Sí | — |  |  |
| password | character varying(255) | No | — |  |  |
| rol | character varying(50) | No | `'docente'::character varying` |  |  |
| remember_token | character varying(100) | Sí | — |  |  |
| created_at | timestamp(0) without time zone | Sí | — |  |  |
| updated_at | timestamp(0) without time zone | Sí | — |  |  |
| active | boolean | No | `true` |  |  |

Restricciones e índices:

- PRIMARY KEY `users_pkey` (id)
- UNIQUE `users_correo_unique` (correo)
- INDEX `users_institution_id_index` (institution_id)
- INDEX `users_rol_index` (rol)

### Observaciones sobre el esquema

- **`analisis.id_foto` no es UNIQUE.** La migración original declaraba `foreignId('actividad_id')->constrained('actividades')->cascadeOnDelete()->unique()`, y la migración de adaptación intenta renombrar `analisis_actividad_id_unique`. Sin embargo, el volcado real no tiene ninguna restricción ni índice único en esa columna. La causa probable es que `->unique()` encadenado después de `constrained()` se aplica a la definición de clave foránea y no a la columna, así que nunca se creó. El código asume una relación 1 a 1 (`hasOne`, `updateOrCreate`).
- `analisis` conserva **dos representaciones** de los mismos datos: columnas planas (`longitud_trazo` … `regularidad`) y JSON (`indicadores`, `caracteristicas`). El flujo nuevo (`EvaluationFlowController@upload`) solo llena los JSON.
- `analisis.deleted_at` existe, pero el modelo `Analisis` no usa `SoftDeletes`. `fotos_ejercicio.deleted_at` existe y el modelo `FotoEjercicio` tampoco usa `SoftDeletes`.
- `fotos_ejercicio.id_evaluacion` admite nulo (las filas migradas del diseño anterior no tienen evaluación). En PostgreSQL, la restricción UNIQUE `(id_evaluacion, id_estudiante, id_ejercicio)` no impide duplicados cuando `id_evaluacion` es NULL.
- `evaluaciones` no tiene CHECK para `trimestre` (1–3) ni para `nivel`. La regla solo se valida en `StoreEvaluacionRequest` (`between:1,3`).
- `users.rol` no tiene CHECK (se eliminó en `allow_direccion_role`).
- `activity_evaluation_history.actividad_id` ahora apunta a `fotos_ejercicio.id` porque la tabla `actividades` se renombró.

## 3. Relaciones y cardinalidad

| Relación | Cardinalidad | FK | Al borrar el padre |
|---|---|---|---|
| institutions → users | 1 : N (usuario con institución opcional) | `users.institution_id` | SET NULL |
| institutions → courses | 1 : N | `courses.institution_id` | CASCADE |
| users (docente) → courses | 1 : N (curso con docente opcional) | `courses.id_docente` | SET NULL |
| courses → students | 1 : N | `students.id_curso` | CASCADE |
| courses → evaluaciones | 1 : N, como máximo 1 por trimestre (UNIQUE `id_curso, trimestre`) | `evaluaciones.id_curso` | CASCADE |
| evaluaciones → fotos_ejercicio | 1 : N (estudiantes × 4 casillas) | `fotos_ejercicio.id_evaluacion` (nulo permitido) | CASCADE |
| students → fotos_ejercicio | 1 : N | `fotos_ejercicio.id_estudiante` | CASCADE |
| exercises → fotos_ejercicio | 1 : N | `fotos_ejercicio.id_ejercicio` | RESTRICT |
| users → fotos_ejercicio (quien valora) | 1 : N (opcional) | `fotos_ejercicio.valorado_por` | SET NULL |
| fotos_ejercicio → analisis | 1 : 0..1 según el código; 1 : N según la BD (sin UNIQUE) | `analisis.id_foto` | CASCADE |
| model_versions → analisis | 1 : N (opcional) | `analisis.id_modelo` | SET NULL |
| users → model_versions (creador) | 1 : N (opcional) | `model_versions.created_by` | SET NULL |
| students → observaciones | 1 : N | `observaciones.id_estudiante` | CASCADE |
| evaluaciones → observaciones | 1 : N (opcional) | `observaciones.id_evaluacion` | SET NULL |
| users → observaciones (autor) | 1 : N (opcional) | `observaciones.autor` | SET NULL |
| fotos_ejercicio → observaciones (origen migrado) | 1 : N (opcional) | `observaciones.legacy_foto_id` | SET NULL |
| courses → scheduled_activities | 1 : N | `scheduled_activities.course_id` | RESTRICT |
| exercises → scheduled_activities | 1 : N | `scheduled_activities.exercise_id` | RESTRICT |
| users → scheduled_activities (creador) | 1 : N | `scheduled_activities.created_by` | RESTRICT |
| scheduled_activities ↔ exercises | N : M vía `scheduled_activity_exercises` (UNIQUE por actividad+ejercicio y actividad+posición) | `scheduled_activity_id`, `exercise_id` | CASCADE / RESTRICT |
| scheduled_activities → fotos_ejercicio | 1 : N (opcional) | `fotos_ejercicio.scheduled_activity_id` | SET NULL |
| fotos_ejercicio → activity_evaluation_history | 1 : N | `activity_evaluation_history.actividad_id` | CASCADE |
| users → activity_evaluation_history | 1 : N | `activity_evaluation_history.changed_by` | RESTRICT |

## 4. Tablas del diseño anterior y del nuevo flujo

| Tabla | Clasificación | Evidencia |
|---|---|---|
| `scheduled_activities` (programaciones) | Diseño anterior, solo lectura | Creada en `2026_10_29_000001`. Solo se lee desde `LegacyReadController`. El controlador CRUD `ScheduledActivityController` no tiene rutas |
| `scheduled_activity_exercises` | Diseño anterior | Creada en `2026_10_30_000001` |
| `activity_evaluation_history` (historial) | Diseño anterior, solo lectura | Creada en `2026_10_29_000001`. El flujo nuevo no escribe en ella; solo `LegacyReadController@history` la lee |
| `evaluaciones` | Nuevo flujo | Creada en `2026_11_03_000001` |
| `fotos_ejercicio` | Nuevo flujo (es la antigua `actividades`, renombrada y ampliada) | Conserva columnas de transición: `legacy_estado`, `legacy_imagen_*`, `scheduled_activity_id`, `period_reference` |
| `analisis` | Nuevo flujo (es la antigua `analysis_results`, renombrada) | Agrega `indicadores`, `caracteristicas`, `rutas_etapas` (JSON) |
| `observaciones` | Nuevo flujo | Creada en `2026_11_03_000001`; `legacy_foto_id` vincula las observaciones migradas |
| `actividades`, `imagenes`, `analysis_results` | Eliminadas o renombradas | `actividades` → `fotos_ejercicio`; `imagenes` eliminada (su ruta pasó a `fotos_ejercicio.ruta_imagen`); `analysis_results` → `analisis` |
| `institutions`, `users`, `courses`, `students`, `exercises`, `model_versions` | Comunes a ambos diseños | — |
| `cache`, `cache_locks`, `jobs`, `job_batches`, `failed_jobs`, `sessions`, `password_reset_tokens`, `personal_access_tokens`, `migrations` | Infraestructura de Laravel/Sanctum | — |

Los modelos `Actividad`, `Imagen` y `AnalysisResult` siguen en `app/Models` y apuntan a tablas que ya no existen.

## 5. Migraciones en orden

Salida de `php artisan migrate:status` (base de desarrollo):

```
  Migration name ...................................................................................... Batch / Status
  0001_01_00_000000_create_institutions_table ................................................................ [1] Ran
  0001_01_01_000000_create_users_table ....................................................................... [1] Ran
  0001_01_01_000001_create_cache_table ....................................................................... [1] Ran
  0001_01_01_000002_create_jobs_table ........................................................................ [1] Ran
  2026_09_18_114503_create_personal_access_tokens_table ...................................................... [1] Ran
  2026_09_18_120002_create_courses_table ..................................................................... [1] Ran
  2026_09_18_120003_create_students_table .................................................................... [1] Ran
  2026_09_18_120004_create_exercises_table ................................................................... [1] Ran
  2026_09_18_120005_create_actividades_table ................................................................. [1] Ran
  2026_09_18_120006_create_imagenes_table .................................................................... [1] Ran
  2026_09_18_130000_create_model_versions_table .............................................................. [2] Ran
  2026_09_18_130001_create_analysis_results_table ............................................................ [2] Ran
  2026_09_18_130002_add_processing_fields_to_actividades_table ............................................... [2] Ran
  2026_10_29_000001_add_activity_programming_and_pedagogical_evaluations ..................................... [3] Ran
  2026_10_30_000001_add_exercises_to_scheduled_activities .................................................... [4] Ran
  2026_11_01_000001_rename_analysis_risk_fields_to_suggestion ................................................ [5] Ran
  2026_11_02_000001_allow_direccion_role ..................................................................... [5] Ran
  2026_11_03_000001_adapt_graphilearn_evaluations ............................................................ [6] Ran
```

"Fecha" es la del nombre del archivo. "Modificado" es la fecha de modificación del archivo en disco. "Git" indica si el archivo está en el commit `f911e3e` (2026-10-29) o sin commit (`??`).

| # | Archivo | Fecha (nombre) | Modificado | Git | Qué hace |
|---|---|---|---|---|---|
| 1 | `0001_01_00_000000_create_institutions_table.php` | — | 2026-09-30 | commit | Crea `institutions` (nombre, dirección) |
| 2 | `0001_01_01_000000_create_users_table.php` | — | 2026-09-30 | commit | Crea `users` (institution_id, nombre, correo único, password, `rol` enum administrador/docente) y además `password_reset_tokens` y `sessions` |
| 3 | `0001_01_01_000001_create_cache_table.php` | — | 2026-03-14 | commit | `cache`, `cache_locks` (Laravel estándar) |
| 4 | `0001_01_01_000002_create_jobs_table.php` | — | 2026-03-14 | commit | `jobs`, `job_batches`, `failed_jobs` (Laravel estándar) |
| 5 | `2026_09_18_114503_create_personal_access_tokens_table.php` | 2026-09-18 | 2026-09-18 | commit | Tokens de Sanctum |
| 6 | `2026_09_18_120002_create_courses_table.php` | 2026-09-18 | 2026-09-30 | commit | `courses` (institution_id, id_docente, nombre, nivel, gestión) |
| 7 | `2026_09_18_120003_create_students_table.php` | 2026-09-18 | 2026-09-30 | commit | `students` (id_curso, nombre, fecha_nacimiento, soft delete) |
| 8 | `2026_09_18_120004_create_exercises_table.php` | 2026-09-18 | 2026-10-01 | commit | `exercises` (nombre, `tipo_trazo` enum linea/circulo/espiral/zigzag, descripción, activo) |
| 9 | `2026_09_18_120005_create_actividades_table.php` | 2026-09-18 | 2026-09-30 | commit | `actividades` (id_estudiante, id_ejercicio, fecha, soft delete) |
| 10 | `2026_09_18_120006_create_imagenes_table.php` | 2026-09-18 | 2026-09-30 | commit | `imagenes` (id_actividad, ruta, formato, fecha_carga) |
| 11 | `2026_09_18_130000_create_model_versions_table.php` | 2026-09-18 | 2026-10-23 | commit | `model_versions` (name, version, algorithm, file_path, metrics JSON, active, created_by) |
| 12 | `2026_09_18_130001_create_analysis_results_table.php` | 2026-09-18 | 2026-11-01 | commit | `analysis_results`: características, indicadores, `risk_label`/`risk_score`, versión del modelo, estado y estado_revision (enums), detalles JSON |
| 13 | `2026_09_18_130002_add_processing_fields_to_actividades_table.php` | 2026-09-18 | 2026-10-22 | commit | Agrega `estado` (enum) y `fecha_procesado` a `actividades` |
| 14 | `2026_10_29_000001_add_activity_programming_and_pedagogical_evaluations.php` | 2026-10-29 | 2026-10-29 | `??` | Crea `scheduled_activities` y `activity_evaluation_history`; agrega a `actividades` la programación, `evaluated_by`, `pedagogical_rating` (S/ED/NA), observaciones y periodo; agrega `active` a `courses` y `users` |
| 15 | `2026_10_30_000001_add_exercises_to_scheduled_activities.php` | 2026-10-30 | 2026-10-30 | `??` | Verifica que no haya duplicados; crea la tabla pivote `scheduled_activity_exercises`, copia el ejercicio existente como posición 1 y agrega UNIQUE (programación, estudiante, ejercicio) en `actividades` |
| 16 | `2026_11_01_000001_rename_analysis_risk_fields_to_suggestion.php` | 2026-11-01 | 2026-11-01 | `??` | Renombra `risk_label` → `sugerencia` y elimina `risk_score` |
| 17 | `2026_11_02_000001_allow_direccion_role.php` | 2026-11-02 | 2026-11-01 | `??` | Elimina `users_rol_check` y cambia `rol` a `varchar(50)` (permite `direccion`) |
| 18 | `2026_11_03_000001_adapt_graphilearn_evaluations.php` | 2026-11-03 | 2026-11-01 | `??` | Verificación previa (exactamente un ejercicio activo por tipo, sin huérfanos ni duplicados). Crea `evaluaciones`; renombra `actividades` → `fotos_ejercicio` (con restricciones, índices y secuencia); agrega `id_evaluacion`, `ruta_imagen`, `legacy_*` y `valorado_en`; copia `imagenes.ruta` a `ruta_imagen`; renombra `pedagogical_rating` → `valoracion` y `evaluated_by` → `valorado_por`; recalcula `estado` (sin_foto/foto_lista/valorado) con CHECK; crea `observaciones` y migra las observaciones antiguas; elimina `imagenes`; renombra `analysis_results` → `analisis` (`actividad_id` → `id_foto`, `model_version_id` → `id_modelo`) y llena los JSON `indicadores` y `caracteristicas`. Su `down()` se niega a revertir si ya hay evaluaciones u observaciones nuevas |

En `GraphiLearn/storage/app/private/migration-safety/` hay volcados `.dump` de la base hechos antes de algunas migraciones (`graphilearn_pre_activity_roles_*`, `graphilearn_pre_multi_exercise_*`).

## Anexo A · `pg_dump --schema-only` (sin comentarios ni `SET`)

```sql
CREATE TABLE public.activity_evaluation_history (
    id bigint NOT NULL,
    actividad_id bigint NOT NULL,
    changed_by bigint NOT NULL,
    pedagogical_rating character varying(255),
    pedagogical_observations text,
    created_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT activity_evaluation_history_pedagogical_rating_check CHECK (((pedagogical_rating)::text = ANY ((ARRAY['S'::character varying, 'ED'::character varying, 'NA'::character varying])::text[])))
);
CREATE SEQUENCE public.activity_evaluation_history_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.activity_evaluation_history_id_seq OWNED BY public.activity_evaluation_history.id;
CREATE TABLE public.analisis (
    id bigint NOT NULL,
    id_foto bigint NOT NULL,
    tipo_trazo character varying(255),
    longitud_trazo double precision,
    alto integer,
    ancho integer,
    proporcion double precision,
    inclinacion double precision,
    curvatura double precision,
    separacion_componentes double precision,
    posicion_normalizada json,
    desviacion double precision,
    rugosidad double precision,
    continuidad double precision,
    regularidad double precision,
    sugerencia character varying(255),
    id_modelo bigint,
    estado character varying(255) DEFAULT 'pendiente'::character varying NOT NULL,
    estado_revision character varying(255) DEFAULT 'pendiente'::character varying NOT NULL,
    error_message text,
    detalles_computacionales json,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    deleted_at timestamp(0) without time zone,
    indicadores json,
    caracteristicas json,
    rutas_etapas json,
    CONSTRAINT analisis_estado_check CHECK (((estado)::text = ANY ((ARRAY['pendiente'::character varying, 'procesando'::character varying, 'procesado'::character varying, 'error'::character varying])::text[]))),
    CONSTRAINT analisis_estado_revision_check CHECK (((estado_revision)::text = ANY ((ARRAY['pendiente'::character varying, 'aprobada'::character varying, 'rechazada'::character varying])::text[])))
);
CREATE SEQUENCE public.analisis_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.analisis_id_seq OWNED BY public.analisis.id;
CREATE TABLE public.cache (
    key character varying(255) NOT NULL,
    value text NOT NULL,
    expiration integer NOT NULL
);
CREATE TABLE public.cache_locks (
    key character varying(255) NOT NULL,
    owner character varying(255) NOT NULL,
    expiration integer NOT NULL
);
CREATE TABLE public.courses (
    id bigint NOT NULL,
    institution_id bigint NOT NULL,
    id_docente bigint,
    nombre character varying(255) NOT NULL,
    nivel character varying(255) NOT NULL,
    gestion character varying(255) NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    active boolean DEFAULT true NOT NULL
);
CREATE SEQUENCE public.courses_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.courses_id_seq OWNED BY public.courses.id;
CREATE TABLE public.evaluaciones (
    id bigint NOT NULL,
    id_curso bigint NOT NULL,
    trimestre smallint NOT NULL,
    nivel smallint NOT NULL,
    tamano_figura_mm numeric(7,2) NOT NULL,
    fecha date NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);
CREATE SEQUENCE public.evaluaciones_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.evaluaciones_id_seq OWNED BY public.evaluaciones.id;
CREATE TABLE public.exercises (
    id bigint NOT NULL,
    nombre character varying(255) NOT NULL,
    tipo_trazo character varying(255) NOT NULL,
    descripcion text,
    activo boolean DEFAULT true NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT exercises_tipo_trazo_check CHECK (((tipo_trazo)::text = ANY ((ARRAY['linea'::character varying, 'circulo'::character varying, 'espiral'::character varying, 'zigzag'::character varying])::text[])))
);
CREATE SEQUENCE public.exercises_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.exercises_id_seq OWNED BY public.exercises.id;
CREATE TABLE public.failed_jobs (
    id bigint NOT NULL,
    uuid character varying(255) NOT NULL,
    connection text NOT NULL,
    queue text NOT NULL,
    payload text NOT NULL,
    exception text NOT NULL,
    failed_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE SEQUENCE public.failed_jobs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.failed_jobs_id_seq OWNED BY public.failed_jobs.id;
CREATE TABLE public.fotos_ejercicio (
    id bigint NOT NULL,
    id_estudiante bigint NOT NULL,
    id_ejercicio bigint NOT NULL,
    fecha date NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    deleted_at timestamp(0) without time zone,
    estado character varying(255) DEFAULT 'sin_foto'::character varying NOT NULL,
    fecha_procesado timestamp(0) without time zone,
    scheduled_activity_id bigint,
    valorado_por bigint,
    valoracion character varying(255),
    period_reference character varying(100),
    id_evaluacion bigint,
    ruta_imagen character varying(255),
    legacy_estado character varying(50),
    legacy_imagen_id bigint,
    legacy_imagen_formato character varying(10),
    legacy_imagen_fecha_carga timestamp(0) without time zone,
    legacy_imagen_created_at timestamp(0) without time zone,
    legacy_imagen_updated_at timestamp(0) without time zone,
    valorado_en timestamp(0) without time zone,
    CONSTRAINT fotos_ejercicio_estado_check CHECK (((estado)::text = ANY ((ARRAY['sin_foto'::character varying, 'foto_lista'::character varying, 'valorado'::character varying])::text[]))),
    CONSTRAINT fotos_ejercicio_valoracion_check CHECK (((valoracion)::text = ANY ((ARRAY['S'::character varying, 'ED'::character varying, 'NA'::character varying])::text[])))
);
CREATE SEQUENCE public.fotos_ejercicio_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.fotos_ejercicio_id_seq OWNED BY public.fotos_ejercicio.id;
CREATE TABLE public.institutions (
    id bigint NOT NULL,
    nombre character varying(255) NOT NULL,
    direccion character varying(255),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);
CREATE SEQUENCE public.institutions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.institutions_id_seq OWNED BY public.institutions.id;
CREATE TABLE public.job_batches (
    id character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    total_jobs integer NOT NULL,
    pending_jobs integer NOT NULL,
    failed_jobs integer NOT NULL,
    failed_job_ids text NOT NULL,
    options text,
    cancelled_at integer,
    created_at integer NOT NULL,
    finished_at integer
);
CREATE TABLE public.jobs (
    id bigint NOT NULL,
    queue character varying(255) NOT NULL,
    payload text NOT NULL,
    attempts smallint NOT NULL,
    reserved_at integer,
    available_at integer NOT NULL,
    created_at integer NOT NULL
);
CREATE SEQUENCE public.jobs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.jobs_id_seq OWNED BY public.jobs.id;
CREATE TABLE public.migrations (
    id integer NOT NULL,
    migration character varying(255) NOT NULL,
    batch integer NOT NULL
);
CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;
CREATE TABLE public.model_versions (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    version character varying(255),
    algorithm character varying(255),
    description character varying(255),
    file_path character varying(255) NOT NULL,
    metrics json,
    active boolean DEFAULT false NOT NULL,
    created_by bigint,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);
CREATE SEQUENCE public.model_versions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.model_versions_id_seq OWNED BY public.model_versions.id;
CREATE TABLE public.observaciones (
    id bigint NOT NULL,
    id_estudiante bigint NOT NULL,
    id_evaluacion bigint,
    texto text NOT NULL,
    autor bigint,
    legacy_foto_id bigint,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);
CREATE SEQUENCE public.observaciones_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.observaciones_id_seq OWNED BY public.observaciones.id;
CREATE TABLE public.password_reset_tokens (
    email character varying(255) NOT NULL,
    token character varying(255) NOT NULL,
    created_at timestamp(0) without time zone
);
CREATE TABLE public.personal_access_tokens (
    id bigint NOT NULL,
    tokenable_type character varying(255) NOT NULL,
    tokenable_id bigint NOT NULL,
    name text NOT NULL,
    token character varying(64) NOT NULL,
    abilities text,
    last_used_at timestamp(0) without time zone,
    expires_at timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);
CREATE SEQUENCE public.personal_access_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.personal_access_tokens_id_seq OWNED BY public.personal_access_tokens.id;
CREATE TABLE public.scheduled_activities (
    id bigint NOT NULL,
    course_id bigint NOT NULL,
    exercise_id bigint NOT NULL,
    created_by bigint NOT NULL,
    name character varying(150) NOT NULL,
    instructions text,
    period_reference character varying(100),
    scheduled_for date,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    deleted_at timestamp(0) without time zone
);
CREATE SEQUENCE public.scheduled_activities_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.scheduled_activities_id_seq OWNED BY public.scheduled_activities.id;
CREATE TABLE public.scheduled_activity_exercises (
    id bigint NOT NULL,
    scheduled_activity_id bigint NOT NULL,
    exercise_id bigint NOT NULL,
    "position" integer NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);
CREATE SEQUENCE public.scheduled_activity_exercises_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.scheduled_activity_exercises_id_seq OWNED BY public.scheduled_activity_exercises.id;
CREATE TABLE public.sessions (
    id character varying(255) NOT NULL,
    user_id bigint,
    ip_address character varying(45),
    user_agent text,
    payload text NOT NULL,
    last_activity integer NOT NULL
);
CREATE TABLE public.students (
    id bigint NOT NULL,
    id_curso bigint NOT NULL,
    nombre character varying(255) NOT NULL,
    fecha_nacimiento date NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    deleted_at timestamp(0) without time zone
);
CREATE SEQUENCE public.students_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.students_id_seq OWNED BY public.students.id;
CREATE TABLE public.users (
    id bigint NOT NULL,
    institution_id bigint,
    nombre character varying(255) NOT NULL,
    correo character varying(255) NOT NULL,
    email_verified_at timestamp(0) without time zone,
    password character varying(255) NOT NULL,
    rol character varying(50) DEFAULT 'docente'::character varying NOT NULL,
    remember_token character varying(100),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    active boolean DEFAULT true NOT NULL
);
CREATE SEQUENCE public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;
ALTER TABLE ONLY public.activity_evaluation_history ALTER COLUMN id SET DEFAULT nextval('public.activity_evaluation_history_id_seq'::regclass);
ALTER TABLE ONLY public.analisis ALTER COLUMN id SET DEFAULT nextval('public.analisis_id_seq'::regclass);
ALTER TABLE ONLY public.courses ALTER COLUMN id SET DEFAULT nextval('public.courses_id_seq'::regclass);
ALTER TABLE ONLY public.evaluaciones ALTER COLUMN id SET DEFAULT nextval('public.evaluaciones_id_seq'::regclass);
ALTER TABLE ONLY public.exercises ALTER COLUMN id SET DEFAULT nextval('public.exercises_id_seq'::regclass);
ALTER TABLE ONLY public.failed_jobs ALTER COLUMN id SET DEFAULT nextval('public.failed_jobs_id_seq'::regclass);
ALTER TABLE ONLY public.fotos_ejercicio ALTER COLUMN id SET DEFAULT nextval('public.fotos_ejercicio_id_seq'::regclass);
ALTER TABLE ONLY public.institutions ALTER COLUMN id SET DEFAULT nextval('public.institutions_id_seq'::regclass);
ALTER TABLE ONLY public.jobs ALTER COLUMN id SET DEFAULT nextval('public.jobs_id_seq'::regclass);
ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);
ALTER TABLE ONLY public.model_versions ALTER COLUMN id SET DEFAULT nextval('public.model_versions_id_seq'::regclass);
ALTER TABLE ONLY public.observaciones ALTER COLUMN id SET DEFAULT nextval('public.observaciones_id_seq'::regclass);
ALTER TABLE ONLY public.personal_access_tokens ALTER COLUMN id SET DEFAULT nextval('public.personal_access_tokens_id_seq'::regclass);
ALTER TABLE ONLY public.scheduled_activities ALTER COLUMN id SET DEFAULT nextval('public.scheduled_activities_id_seq'::regclass);
ALTER TABLE ONLY public.scheduled_activity_exercises ALTER COLUMN id SET DEFAULT nextval('public.scheduled_activity_exercises_id_seq'::regclass);
ALTER TABLE ONLY public.students ALTER COLUMN id SET DEFAULT nextval('public.students_id_seq'::regclass);
ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);
ALTER TABLE ONLY public.activity_evaluation_history
    ADD CONSTRAINT activity_evaluation_history_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.analisis
    ADD CONSTRAINT analisis_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.cache_locks
    ADD CONSTRAINT cache_locks_pkey PRIMARY KEY (key);
ALTER TABLE ONLY public.cache
    ADD CONSTRAINT cache_pkey PRIMARY KEY (key);
ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.evaluaciones
    ADD CONSTRAINT evaluaciones_curso_trimestre_unique UNIQUE (id_curso, trimestre);
ALTER TABLE ONLY public.evaluaciones
    ADD CONSTRAINT evaluaciones_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.exercises
    ADD CONSTRAINT exercises_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.failed_jobs
    ADD CONSTRAINT failed_jobs_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.failed_jobs
    ADD CONSTRAINT failed_jobs_uuid_unique UNIQUE (uuid);
ALTER TABLE ONLY public.fotos_ejercicio
    ADD CONSTRAINT foto_evaluacion_estudiante_ejercicio_unique UNIQUE (id_evaluacion, id_estudiante, id_ejercicio);
ALTER TABLE ONLY public.fotos_ejercicio
    ADD CONSTRAINT fotos_ejercicio_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.fotos_ejercicio
    ADD CONSTRAINT fotos_ejercicio_scheduled_student_exercise_unique UNIQUE (scheduled_activity_id, id_estudiante, id_ejercicio);
ALTER TABLE ONLY public.institutions
    ADD CONSTRAINT institutions_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.job_batches
    ADD CONSTRAINT job_batches_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.model_versions
    ADD CONSTRAINT model_versions_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.observaciones
    ADD CONSTRAINT observaciones_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (email);
ALTER TABLE ONLY public.personal_access_tokens
    ADD CONSTRAINT personal_access_tokens_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.personal_access_tokens
    ADD CONSTRAINT personal_access_tokens_token_unique UNIQUE (token);
ALTER TABLE ONLY public.scheduled_activities
    ADD CONSTRAINT scheduled_activities_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.scheduled_activity_exercises
    ADD CONSTRAINT scheduled_activity_exercise_unique UNIQUE (scheduled_activity_id, exercise_id);
ALTER TABLE ONLY public.scheduled_activity_exercises
    ADD CONSTRAINT scheduled_activity_exercises_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.scheduled_activity_exercises
    ADD CONSTRAINT scheduled_activity_position_unique UNIQUE (scheduled_activity_id, "position");
ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_correo_unique UNIQUE (correo);
ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);
CREATE INDEX activity_evaluation_history_actividad_id_created_at_index ON public.activity_evaluation_history USING btree (actividad_id, created_at);
CREATE INDEX cache_expiration_index ON public.cache USING btree (expiration);
CREATE INDEX cache_locks_expiration_index ON public.cache_locks USING btree (expiration);
CREATE INDEX courses_id_docente_index ON public.courses USING btree (id_docente);
CREATE INDEX courses_institution_id_index ON public.courses USING btree (institution_id);
CREATE INDEX exercises_tipo_trazo_index ON public.exercises USING btree (tipo_trazo);
CREATE INDEX fotos_ejercicio_fecha_index ON public.fotos_ejercicio USING btree (fecha);
CREATE INDEX fotos_ejercicio_id_ejercicio_index ON public.fotos_ejercicio USING btree (id_ejercicio);
CREATE INDEX fotos_ejercicio_id_estudiante_index ON public.fotos_ejercicio USING btree (id_estudiante);
CREATE INDEX jobs_queue_index ON public.jobs USING btree (queue);
CREATE INDEX observaciones_id_estudiante_id_evaluacion_index ON public.observaciones USING btree (id_estudiante, id_evaluacion);
CREATE INDEX personal_access_tokens_expires_at_index ON public.personal_access_tokens USING btree (expires_at);
CREATE INDEX personal_access_tokens_tokenable_type_tokenable_id_index ON public.personal_access_tokens USING btree (tokenable_type, tokenable_id);
CREATE INDEX scheduled_activities_course_id_active_index ON public.scheduled_activities USING btree (course_id, active);
CREATE INDEX sessions_last_activity_index ON public.sessions USING btree (last_activity);
CREATE INDEX sessions_user_id_index ON public.sessions USING btree (user_id);
CREATE INDEX students_id_curso_index ON public.students USING btree (id_curso);
CREATE INDEX users_institution_id_index ON public.users USING btree (institution_id);
CREATE INDEX users_rol_index ON public.users USING btree (rol);
ALTER TABLE ONLY public.activity_evaluation_history
    ADD CONSTRAINT activity_evaluation_history_actividad_id_foreign FOREIGN KEY (actividad_id) REFERENCES public.fotos_ejercicio(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.activity_evaluation_history
    ADD CONSTRAINT activity_evaluation_history_changed_by_foreign FOREIGN KEY (changed_by) REFERENCES public.users(id) ON DELETE RESTRICT;
ALTER TABLE ONLY public.analisis
    ADD CONSTRAINT analisis_id_foto_foreign FOREIGN KEY (id_foto) REFERENCES public.fotos_ejercicio(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.analisis
    ADD CONSTRAINT analisis_id_modelo_foreign FOREIGN KEY (id_modelo) REFERENCES public.model_versions(id) ON DELETE SET NULL;
ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_id_docente_foreign FOREIGN KEY (id_docente) REFERENCES public.users(id) ON DELETE SET NULL;
ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_institution_id_foreign FOREIGN KEY (institution_id) REFERENCES public.institutions(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.evaluaciones
    ADD CONSTRAINT evaluaciones_id_curso_foreign FOREIGN KEY (id_curso) REFERENCES public.courses(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.fotos_ejercicio
    ADD CONSTRAINT fotos_ejercicio_id_ejercicio_foreign FOREIGN KEY (id_ejercicio) REFERENCES public.exercises(id) ON DELETE RESTRICT;
ALTER TABLE ONLY public.fotos_ejercicio
    ADD CONSTRAINT fotos_ejercicio_id_estudiante_foreign FOREIGN KEY (id_estudiante) REFERENCES public.students(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.fotos_ejercicio
    ADD CONSTRAINT fotos_ejercicio_id_evaluacion_foreign FOREIGN KEY (id_evaluacion) REFERENCES public.evaluaciones(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.fotos_ejercicio
    ADD CONSTRAINT fotos_ejercicio_scheduled_activity_id_foreign FOREIGN KEY (scheduled_activity_id) REFERENCES public.scheduled_activities(id) ON DELETE SET NULL;
ALTER TABLE ONLY public.fotos_ejercicio
    ADD CONSTRAINT fotos_ejercicio_valorado_por_foreign FOREIGN KEY (valorado_por) REFERENCES public.users(id) ON DELETE SET NULL;
ALTER TABLE ONLY public.model_versions
    ADD CONSTRAINT model_versions_created_by_foreign FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;
ALTER TABLE ONLY public.observaciones
    ADD CONSTRAINT observaciones_autor_foreign FOREIGN KEY (autor) REFERENCES public.users(id) ON DELETE SET NULL;
ALTER TABLE ONLY public.observaciones
    ADD CONSTRAINT observaciones_id_estudiante_foreign FOREIGN KEY (id_estudiante) REFERENCES public.students(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.observaciones
    ADD CONSTRAINT observaciones_id_evaluacion_foreign FOREIGN KEY (id_evaluacion) REFERENCES public.evaluaciones(id) ON DELETE SET NULL;
ALTER TABLE ONLY public.observaciones
    ADD CONSTRAINT observaciones_legacy_foto_id_foreign FOREIGN KEY (legacy_foto_id) REFERENCES public.fotos_ejercicio(id) ON DELETE SET NULL;
ALTER TABLE ONLY public.scheduled_activities
    ADD CONSTRAINT scheduled_activities_course_id_foreign FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE RESTRICT;
ALTER TABLE ONLY public.scheduled_activities
    ADD CONSTRAINT scheduled_activities_created_by_foreign FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE RESTRICT;
ALTER TABLE ONLY public.scheduled_activities
    ADD CONSTRAINT scheduled_activities_exercise_id_foreign FOREIGN KEY (exercise_id) REFERENCES public.exercises(id) ON DELETE RESTRICT;
ALTER TABLE ONLY public.scheduled_activity_exercises
    ADD CONSTRAINT scheduled_activity_exercises_exercise_id_foreign FOREIGN KEY (exercise_id) REFERENCES public.exercises(id) ON DELETE RESTRICT;
ALTER TABLE ONLY public.scheduled_activity_exercises
    ADD CONSTRAINT scheduled_activity_exercises_scheduled_activity_id_foreign FOREIGN KEY (scheduled_activity_id) REFERENCES public.scheduled_activities(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_id_curso_foreign FOREIGN KEY (id_curso) REFERENCES public.courses(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_institution_id_foreign FOREIGN KEY (institution_id) REFERENCES public.institutions(id) ON DELETE SET NULL;
```
