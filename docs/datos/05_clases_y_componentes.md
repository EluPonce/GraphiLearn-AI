# 05 · Clases y componentes

Rutas relativas a `GraphiLearn/` salvo que se indique otra cosa. "Activo" significa que la clase se alcanza desde alguna ruta registrada. "Sin uso" significa que existe pero ninguna ruta llega a ella.

## 1. Modelos Eloquent

| Modelo | Tabla | Relaciones | Estado |
|---|---|---|---|
| `User` (`app/Models/User.php`) | `users` | `institucion()` belongsTo Institution · `cursos()` hasMany Course (`id_docente`) · helpers `esAdministrador/esDocente/esDireccion`, `puedeAccederAlCurso`, `cursosAccesibles`, `puedeAccederAlEstudiante` | Activo |
| `Institution` (`app/Models/Institution.php`) | `institutions` | `usuarios()` hasMany User · `cursos()` hasMany Course | Activo |
| `Course` (`app/Models/Course.php`) | `courses` | `institucion()` belongsTo · `docente()` belongsTo User · `estudiantes()` hasMany Student · `scheduledActivities()` hasMany · `evaluaciones()` hasMany Evaluacion | Activo |
| `Student` (`app/Models/Student.php`) | `students` (SoftDeletes) | `curso()` belongsTo Course · `actividades()` hasMany FotoEjercicio · `fotosEjercicio()` hasMany FotoEjercicio (duplicada de la anterior) · `observaciones()` hasMany | Activo |
| `Exercise` (`app/Models/Exercise.php`) | `exercises` | `actividades()` hasMany FotoEjercicio · `tieneActividades()` | Activo |
| `Evaluacion` (`app/Models/Evaluacion.php`) | `evaluaciones` | `curso()` belongsTo Course · `fotos()` hasMany FotoEjercicio · `observaciones()` hasMany | Activo |
| `FotoEjercicio` (`app/Models/FotoEjercicio.php`) | `fotos_ejercicio` | `evaluacion()`, `estudiante()`, `ejercicio()`, `valoradoPor()` belongsTo · `analisis()` hasOne Analisis | Activo |
| `Analisis` (`app/Models/Analisis.php`) | `analisis` | `foto()` belongsTo FotoEjercicio · `modelo()` belongsTo ModelVersion | Activo |
| `Observacion` (`app/Models/Observacion.php`) | `observaciones` | `estudiante()`, `evaluacion()`, `autorUsuario()` belongsTo | Activo |
| `ModelVersion` (`app/Models/ModelVersion.php`) | `model_versions` | `analysisResults()` hasMany **AnalysisResult** (modelo antiguo) · `creator()` belongsTo User · `scopeActive` | Activo |
| `ScheduledActivity` (`app/Models/ScheduledActivity.php`) | `scheduled_activities` (SoftDeletes) | `course()`, `exercise()`, `creator()` belongsTo · `exercises()` belongsToMany (pivote `scheduled_activity_exercises`, `position`) · `executions()` hasMany FotoEjercicio | Solo lectura (legado) |
| `ActivityEvaluationHistory` (`app/Models/ActivityEvaluationHistory.php`) | `activity_evaluation_history` | `changedBy()` belongsTo User | Sin uso (el controlador legado consulta la tabla con `DB::table`) |
| `Actividad` (`app/Models/Actividad.php`) | `actividades` (**ya no existe**) | estudiante, ejercicio, imagen, analysisResult, scheduledActivity, evaluatedBy, evaluationHistory | Sin uso; roto |
| `Imagen` (`app/Models/Imagen.php`) | `imagenes` (**eliminada**) | `actividad()` | Sin uso; roto |
| `AnalysisResult` (`app/Models/AnalysisResult.php`) | `analysis_results` (**renombrada**) | actividad, imagen, modelVersion | Sin uso; roto |

## 2. Services

