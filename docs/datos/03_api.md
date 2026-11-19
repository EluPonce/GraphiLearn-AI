# 03 · API

## 1. Salida de `php artisan route:list --path=api`

Ejecutado el 2026-11-14 en `GraphiLearn/` (se quitaron los códigos de color ANSI):

```
  GET|HEAD  api/actividades ................................................... Api\V1\LegacyReadController@activities
  GET|HEAD  api/actividades-programadas .............................. Api\V1\LegacyReadController@scheduledActivities
  GET|HEAD  api/actividades/{photoId} ............................................... Api\V1\LegacyReadController@show
  GET|HEAD  api/actividades/{photoId}/evaluacion/historial ....................... Api\V1\LegacyReadController@history
  GET|HEAD  api/actividades/{photoId}/resultado ................................... Api\V1\LegacyReadController@result
  POST      api/auth/login ............................................................... Api\V1\AuthController@login
  POST      api/auth/logout ............................................................. Api\V1\AuthController@logout
  GET|HEAD  api/auth/me ..................................................................... Api\V1\AuthController@me
  POST      api/auth/register ......................................................... Api\V1\AuthController@register
  GET|HEAD  api/cursos ....................................................... Api\V1\EvaluationFlowController@courses
  GET|HEAD  api/cursos/{courseId}/evaluaciones/{trimestre} ...................... Api\V1\EvaluationFlowController@grid
  GET|HEAD  api/cursos/{courseId}/seguimiento ............................. Api\V1\LegacyReadController@courseProgress
  GET|HEAD  api/cursos/{course} ......................................................... Api\V1\CourseController@show
  GET|HEAD  api/dashboard ........................................................... Api\V1\DashboardController@index
  GET|HEAD  api/direccion/cursos .................................... Api\V1\EvaluationFlowController@directionCourses
  GET|HEAD  api/estudiantes/{studentId}/ficha ........................... Api\V1\EvaluationFlowController@studentSheet
  POST      api/evaluaciones .................................................. Api\V1\EvaluationFlowController@create
  POST      api/evaluaciones/{evaluationId}/estudiantes/{studentId}/ejercicios/{exercise}/foto Api\V1\EvaluationFlowC…
  PUT       api/evaluaciones/{evaluationId}/estudiantes/{studentId}/ejercicios/{exercise}/valoracion Api\V1\Evaluatio…
  GET|HEAD  api/exercises ............................................................ Api\V1\ExerciseController@index
  GET|HEAD  api/exercises/{exercise} .................................................. Api\V1\ExerciseController@show
  GET|HEAD  api/fotos/{photoId}/etapas ........................................ Api\V1\EvaluationFlowController@stages
  GET|HEAD  api/imagenes/{photoId}/download ........................................ Api\V1\LegacyReadController@image
  GET|HEAD  api/informes/curso/{courseId} ..................................... Api\V1\EvaluationFlowController@report
  GET|HEAD  api/model-versions ................................................... Api\V1\ModelVersionController@index
  POST      api/model-versions ................................................... Api\V1\ModelVersionController@store
  POST      api/model-versions/{modelVersion}/activate ........................ Api\V1\ModelVersionController@activate
  POST      api/model-versions/{modelVersion}/deactivate .................... Api\V1\ModelVersionController@deactivate
  GET|HEAD  api/students .............................................................. Api\V1\StudentController@index
  GET|HEAD  api/students/{studentId}/progress ............................ Api\V1\LegacyReadController@studentProgress
  GET|HEAD  api/students/{student} ..................................................... Api\V1\StudentController@show
  GET|HEAD  api/v1/actividades ................................................ Api\V1\LegacyReadController@activities
  GET|HEAD  api/v1/actividades-programadas ........................... Api\V1\LegacyReadController@scheduledActivities
  GET|HEAD  api/v1/actividades/{photoId} ............................................ Api\V1\LegacyReadController@show
  GET|HEAD  api/v1/actividades/{photoId}/evaluacion/historial .................... Api\V1\LegacyReadController@history
  GET|HEAD  api/v1/actividades/{photoId}/resultado ................................ Api\V1\LegacyReadController@result
  POST      api/v1/auth/login ............................................................ Api\V1\AuthController@login
  POST      api/v1/auth/logout .......................................................... Api\V1\AuthController@logout
  GET|HEAD  api/v1/auth/me .................................................................. Api\V1\AuthController@me
  POST      api/v1/auth/register ...................................................... Api\V1\AuthController@register
  GET|HEAD  api/v1/cursos .............................................................. Api\V1\CourseController@index
  GET|HEAD  api/v1/cursos/{courseId}/seguimiento .......................... Api\V1\LegacyReadController@courseProgress
  GET|HEAD  api/v1/cursos/{course} ...................................................... Api\V1\CourseController@show
  GET|HEAD  api/v1/dashboard ........................................................ Api\V1\DashboardController@index
  GET|HEAD  api/v1/exercises ......................................................... Api\V1\ExerciseController@index
  GET|HEAD  api/v1/exercises/{exercise} ............................................... Api\V1\ExerciseController@show
  GET|HEAD  api/v1/imagenes/{photoId}/download ..................................... Api\V1\LegacyReadController@image
  GET|HEAD  api/v1/model-versions ................................................ Api\V1\ModelVersionController@index
  POST      api/v1/model-versions ................................................ Api\V1\ModelVersionController@store
  POST      api/v1/model-versions/{modelVersion}/activate ..................... Api\V1\ModelVersionController@activate
  POST      api/v1/model-versions/{modelVersion}/deactivate ................. Api\V1\ModelVersionController@deactivate
  GET|HEAD  api/v1/students ........................................................... Api\V1\StudentController@index
  GET|HEAD  api/v1/students/{studentId}/progress ......................... Api\V1\LegacyReadController@studentProgress
  GET|HEAD  api/v1/students/{student} .................................................. Api\V1\StudentController@show

                                                                                                   Showing [54] routes
```

La salida con middleware (`route:list --path=api -v`) muestra para cada ruta `api`, `Illuminate\Auth\Middleware\Authenticate:sanctum` y `App\Http\Middleware\CheckRole:<roles>`. Ese detalle se resume en la tabla de abajo.

### Cómo se registran las rutas (`routes/api.php`)

- **Grupo `/api/v1`** incluye: `auth`, `dashboard`, `students`, `courses`, `exercises`, `legacy_read`, `model_versions`. **No incluye `evaluaciones.php`.**
- **Grupo `/api` (sin prefijo)** incluye lo mismo **y además** `evaluaciones.php`.
- `routes/api/v1/actividades.php` y `routes/api/v1/analysis.php` existen, pero **no se cargan** desde `api.php`. Por eso `ActividadController`, `ActivityEvaluationController`, `AnalysisController`, `ImagenController` y `ScheduledActivityController` no tienen rutas activas.
- `students.php` importa `StudentProgressController` y `courses.php` importa `CourseProgressController` y `TeacherController`, pero ninguno se usa en una ruta.
- En `/api/cursos`, la definición de `evaluaciones.php` (`EvaluationFlowController@courses`, `role:docente`) reemplaza a la de `courses.php` (`CourseController@index`).

## 2. Tabla de endpoints

Todas las rutas protegidas usan `auth:sanctum` (token Bearer). "Rol" es el que acepta el middleware `role:`; la Policy puede restringir más (ver `02_roles_y_permisos.md`). Las 23 rutas con prefijo `/api/v1/...` repiten controlador y middleware de su par sin prefijo, salvo `/api/v1/cursos`, que usa `CourseController@index`.