| Clase | Archivo | Responsabilidad | Estado |
|---|---|---|---|
| `FastApiClient` | `app/Services/FastApiClient.php` | Cliente HTTP autenticado hacia el microservicio (análisis, estado, cargar/descargar modelo) | Activo |
| `AnalysisService` | `app/Services/AnalysisService.php` | Orquestaba el análisis de una `Actividad` y guardaba un `AnalysisResult` | Sin uso (solo lo usa `AnalysisController`, que no tiene ruta) |
| `ImageUploadService` | `app/Services/ImageUploadService.php` | Guardaba la imagen de una `Actividad` en `graphilearn/imagenes/` | Sin uso |
| `ImageValidationService` | `app/Services/ImageValidationService.php` | Valida MIME real, ≤ 5 MB y resolución mínima de 640×480 | Sin uso (el flujo nuevo **no** valida la resolución) |
| `ActividadService` | `app/Services/ActividadService.php` | Consulta de actividades según el rol | Sin uso |

## 3. Controllers (`app/Http/Controllers/Api/V1/`)

| Controller | Responsabilidad | Estado |
|---|---|---|
| `AuthController` | Login, logout, me; registro deshabilitado (403) | Activo |
| `EvaluationFlowController` | Flujo nuevo: mis cursos, crear evaluación, cuadro, foto, valoración, ficha, informe, vista de Dirección, etapas | Activo (solo en `/api`, sin `/v1`) |
| `LegacyReadController` | Lectura de compatibilidad para el cliente React actual (actividades, resultado, historial, imagen, programaciones, seguimiento) sobre las tablas nuevas | Activo |
| `CourseController` | `index` y `show` con rutas; `store`, `update` y `destroy` sin ruta (y su Policy los niega) | Parcial |
| `StudentController` | `index` y `show` con rutas; `store`, `update`, `destroy` y `restore` sin ruta | Parcial |
| `ExerciseController` | `index` y `show` con rutas; `store`, `update` y `destroy` sin ruta | Parcial |
| `DashboardController` | Estadísticas por rol | Activo |
| `ModelVersionController` | Lista, registra, activa y desactiva versiones del modelo; valida que el archivo esté dentro de `AI_SERVICE_ROOT` | Activo |
| `ActividadController`, `ActivityEvaluationController`, `AnalysisController`, `ImagenController`, `ScheduledActivityController` | CRUD y procesamiento del diseño anterior | Sin uso (sus archivos de rutas no se cargan) |
| `StudentProgressController`, `CourseProgressController`, `TeacherController` | Seguimiento y gestión de docentes del diseño anterior | Sin uso (se importan, pero no se usan en las rutas) |

## 4. Policies

Ver `02_roles_y_permisos.md` §4. Activas: `CoursePolicy`, `StudentPolicy`, `ExercisePolicy`, `EvaluacionPolicy`, `FotoEjercicioPolicy`. Del diseño anterior: `ActividadPolicy`, `ImagenPolicy`.

## 5. Form Requests (`app/Http/Requests/`)

| Clase | Reglas | Estado |
|---|---|---|
| `Evaluacion/StoreEvaluacionRequest` | `id_curso` requerido y existente · `trimestre` 1–3 · `nivel` 1–3 · `tamano_figura_mm` > 0 y ≤ 500 · `fecha` opcional. `authorize`: docente | Activo |
| `FotoEjercicio/StoreFotoEjercicioRequest` | `foto` requerido, `mimes:jpg,jpeg,png`, `max:5120` (KB). `authorize`: docente | Activo |
| `Auth/LoginRequest` | `correo`, `password` | Activo |
| `Auth/RegisterRequest` | Validación de registro (el controlador igual devuelve 403) | Activo, sin efecto |
| `Student/StoreStudentRequest`, `Student/UpdateStudentRequest` | Datos del estudiante | Sin uso |
| `Exercise/StoreExerciseRequest`, `Exercise/UpdateExerciseRequest` | Datos del ejercicio | Sin uso |
| `Actividad/StoreActividadRequest`, `Imagen/UploadImagenRequest` | Diseño anterior | Sin uso |

La valoración (`PUT .../valoracion`) se valida en línea en el controlador: `valoracion` requerido `in:S,ED,NA`, `observacion` opcional, string, ≤ 5000 caracteres.

## 6. Resources (`app/Http/Resources/`)