| Método | URI (`/api/...` y `/api/v1/...`) | Controlador@método | Middleware | Rol | Qué hace |
|---|---|---|---|---|---|
| POST | `auth/login` | `AuthController@login` | `throttle:5,1` | público | Valida correo y contraseña (y que el usuario esté activo); devuelve `access_token` de Sanctum y el usuario |
| POST | `auth/register` | `AuthController@register` | `throttle:5,1` | público | Siempre responde 403: registro público deshabilitado |
| POST | `auth/logout` | `AuthController@logout` | `auth:sanctum` | cualquiera autenticado | Revoca el token actual |
| GET | `auth/me` | `AuthController@me` | `auth:sanctum` | cualquiera autenticado | Datos del usuario (`UserResource`) |
| GET | `dashboard` | `DashboardController@index` | `auth:sanctum`, `role:docente,direccion` | docente, direccion | Conteos de cursos, estudiantes, fotos y valoraciones accesibles, más la lista de cursos |
| GET | `cursos` (solo `/api`) | `EvaluationFlowController@courses` | `role:docente` | docente | "Mis cursos": trimestre actual, nivel, estudiantes completos (4 valorados) / total |
| GET | `v1/cursos` | `CourseController@index` | `role:docente,direccion` | docente, direccion | Lista de cursos accesibles (`CourseResource`) |
| GET | `cursos/{course}` | `CourseController@show` | `role:docente,direccion` | docente, direccion | Detalle del curso con estudiantes (incluye inactivos) y actividades programadas |
| GET | `cursos/{courseId}/seguimiento` | `LegacyReadController@courseProgress` | `role:docente,direccion` | docente, direccion | Totales de fotos y valoradas por ejercicio del curso |
| GET | `cursos/{courseId}/evaluaciones/{trimestre}` (solo `/api`) | `EvaluationFlowController@grid` | `role:docente,direccion` | docente, direccion | Cuadro estudiantes × 4 ejercicios del trimestre (1–3); crea las casillas que falten |
| POST | `evaluaciones` (solo `/api`) | `EvaluationFlowController@create` | `role:docente` | docente | Crea la evaluación (curso + trimestre único) y una casilla `sin_foto` por estudiante y ejercicio |
| POST | `evaluaciones/{evaluationId}/estudiantes/{studentId}/ejercicios/{exercise}/foto` (solo `/api`) | `EvaluationFlowController@upload` | `role:docente` | docente | Guarda la foto JPG/PNG (≤ 5 MB) en el disco privado; si `ANALISIS_HABILITADO`, llama a FastAPI |
| PUT | `evaluaciones/{evaluationId}/estudiantes/{studentId}/ejercicios/{exercise}/valoracion` (solo `/api`) | `EvaluationFlowController@rate` | `role:docente` | docente | Guarda la valoración S/ED/NA (y una observación opcional) |
| GET | `estudiantes/{studentId}/ficha` (solo `/api`) | `EvaluationFlowController@studentSheet` | `role:docente,direccion` | docente, direccion | Ficha: 4 ejercicios × T1–T3 y observaciones |
| GET | `informes/curso/{courseId}?trimestre=N` (solo `/api`) | `EvaluationFlowController@report` | `role:docente` | docente | Conteo S/ED/NA por ejercicio, completitud y estudiantes con ≥ 2 NA |
| GET | `direccion/cursos` (solo `/api`) | `EvaluationFlowController@directionCourses` | `role:direccion` | direccion | Resumen por curso de la institución: docente, completitud % y conteo S/ED/NA |
| GET | `fotos/{photoId}/etapas` (solo `/api`) | `EvaluationFlowController@stages` | `role:docente,direccion` | docente, direccion | Imágenes de etapas (original, grises, trazo, esqueleto) en base64 desde `analisis.rutas_etapas` |
| GET | `students` | `StudentController@index` | `role:docente,direccion` | docente, direccion | Lista paginada (máx. 50) con filtros `id_curso` y `search` |
| GET | `students/{student}` | `StudentController@show` | `role:docente,direccion` | docente, direccion | Detalle del estudiante |
| GET | `students/{studentId}/progress` | `LegacyReadController@studentProgress` | `role:docente,direccion` | docente, direccion | Seguimiento con formato del cliente anterior: fotos, programaciones y comparación entre trimestres |
| GET | `exercises` | `ExerciseController@index` | `role:docente,direccion` | docente, direccion | Catálogo de ejercicios paginado |
| GET | `exercises/{exercise}` | `ExerciseController@show` | `role:docente,direccion` | docente, direccion | Detalle (solo si está activo) |
| GET | `actividades` | `LegacyReadController@activities` | `role:docente,direccion` | docente, direccion | Fotos visibles con formato de "actividad" (compatibilidad); filtros por estudiante, ejercicio, estado y fechas |
| GET | `actividades/{photoId}` | `LegacyReadController@show` | `role:docente,direccion` | docente, direccion | Una foto con formato de actividad |
| GET | `actividades/{photoId}/resultado` | `LegacyReadController@result` | `role:docente,direccion` | docente, direccion | Análisis guardado (404 si no hay) |
| GET | `actividades/{photoId}/evaluacion/historial` | `LegacyReadController@history` | `role:docente,direccion` | docente, direccion | Filas de `activity_evaluation_history` |
| GET | `actividades-programadas` | `LegacyReadController@scheduledActivities` | `role:docente,direccion` | docente, direccion | Programaciones del diseño anterior, con conteo de ejecuciones |
| GET | `imagenes/{photoId}/download` | `LegacyReadController@image` | `role:docente,direccion` | docente, direccion | Transmite la foto privada |
| GET | `model-versions` | `ModelVersionController@index` | `role:administrador` | administrador | Lista de versiones registradas |
| POST | `model-versions` | `ModelVersionController@store` | `role:administrador` | administrador | Registra una versión si el archivo existe dentro de `AI_SERVICE_ROOT` |
| POST | `model-versions/{modelVersion}/activate` | `ModelVersionController@activate` | `role:administrador` | administrador | Pide a FastAPI cargar el modelo; si lo confirma, lo marca como única versión activa |
| POST | `model-versions/{modelVersion}/deactivate` | `ModelVersionController@deactivate` | `role:administrador` | administrador | Pide a FastAPI descargar el modelo y lo marca como inactivo |

## 3. Ejemplos reales de petición y respuesta

**Cómo se obtuvieron.** Se ejecutó una prueba temporal fuera del repositorio que llama a los endpoints reales a través del kernel HTTP de Laravel. Usó la configuración de `phpunit.xml` (SQLite en memoria; no toca la base de desarrollo), cargó `DatabaseSeeder` + `ExampleDataSeeder`, con `Storage::fake('private')` y `ANALISIS_HABILITADO=false`. Los usuarios son "Docente de ejemplo" y "Dirección de ejemplo". La fecha y hora corresponden a la ejecución (2026-11-14, UTC). El cuadro de evaluación se recortó a 2 de 6 estudiantes. En las respuestas de error se quitó la traza de pila que Laravel agrega con `APP_DEBUG`.

Entre las peticiones de "Guardar valoración con observación" y la "Ficha", el script también subió fotos y valoró `circulos` = NA, `zigzag` = NA y `espiral` = S para el mismo estudiante. Por eso la ficha y el informe muestran 4 valoraciones.

Hallazgo visible en estos ejemplos: la respuesta de `PUT .../valoracion` devuelve en `valorado_por` el **objeto completo del usuario** (incluido su `correo`), no el id. La relación `valoradoPor` se serializa con el mismo nombre que la columna.

### 3.1 Mis cursos (docente)

Petición: `GET /api/cursos`

Cuerpo: (sin cuerpo)

Respuesta: HTTP 200

```json
{
  "data": [
    {
      "id": 4,
      "nombre": "Curso de ejemplo A",
      "trimestre_actual": null,
      "nivel": null,
      "estudiantes_completos": 0,
      "total_estudiantes": 6,
      "evaluacion_id": null
    },
    {
      "id": 5,
      "nombre": "Curso de ejemplo B",
      "trimestre_actual": null,
      "nivel": null,
      "estudiantes_completos": 0,
      "total_estudiantes": 6,
      "evaluacion_id": null
    }
  ]
}
```

### 3.2 Crear evaluación

Petición: `POST /api/evaluaciones`

Cuerpo:

```json
{
  "id_curso": 4,
  "trimestre": 1,
  "nivel": 2,
  "tamano_figura_mm": 80,
  "fecha": "2026-11-14"
}
```

Respuesta: HTTP 201

```json
{
  "data": {
    "id_curso": 4,
    "trimestre": 1,
    "nivel": 2,
    "tamano_figura_mm": 80,
    "fecha": "2026-11-14T00:00:00.000000Z",
    "updated_at": "2026-11-14T23:06:32.000000Z",
    "created_at": "2026-11-14T23:06:32.000000Z",
    "id": 1,
    "curso": {
      "id": 4,
      "institution_id": 2,
      "id_docente": 4,
      "nombre": "Curso de ejemplo A",
      "nivel": "Inicial (ejemplo)",
      "gestion": "EJEMPLO",
      "created_at": "2026-11-14T23:06:32.000000Z",
      "updated_at": "2026-11-14T23:06:32.000000Z",
      "active": true
    }
  }
}
```

### 3.3 Crear evaluación duplicada (mismo curso y trimestre)

Petición: `POST /api/evaluaciones`

Cuerpo:

```json
{
  "id_curso": 4,
  "trimestre": 1,
  "nivel": 2,
  "tamano_figura_mm": 80,
  "fecha": "2026-11-14"
}
```

Respuesta: HTTP 409

```json
{
  "message": "Ya existe una Evaluación para ese curso y trimestre."
}
```

### 3.4 Cuadro de evaluación del trimestre 1 (recortado a 2 estudiantes en el documento)

Petición: `GET /api/cursos/4/evaluaciones/1`

Cuerpo: (sin cuerpo)

Respuesta: HTTP 200