| Resource | Campos | Estado |
|---|---|---|
| `UserResource` | id, nombre, correo, rol, active, institution_id, created_at | Activo (login, me) |
| `CourseResource` | id, nombre, nivel, gestion, active, id_docente, docente{id, nombre, correo, rol}, estudiantes_count, estudiantes, actividades_programadas, created_at | Activo |
| `StudentResource` | id, nombre, fecha_nacimiento, id_curso, administrative_status, curso{id, nombre, nivel}, created_at, deleted_at | Activo |
| `ExerciseResource` | id, nombre, tipo_trazo, descripcion, activo, created_at | Activo |
| `ActividadResource`, `AnalysisResultResource`, `ImagenResource` | Diseño anterior | Sin uso |

`EvaluationFlowController` y `LegacyReadController` **no usan Resources**: devuelven modelos o arreglos directamente. Por eso la respuesta de valoración incluye el objeto completo del usuario en `valorado_por` (ver `03_api.md`).

## 7. Cliente de FastAPI (`app/Services/FastApiClient.php`)

Configuración (`config/services.php`, clave `ai_service`):

| Clave | Variable de entorno | Valor por defecto |
|---|---|---|
| `analysis_enabled` | `ANALISIS_HABILITADO` | `false` (la clave aparece **duplicada** en el arreglo) |
| `base_url` | `AI_SERVICE_URL` | `http://127.0.0.1:8001` |
| `timeout` | `AI_SERVICE_TIMEOUT` | `30` (segundos) |
| `token` | `AI_SERVICE_TOKEN` | sin valor por defecto |
| `root_path` | `AI_SERVICE_ROOT` | `base_path('ai-service')` |

| Método | Envía | Recibe | Timeout | Si FastAPI falla |
|---|---|---|---|---|
| `analizarImagen($ruta, $tipoTrazo)` | `POST {base_url}/api/analyze`, multipart: `file` (bytes leídos del disco `private`) y `tipo_esperado`; cabecera `X-Internal-Token` | JSON; exige que existan `caracteristicas_geometricas` e `indicadores_cuantitativos` | `AI_SERVICE_TIMEOUT` (30 s) | Sin token: `AiServiceUnavailableException`. Error de conexión: `AiServiceTimeoutException` si el mensaje contiene "timeout"; si no, `AiServiceUnavailableException`. HTTP 504/408: `AiServiceTimeoutException`. Otro código distinto de 2xx: `AiServiceException`. Contrato inválido: `AiServiceException` (502). Archivo inexistente: `InvalidArgumentException` |
| `obtenerEstado()` | `GET /api/models/status` | JSON del estado | 5 s | Devuelve `['disponible' => false, 'error' => ...]` sin lanzar excepción |
| `cargarModeloEnFastApi($modelId, $version)` | `POST /api/models/load` `{model_id, version_name}` | `loaded`, `model_id` | 10 s | Devuelve `false` |
| `descargarModeloEnFastApi()` | `POST /api/models/unload` | `loaded:false` | 10 s | Devuelve `false` |

**Qué pasa en el flujo nuevo si FastAPI está caído.** En `EvaluationFlowController@upload`, la llamada está dentro de un `try/catch (\Throwable)` que solo hace `report($exception)`. La foto queda guardada con estado `foto_lista` y la respuesta es 201 con `analisis_disponible: false` y `mensaje_analisis: "Análisis no disponible por ahora."`. La docente puede valorar igual. Lo cubre la prueba `test_photo_upload_falls_back_to_manual_rating_when_fastapi_is_down`.

**Situación en el `.env` local:** `AI_SERVICE_TOKEN` no está definido, así que, aunque se activara `ANALISIS_HABILITADO`, cada llamada fallaría con "El token interno del servicio de IA no está configurado." y se aplicaría el mismo comportamiento de respaldo.

## 8. Componentes React (`resources/js/`)

La SPA no usa React Router. `App.jsx` cambia de vista con el estado `currentView`, y el menú lateral (`components/Sidebar.jsx`) depende del rol:

- docente: `courses` (Mis cursos), `reports` (Informes), `profile`
- direccion: `courses` (Cursos), `profile`
- administrador: `model-versions`, `profile`

Además, `App.jsx` carga al iniciar sesión: `GET /api/v1/students?per_page=50`, `GET /api/v1/exercises?per_page=50` y, solo para docente, `GET /api/v1/actividades?per_page=50`.