```json
{
  "data": {
    "evaluacion": {
      "id": 1,
      "id_curso": 4,
      "trimestre": 1,
      "nivel": 2,
      "tamano_figura_mm": 80,
      "fecha": "2026-11-14T00:00:00.000000Z",
      "created_at": "2026-11-14T23:06:32.000000Z",
      "updated_at": "2026-11-14T23:06:32.000000Z"
    },
    "ejercicios": [
      {
        "ejercicio": "linea",
        "id_ejercicio": 1,
        "nombre": "Trazo de Línea Recta"
      },
      {
        "ejercicio": "circulos",
        "id_ejercicio": 2,
        "nombre": "Trazo de Círculo"
      },
      {
        "ejercicio": "zigzag",
        "id_ejercicio": 4,
        "nombre": "Trazo de Zigzag"
      },
      {
        "ejercicio": "espiral",
        "id_ejercicio": 3,
        "nombre": "Trazo de Espiral"
      }
    ],
    "estudiantes": [
      {
        "id_estudiante": 7,
        "nombre": "Estudiante de ejemplo 01",
        "ejercicios": [
          {
            "ejercicio": "linea",
            "id_ejercicio": 1,
            "nombre": "Trazo de Línea Recta",
            "id_foto": 1,
            "estado": "sin_foto",
            "valoracion": null,
            "analisis_disponible": false
          },
          {
            "ejercicio": "circulos",
            "id_ejercicio": 2,
            "nombre": "Trazo de Círculo",
            "id_foto": 2,
            "estado": "sin_foto",
            "valoracion": null,
            "analisis_disponible": false
          },
          {
            "ejercicio": "zigzag",
            "id_ejercicio": 4,
            "nombre": "Trazo de Zigzag",
            "id_foto": 3,
            "estado": "sin_foto",
            "valoracion": null,
            "analisis_disponible": false
          },
          {
            "ejercicio": "espiral",
            "id_ejercicio": 3,
            "nombre": "Trazo de Espiral",
            "id_foto": 4,
            "estado": "sin_foto",
            "valoracion": null,
            "analisis_disponible": false
          }
        ]
      },
      {
        "id_estudiante": 8,
        "nombre": "Estudiante de ejemplo 02",
        "ejercicios": [
          {
            "ejercicio": "linea",
            "id_ejercicio": 1,
            "nombre": "Trazo de Línea Recta",
            "id_foto": 5,
            "estado": "sin_foto",
            "valoracion": null,
            "analisis_disponible": false
          },
          {
            "ejercicio": "circulos",
            "id_ejercicio": 2,
            "nombre": "Trazo de Círculo",
            "id_foto": 6,
            "estado": "sin_foto",
            "valoracion": null,
            "analisis_disponible": false
          },
          {
            "ejercicio": "zigzag",
            "id_ejercicio": 4,
            "nombre": "Trazo de Zigzag",
            "id_foto": 7,
            "estado": "sin_foto",
            "valoracion": null,
            "analisis_disponible": false
          },
          {
            "ejercicio": "espiral",
            "id_ejercicio": 3,
            "nombre": "Trazo de Espiral",
            "id_foto": 8,
            "estado": "sin_foto",
            "valoracion": null,
            "analisis_disponible": false
          }
        ]
      },
      "... (4 estudiantes más, recortado)"
    ]
  }
}
```

### 3.5 Valorar sin foto (error)

Petición: `PUT /api/evaluaciones/1/estudiantes/7/ejercicios/linea/valoracion`

Cuerpo:

```json
{
  "valoracion": "S"
}
```

Respuesta: HTTP 422

```json
{
  "message": "Sube una foto antes de guardar la valoración.",
  "exception": "Symfony\\Component\\HttpKernel\\Exception\\HttpException"
}
```

### 3.6 Subir foto (ANALISIS_HABILITADO=false)

Petición: `POST /api/evaluaciones/1/estudiantes/7/ejercicios/linea/foto`

Cuerpo: `multipart/form-data: foto=<archivo linea.jpg 1280x960>`

Respuesta: HTTP 201

```json
{
  "data": {
    "id": 1,
    "estado": "foto_lista",
    "analisis_disponible": false,
    "mensaje_analisis": "Análisis no disponible por ahora.",
    "analisis": null
  }
}
```

### 3.7 Guardar valoración con observación

Petición: `PUT /api/evaluaciones/1/estudiantes/7/ejercicios/linea/valoracion`

Cuerpo:

```json
{
  "valoracion": "ED",
  "observacion": "Sostiene el lápiz con pinza inmadura; repetir en el próximo trimestre."
}
```

Respuesta: HTTP 200

```json
{
  "data": {
    "id": 1,
    "id_estudiante": 7,
    "id_ejercicio": 1,
    "fecha": "2026-11-14T00:00:00.000000Z",
    "created_at": "2026-11-14T23:06:32.000000Z",
    "updated_at": "2026-11-14T23:06:32.000000Z",
    "deleted_at": null,
    "estado": "valorado",
    "fecha_procesado": null,
    "scheduled_activity_id": null,
    "valorado_por": {
      "id": 4,
      "institution_id": 2,
      "nombre": "Docente de ejemplo",
      "correo": "docente.ejemplo@graphilearn.test",
      "email_verified_at": null,
      "rol": "docente",
      "created_at": "2026-11-14T23:06:32.000000Z",
      "updated_at": "2026-11-14T23:06:32.000000Z",
      "active": true
    },
    "valoracion": "ED",
    "period_reference": null,
    "id_evaluacion": 1,
    "ruta_imagen": "graphilearn/fotos/1/89b2b996-4488-4279-b3ed-58dc76ac8f71.jpg",
    "legacy_estado": null,
    "legacy_imagen_id": null,
    "legacy_imagen_formato": null,
    "legacy_imagen_fecha_carga": null,
    "legacy_imagen_created_at": null,
    "legacy_imagen_updated_at": null,
    "valorado_en": "2026-11-14T23:06:32.000000Z",
    "analisis": null
  }
}
```

### 3.8 Intentar reemplazar foto ya valorada (error)

Petición: `POST /api/evaluaciones/1/estudiantes/7/ejercicios/linea/foto`

Cuerpo: `multipart/form-data: foto=<archivo otra.jpg>`

Respuesta: HTTP 409

```json
{
  "message": "La foto ya tiene una valoración; no se puede reemplazar.",
  "exception": "Symfony\\Component\\HttpKernel\\Exception\\HttpException"
}
```

### 3.9 Ficha del estudiante (T1 a T3 + observaciones)

Petición: `GET /api/estudiantes/7/ficha`

Cuerpo: (sin cuerpo)

Respuesta: HTTP 200

```json
{
  "data": {
    "estudiante": {
      "id": 7,
      "id_curso": 4,
      "nombre": "Estudiante de ejemplo 01",
      "fecha_nacimiento": "2020-01-01T00:00:00.000000Z",
      "created_at": "2026-11-14T23:06:32.000000Z",
      "updated_at": "2026-11-14T23:06:32.000000Z",
      "deleted_at": null,
      "curso": {
        "id": 4,
        "institution_id": 2,
        "id_docente": 4,
        "nombre": "Curso de ejemplo A",
        "nivel": "Inicial (ejemplo)",
        "gestion": "EJEMPLO",
        "created_at": "2026-11-14T23:06:32.000000Z",
        "updated_at": "2026-11-14T23:06:32.000000Z",
        "active": true
      }
    },
    "ejercicios": [
      {
        "ejercicio": "linea",
        "T1": {
          "estado": "valorado",
          "valoracion": "ED",
          "id_foto": 1
        },
        "T2": {
          "estado": null,
          "valoracion": null,
          "id_foto": null
        },
        "T3": {
          "estado": null,
          "valoracion": null,
          "id_foto": null
        }
      },
      {
        "ejercicio": "circulos",
        "T1": {
          "estado": "valorado",
          "valoracion": "NA",
          "id_foto": 2
        },
        "T2": {
          "estado": null,
          "valoracion": null,
          "id_foto": null
        },
        "T3": {
          "estado": null,
          "valoracion": null,
          "id_foto": null
        }
      },
      {
        "ejercicio": "zigzag",
        "T1": {
          "estado": "valorado",
          "valoracion": "NA",
          "id_foto": 3
        },
        "T2": {
          "estado": null,
          "valoracion": null,
          "id_foto": null
        },
        "T3": {
          "estado": null,
          "valoracion": null,
          "id_foto": null
        }
      },
      {
        "ejercicio": "espiral",
        "T1": {
          "estado": "valorado",
          "valoracion": "S",
          "id_foto": 4
        },
        "T2": {
          "estado": null,
          "valoracion": null,
          "id_foto": null
        },
        "T3": {
          "estado": null,
          "valoracion": null,
          "id_foto": null
        }
      }
    ],
    "observaciones": [
      {
        "id": 1,
        "id_estudiante": 7,
        "id_evaluacion": 1,
        "texto": "Sostiene el lápiz con pinza inmadura; repetir en el próximo trimestre.",
        "autor": 4,
        "legacy_foto_id": null,
        "created_at": "2026-11-14T23:06:32.000000Z",
        "updated_at": "2026-11-14T23:06:32.000000Z",
        "autor_usuario": {
          "id": 4,
          "nombre": "Docente de ejemplo"
        }
      }
    ]
  }
}
```

### 3.10 Informe del curso, trimestre 1

Petición: `GET /api/informes/curso/4?trimestre=1`

Cuerpo: (sin cuerpo)

Respuesta: HTTP 200