| Vista (`views/`) | `currentView` | Quién la ve | Endpoints que llama | ¿Existe la ruta en el backend? |
|---|---|---|---|---|
| `LoginView.jsx` | (sin sesión) | todos | `POST /api/v1/auth/login` | Sí |
| `CoursesView.jsx` | `courses` | todos los roles | `GET /api/v1/cursos`, `GET /api/v1/cursos/{id}`, `GET /api/v1/actividades-programadas`, `GET /api/v1/cursos/{id}/seguimiento` · solo admin: `GET /api/v1/docentes`, `POST/PUT/DELETE /api/v1/cursos` | Las GET sí; `docentes` y `POST/PUT/DELETE cursos`: **no** |
| `StudentProgressView.jsx` | `student-profile` | docente | `GET /api/v1/students/{id}/progress`, `GET /api/v1/imagenes/{id}/download`, `PUT /api/v1/actividades/{id}/evaluacion` | GET sí; **PUT no** |
| `StudentReportsView.jsx` | `reports` | docente | `GET /api/v1/students/{id}/progress` | Sí |
| `NewActivityView.jsx` | `new-activity` | docente | `GET /api/v1/actividades-programadas`, `POST /api/v1/actividades`, `GET /api/v1/actividades?id_estudiante=` | GET sí; **POST no** |
| `ActivitiesView.jsx` | `activities` / `analysis` | docente (no está en el menú) | `GET /api/v1/actividades-programadas` | Sí |
| `ActivityDetailView.jsx` | `activity-detail` / `analysis-detail` | docente | `GET /api/v1/actividades/{id}`, `GET /api/v1/imagenes/{id}/download`, `GET .../evaluacion/historial`, `POST /api/v1/actividades/{id}/imagen`, `POST /api/v1/actividades/{id}/procesar`, `PUT /api/v1/actividades/{id}/evaluacion` | GET sí; **POST imagen, POST procesar y PUT evaluacion no** |
| `AnalysisView.jsx` | — (no se importa en `App.jsx`) | — | `GET /api/v1/actividades/{id}/resultado` | Sí, pero la vista no se usa |
| `DashboardView.jsx` | `dashboard` | todos (no está en el menú) | `GET /api/v1/dashboard` | Sí, pero espera claves (`mis_cursos`, `total_estudiantes`…) distintas a las que devuelve el backend (`cursos`, `estudiantes`, `fotos`, `valoraciones`) |
| `StudentsView.jsx` | `students` | (no está en el menú) | `GET /api/v1/cursos`, `GET /api/v1/cursos/{id}`, `GET/POST/PUT/DELETE /api/v1/students`, `PATCH /api/v1/students/{id}/restore` | GET sí; escritura **no** |
| `ExercisesView.jsx` | `exercises` | (no está en el menú) | `GET/POST/PUT/PATCH /api/v1/exercises` | GET sí; escritura **no** |
| `ProgrammedActivitiesView.jsx` | `programmed-activities` | (no está en el menú) | `GET /api/v1/actividades-programadas`, `GET /api/v1/cursos`, `GET /api/v1/exercises`, `POST/PUT/PATCH /api/v1/actividades-programadas` | GET sí; escritura **no** |
| `TeachersView.jsx` | `teachers` | administrador (no está en el menú) | `GET/POST/PUT/PATCH /api/v1/docentes` | **No** |
| `ModelVersionsView.jsx` | `model-versions` | administrador | `GET/POST /api/v1/model-versions`, `POST .../activate` y `.../deactivate` | Sí |
| `ProfileView.jsx` | `profile` | todos | ninguno (muestra el usuario en sesión) | — |

Componentes: `Sidebar.jsx` (menú por rol), `Navbar.jsx` (títulos), `Modal.jsx`, `StatusBadge.jsx`. Utilidad: `utils/dateFormat.js`.

**Ninguna vista llama a los endpoints del flujo nuevo** (`/api/evaluaciones`, `/api/cursos/{id}/evaluaciones/{t}`, `/api/estudiantes/{id}/ficha`, `/api/informes/curso/{id}`, `/api/direccion/cursos`, `/api/fotos/{id}/etapas`). Una búsqueda de `evaluaciones|ficha|informes|direccion|trimestre|etapas` en `resources/js` solo encuentra textos de interfaz, no llamadas a la API.