```json
{
  "data": {
    "curso_id": 4,
    "trimestre": 1,
    "conteos": {
      "linea": {
        "S": 0,
        "ED": 1,
        "NA": 0
      },
      "circulos": {
        "S": 0,
        "ED": 0,
        "NA": 1
      },
      "zigzag": {
        "S": 0,
        "ED": 0,
        "NA": 1
      },
      "espiral": {
        "S": 1,
        "ED": 0,
        "NA": 0
      }
    },
    "completitud": {
      "estudiantes_completos": 1,
      "total_estudiantes": 6
    },
    "requieren_observacion": [
      {
        "id": 7,
        "nombre": "Estudiante de ejemplo 01",
        "cantidad_NA": 2
      }
    ]
  }
}
```

### 3.11 Etapas de procesamiento de una foto

Petición: `GET /api/fotos/1/etapas`

Cuerpo: (sin cuerpo)

Respuesta: HTTP 200

```json
{
  "data": {
    "original": null,
    "grises": null,
    "trazo": null,
    "esqueleto": null
  }
}
```

### 3.12 Cursos de la institución (Dirección)

Petición: `GET /api/direccion/cursos`

Cuerpo: (sin cuerpo)

Respuesta: HTTP 200

```json
{
  "data": [
    {
      "id": 4,
      "curso": "Curso de ejemplo A",
      "docente": "Docente de ejemplo",
      "evaluacion_completa": false,
      "valoraciones": {
        "S": 1,
        "ED": 1,
        "NA": 2
      },
      "completitud": 16.7,
      "trimestre": 1
    },
    {
      "id": 5,
      "curso": "Curso de ejemplo B",
      "docente": "Docente de ejemplo",
      "evaluacion_completa": false,
      "valoraciones": {
        "S": 0,
        "ED": 0,
        "NA": 0
      },
      "completitud": 0,
      "trimestre": null
    }
  ]
}
```

### 3.13 Dirección consulta el cuadro (solo lectura)

Petición: `GET /api/cursos/4/evaluaciones/1`

Cuerpo: (sin cuerpo)

Respuesta: HTTP 200

```json
{
  "data": {
    "evaluacion": {
      "id": 1,
      "id_curso": 4,
      "trimestre": 1,
      "nivel": 2,
      "tamano_figura_mm": 80,
      "fecha": "2026-11-14T00:00:00.000000Z",
      "created_at": "2026-11-14T23:06:32.000000Z",
      "updated_at": "2026-11-14T23:06:32.000000Z"
    },
    "ejercicios": [
      {
        "ejercicio": "linea",
        "id_ejercicio": 1,
        "nombre": "Trazo de Línea Recta"
      },
      {
        "ejercicio": "circulos",
        "id_ejercicio": 2,
        "nombre": "Trazo de Círculo"
      },
      {
        "ejercicio": "zigzag",
        "id_ejercicio": 4,
        "nombre": "Trazo de Zigzag"
      },
      {
        "ejercicio": "espiral",
        "id_ejercicio": 3,
        "nombre": "Trazo de Espiral"
      }
    ],
    "estudiantes": [
      {
        "id_estudiante": 7,
        "nombre": "Estudiante de ejemplo 01",
        "ejercicios": [
          {
            "ejercicio": "linea",
            "id_ejercicio": 1,
            "nombre": "Trazo de Línea Recta",
            "id_foto": 1,
            "estado": "valorado",
            "valoracion": "ED",
            "analisis_disponible": false
          },
          {
            "ejercicio": "circulos",
            "id_ejercicio": 2,
            "nombre": "Trazo de Círculo",
            "id_foto": 2,
            "estado": "valorado",
            "valoracion": "NA",
            "analisis_disponible": false
          },
          {
            "ejercicio": "zigzag",
            "id_ejercicio": 4,
            "nombre": "Trazo de Zigzag",
            "id_foto": 3,
            "estado": "valorado",
            "valoracion": "NA",
            "analisis_disponible": false
          },
          {
            "ejercicio": "espiral",
            "id_ejercicio": 3,
            "nombre": "Trazo de Espiral",
            "id_foto": 4,
            "estado": "valorado",
            "valoracion": "S",
            "analisis_disponible": false
          }
        ]
      },
      {
        "id_estudiante": 8,
        "nombre": "Estudiante de ejemplo 02",
        "ejercicios": [
          {
            "ejercicio": "linea",
            "id_ejercicio": 1,
            "nombre": "Trazo de Línea Recta",
            "id_foto": 5,
            "estado": "sin_foto",
            "valoracion": null,
            "analisis_disponible": false
          },
          {
            "ejercicio": "circulos",
            "id_ejercicio": 2,
            "nombre": "Trazo de Círculo",
            "id_foto": 6,
            "estado": "sin_foto",
            "valoracion": null,
            "analisis_disponible": false
          },
          {
            "ejercicio": "zigzag",
            "id_ejercicio": 4,
            "nombre": "Trazo de Zigzag",
            "id_foto": 7,
            "estado": "sin_foto",
            "valoracion": null,
            "analisis_disponible": false
          },
          {
            "ejercicio": "espiral",
            "id_ejercicio": 3,
            "nombre": "Trazo de Espiral",
            "id_foto": 8,
            "estado": "sin_foto",
            "valoracion": null,
            "analisis_disponible": false
          }
        ]
      },
      "... (4 estudiantes más, recortado)"
    ]
  }
}
```

### 3.14 Dirección consulta la ficha

Petición: `GET /api/estudiantes/7/ficha`

Cuerpo: (sin cuerpo)

Respuesta: HTTP 200

```json
{
  "data": {
    "estudiante": {
      "id": 7,
      "id_curso": 4,
      "nombre": "Estudiante de ejemplo 01",
      "fecha_nacimiento": "2020-01-01T00:00:00.000000Z",
      "created_at": "2026-11-14T23:06:32.000000Z",
      "updated_at": "2026-11-14T23:06:32.000000Z",
      "deleted_at": null,
      "curso": {
        "id": 4,
        "institution_id": 2,
        "id_docente": 4,
        "nombre": "Curso de ejemplo A",
        "nivel": "Inicial (ejemplo)",
        "gestion": "EJEMPLO",
        "created_at": "2026-11-14T23:06:32.000000Z",
        "updated_at": "2026-11-14T23:06:32.000000Z",
        "active": true
      }
    },
    "ejercicios": [
      {
        "ejercicio": "linea",
        "T1": {
          "estado": "valorado",
          "valoracion": "ED",
          "id_foto": 1
        },
        "T2": {
          "estado": null,
          "valoracion": null,
          "id_foto": null
        },
        "T3": {
          "estado": null,
          "valoracion": null,
          "id_foto": null
        }
      },
      {
        "ejercicio": "circulos",
        "T1": {
          "estado": "valorado",
          "valoracion": "NA",
          "id_foto": 2
        },
        "T2": {
          "estado": null,
          "valoracion": null,
          "id_foto": null
        },
        "T3": {
          "estado": null,
          "valoracion": null,
          "id_foto": null
        }
      },
      {
        "ejercicio": "zigzag",
        "T1": {
          "estado": "valorado",
          "valoracion": "NA",
          "id_foto": 3
        },
        "T2": {
          "estado": null,
          "valoracion": null,
          "id_foto": null
        },
        "T3": {
          "estado": null,
          "valoracion": null,
          "id_foto": null
        }
      },
      {
        "ejercicio": "espiral",
        "T1": {
          "estado": "valorado",
          "valoracion": "S",
          "id_foto": 4
        },
        "T2": {
          "estado": null,
          "valoracion": null,
          "id_foto": null
        },
        "T3": {
          "estado": null,
          "valoracion": null,
          "id_foto": null
        }
      }
    ],
    "observaciones": [
      {
        "id": 1,
        "id_estudiante": 7,
        "id_evaluacion": 1,
        "texto": "Sostiene el lápiz con pinza inmadura; repetir en el próximo trimestre.",
        "autor": 4,
        "legacy_foto_id": null,
        "created_at": "2026-11-14T23:06:32.000000Z",
        "updated_at": "2026-11-14T23:06:32.000000Z",
        "autor_usuario": {
          "id": 4,
          "nombre": "Docente de ejemplo"
        }
      }
    ]
  }
}
```

### 3.15 Dirección consulta el informe del curso

Petición: `GET /api/informes/curso/4?trimestre=1`

Cuerpo: (sin cuerpo)

Respuesta: HTTP 403

```json
{
  "message": "No tiene permisos para acceder a este recurso."
}
```

### 3.16 Dirección intenta valorar (error)

Petición: `PUT /api/evaluaciones/1/estudiantes/7/ejercicios/linea/valoracion`

Cuerpo:

```json
{
  "valoracion": "S"
}
```

Respuesta: HTTP 403

```json
{
  "message": "No tiene permisos para acceder a este recurso."
}
```

### 3.17 Dirección consulta /api/cursos

Petición: `GET /api/cursos`

Cuerpo: (sin cuerpo)

Respuesta: HTTP 403

```json
{
  "message": "No tiene permisos para acceder a este recurso."
}
```

### 3.18 Endpoints de FastAPI llamados por Laravel

Están documentados en `07_pipeline_y_modelo.md`. No se capturó una respuesta real de `/api/analyze` desde Laravel, porque en la configuración local `ANALISIS_HABILITADO` no está definido (vale `false`) y `AI_SERVICE_TOKEN` no está en `.env`.
