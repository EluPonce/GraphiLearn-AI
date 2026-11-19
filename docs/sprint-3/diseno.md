# Sprint 3 — Diseño de Arquitectura y Datos

## 1.5. Diseño de la Arquitectura

La arquitectura de GraphiLearn AI en el Sprint 3 consolida un modelo desacoplado en capas y microservicios, optimizado para la separación entre la gestión académica relacional y el procesamiento intensivo de visión por computadora.

---

### 1.5.1. Diagrama de Despliegue

El diagrama siguiente describe la distribución de los componentes del sistema en sus respectivos entornos de ejecución:

```mermaid
flowchart TD
    subgraph Cliente["Dispositivo del Usuario (PC / Tablet / Teléfono)"]
        Browser["Navegador Web (Chrome / Edge / Firefox)"]
        SPA["Cliente SPA (React 19 + Vite 7)"]
        Camera["Cámara del Dispositivo / Selector de Archivo"]
        Browser --> SPA
        SPA --> Camera
    end

    subgraph ServidorWeb["Servidor de Aplicación (Laravel 12 / PHP 8.2)"]
        WebRoutes["Enrutador Web & API REST v1 (/api/v1)"]
        SanctumMiddleware["Middleware Sanctum & CheckRole"]
        Controllers["Controladores (Evaluaciones, Cursos, Estudiantes)"]
        StoragePrivado["Almacenamiento en Disco Privado<br/>(storage/app/private/graphilearn/...)"]
        FastApiClient["Cliente HTTP FastApiClient"]

        WebRoutes --> SanctumMiddleware --> Controllers
        Controllers --> StoragePrivado
        Controllers --> FastApiClient
    end

    subgraph ServidorBD["Servidor de Base de Datos"]
        Postgres["PostgreSQL 17 (graphilearn)<br/>Puerto: 5432"]
    end

    subgraph ServidorIA["Servidor de Procesamiento de IA (FastAPI / Python 3.14)"]
        FastAPIEndpoint["FastAPI REST API<br/>Puerto: 8001"]
        TokenAuth["Middleware de Seguridad Token Interno<br/>(X-Internal-Token)"]
        OpenCVPipeline["Pipeline OpenCV 5 & NumPy<br/>(Filtro bilateral, Otsu, Zhang-Suen)"]
        FeatureEngine["Extractor de Características & Indicadores"]

        FastAPIEndpoint --> TokenAuth --> OpenCVPipeline --> FeatureEngine
    end

    SPA -->|HTTPS / HTTP JSON<br/>Bearer Token Sanctum| WebRoutes
    SPA -->|Multipart Form Data<br/>Fotografía del trazo| WebRoutes
    Controllers -->|SQL / PDO PostgreSQL| Postgres
    FastApiClient -->|HTTP POST Multipart<br/>X-Internal-Token /api/analyze| FastAPIEndpoint
```

---

### 1.5.2. Diagrama de Paquetes (Organizado en Capas)

Siguiendo la metodología de Martínez Canedo, los componentes de software se organizan en cuatro capas arquitectónicas:

```mermaid
flowchart TB
    subgraph CapaEspecifica["Capa Específica (Presentación e Interfaz)"]
        ReactViews["Vistas React:<br/>ProgrammedActivitiesView, ActivityDetailView,<br/>StudentProgressView, StudentReportsView, CoursesView"]
        ApiControllers["Controladores Laravel API v1:<br/>ScheduledActivityController, ActivityEvaluationController,<br/>StudentProgressController, CourseProgressController, EvaluationFlowController"]
        AiRouters["Routers FastAPI:<br/>routers/analysis.py, routers/models.py"]
    end

    subgraph CapaGeneral["Capa General (Servicios de Aplicación y Políticas)"]
        LaravelServices["Servicios Laravel:<br/>ImageUploadService, ImageValidationService,<br/>FastApiClient, AnalysisService"]
        LaravelPolicies["Políticas de Acceso:<br/>CoursePolicy, StudentPolicy, ActividadPolicy"]
        AiServices["Servicios Python:<br/>preprocessing.py, skeletonization.py,<br/>features.py, indicators.py, classifier.py"]
    end

    subgraph CapaInterna["Capa Interna (Dominio, Modelos y Esquemas)"]
        EloquentModels["Modelos Eloquent:<br/>ScheduledActivity, ScheduledActivityExercise,<br/>Actividad / FotoEjercicio, ActivityEvaluationHistory,<br/>Observacion, Student, Course, Exercise, User"]
        PydanticSchemas["Esquemas Pydantic:<br/>AnalyzeResponseSchema, GeometricFeaturesSchema,<br/>QuantitativeIndicatorsSchema"]
        Resources["Resources API:<br/>ScheduledActivityResource, StudentProgressResource,<br/>AnalysisResultResource"]
    end

    subgraph CapaSistema["Capa de Sistema (Infraestructura y Persistencia)"]
        DBDriver["PostgreSQL 17 (Driver PDO PgSQL)"]
        FileStorage["Disco Privado Local (Flysystem)"]
        HttpTransport["Guzzle HTTP Client / Starlette TestClient"]
        CVPkg["OpenCV (cv2), NumPy, scikit-learn, SciPy"]
    end

    ReactViews --> ApiControllers
    ApiControllers --> LaravelServices
    ApiControllers --> LaravelPolicies
    ApiControllers --> EloquentModels
    ApiControllers --> Resources

    LaravelServices --> EloquentModels
    LaravelServices --> FileStorage
    LaravelServices --> HttpTransport

    HttpTransport --> AiRouters
    AiRouters --> AiServices
    AiRouters --> PydanticSchemas
    AiServices --> CVPkg

    EloquentModels --> DBDriver
```

---

## 1.6. Diseño de Datos

### 1.6.1. Diagrama de Clases

El diagrama de clases para el Sprint 3 modela las programaciones multiejercicio, la ejecución individual por estudiante, el almacenamiento de la fotografía privada, los resultados cuantitativos y la auditoría de valoraciones docentes:

```mermaid
classDiagram
    class User {
        +BigInteger id
        +String nombre
        +String correo
        +String password
        +Enum rol
        +Boolean active
        +puedoAccederAlCurso(Course) Boolean
    }

    class Course {
        +BigInteger id
        +BigInteger institution_id
        +BigInteger id_docente
        +String nombre
        +String nivel
        +String gestion
        +Boolean active
    }

    class Student {
        +BigInteger id
        +BigInteger id_curso
        +String nombre
        +Date fecha_nacimiento
        +Timestamp deleted_at
    }

    class Exercise {
        +BigInteger id
        +String nombre
        +Enum tipo_trazo
        +String descripcion
        +Boolean activo
    }

    class ScheduledActivity {
        +BigInteger id
        +BigInteger id_curso
        +BigInteger created_by
        +String nombre
        +String instrucciones
        +String period_reference
        +Date scheduled_date
        +Boolean active
    }

    class ScheduledActivityExercise {
        +BigInteger id
        +BigInteger scheduled_activity_id
        +BigInteger exercise_id
        +Integer position
    }

    class Actividad {
        +BigInteger id
        +BigInteger id_estudiante
        +BigInteger id_ejercicio
        +BigInteger scheduled_activity_id
        +Date fecha
        +Enum estado
        +String ruta_imagen
        +Enum pedagogical_rating
        +Text pedagogical_observations
        +BigInteger evaluated_by
        +Timestamp valorado_en
    }

    class AnalysisResult {
        +BigInteger id
        +BigInteger actividad_id
        +Json caracteristicas_geometricas
        +Json indicadores_cuantitativos
        +String risk_label
        +Float risk_score
        +Enum sugerencia
        +Json detalles_computacionales
        +Enum estado_revision
    }

    class ActivityEvaluationHistory {
        +BigInteger id
        +BigInteger actividad_id
        +BigInteger changed_by
        +Enum previous_rating
        +Text previous_observations
        +Timestamp created_at
    }

    class Observacion {
        +BigInteger id
        +BigInteger id_estudiante
        +BigInteger id_evaluacion
        +BigInteger id_ejercicio
        +BigInteger autor
        +Text texto
        +Timestamp created_at
    }

    User "1" --> "0..*" Course : imparte
    Course "1" --> "1..*" Student : inscribe
    Course "1" --> "0..*" ScheduledActivity : programa
    ScheduledActivity "1" --> "1..*" ScheduledActivityExercise : contiene
    Exercise "1" --> "0..*" ScheduledActivityExercise : referencia
    Student "1" --> "0..*" Actividad : realiza
    Exercise "1" --> "0..*" Actividad : tipo
    ScheduledActivity "0..1" --> "0..*" Actividad : genera
    Actividad "1" --> "0..1" AnalysisResult : produce
    Actividad "1" --> "0..*" ActivityEvaluationHistory : audita_cambios
    User "1" --> "0..*" ActivityEvaluationHistory : modificado_por
    Student "1" --> "0..*" Observacion : tiene
    User "1" --> "0..*" Observacion : redacta
```

---

### 1.6.2. Mapeo Relacional (Diccionario de Datos)

A continuación se presenta el mapeo de las tablas creadas o ampliadas en el Sprint 3:

#### Tabla: `scheduled_activities` (Actividades Programadas)
| Columna | Tipo | Clave | Restricciones / Descripción |
|---|---|---|---|
| `id` | BIGSERIAL | PK | Identificador único de la programación |
| `id_curso` | BIGINT | FK | Referencia a `courses(id)` ON DELETE CASCADE |
| `created_by` | BIGINT | FK | Referencia a `users(id)` ON DELETE SET NULL |
| `nombre` | VARCHAR(255) | | Nombre de la actividad programada |
| `instrucciones`| TEXT | Nullable | Pautas e instrucciones pedagógicas |
| `period_reference` | VARCHAR(100) | Nullable | Periodo lectivo (ej. "1er Trimestre", "Diagnóstico") |
| `scheduled_date` | DATE | Nullable | Fecha programada para la aplicación |
| `active` | BOOLEAN | Default true | Estado activo / desactivado |
| `deleted_at` | TIMESTAMP | Nullable | Borrado lógico (SoftDeletes) |

#### Tabla: `scheduled_activity_exercises` (Pivote Ordenada de Ejercicios)
| Columna | Tipo | Clave | Restricciones / Descripción |
|---|---|---|---|
| `id` | BIGSERIAL | PK | Identificador único del ítem |
| `scheduled_activity_id`| BIGINT | FK | Referencia a `scheduled_activities(id)` ON DELETE CASCADE |
| `exercise_id` | BIGINT | FK | Referencia a `exercises(id)` ON DELETE RESTRICT |
| `position` | INT | Default 1 | Orden del ejercicio dentro de la evaluación |
| *Índice Único* | UNIQUE | | `(scheduled_activity_id, exercise_id)` |
| *Índice Único* | UNIQUE | | `(scheduled_activity_id, position)` |

#### Tabla: `actividades` / `fotos_ejercicio` (Ejecuciones Individuales de Ejercicio)
| Columna | Tipo | Clave | Restricciones / Descripción |
|---|---|---|---|
| `id` | BIGSERIAL | PK | Identificador de la ejecución individual |
| `id_estudiante` | BIGINT | FK | Referencia a `students(id)` ON DELETE CASCADE |
| `id_ejercicio` | BIGINT | FK | Referencia a `exercises(id)` ON DELETE RESTRICT |
| `scheduled_activity_id`| BIGINT | FK | Nullable, referencia a `scheduled_activities(id)` |
| `fecha` | DATE | | Fecha en que se realizó el trazo |
| `estado` | VARCHAR(50) | Check | `'pendiente'`, `'procesando'`, `'procesado'`, `'error'` (o `'sin_foto'`, `'foto_lista'`, `'valorado'`) |
| `ruta_imagen` | VARCHAR(255)| Nullable | Ruta relativa en `storage/app/private/` (nombre UUID) |
| `pedagogical_rating` / `valoracion` | VARCHAR(10) | Check | Nullable: `'S'`, `'ED'`, `'NA'` (Escala oficial) |
| `pedagogical_observations` | TEXT | Nullable | Comentario cualitativo del docente |
| `evaluated_by` / `valorado_por` | BIGINT | FK | Nullable, referencia a `users(id)` |
| `valorado_en` | TIMESTAMP | Nullable | Fecha y hora en que se emitió la valoración |
| *Índice Único* | UNIQUE | | `(scheduled_activity_id, id_estudiante, id_ejercicio)` |

#### Tabla: `activity_evaluation_history` (Historial Inmutable de Auditoría)
| Columna | Tipo | Clave | Restricciones / Descripción |
|---|---|---|---|
| `id` | BIGSERIAL | PK | Identificador del evento de auditoría |
| `actividad_id` | BIGINT | FK | Referencia a `actividades(id)` ON DELETE CASCADE |
| `changed_by` | BIGINT | FK | Referencia a `users(id)` ON DELETE SET NULL |
| `previous_rating` | VARCHAR(10) | Nullable | Calificación anterior (S, ED, NA) |
| `previous_observations`| TEXT | Nullable | Texto de observación anterior |
| `created_at` | TIMESTAMP | | Fecha y hora exacta en que se produjo la modificación |

---

## 2. Actividades a realizar durante la ejecución del sprint (R-3)

### 2.1. Lógica de Negocio

#### 2.1.1. Diagrama de Secuencia 1: Carga de Fotografía y Procesamiento con IA

El siguiente diagrama muestra el flujo desde que la docente selecciona o captura la fotografía de un trazo, pasando por la validación y el envío seguro con token hacia FastAPI, hasta la persistencia del resultado computacional:

```mermaid
sequenceDiagram
    autonumber
    actor Docente as Docente (Navegador)
    participant Laravel as Laravel Backend (API v1)
    participant Disk as Disco Privado (Storage)
    participant DB as PostgreSQL
    participant FastAPI as Microservicio IA (FastAPI)

    Docente->>Laravel: POST /actividades/{id}/imagen (Multipart: archivo JPG/PNG)
    Laravel->>Laravel: Validar MIME (image/jpeg, image/png), tamaño <= 5MB y dimensiones >= 640x480
    Laravel->>Disk: Guardar archivo con UUID privado en storage/app/private/
    Laravel->>DB: Actualizar ruta_imagen y estado = 'foto_lista'
    
    opt Si ANALISIS_HABILITADO = true
        Laravel->>Disk: Leer bytes de la imagen privada
        Laravel->>FastAPI: POST /api/analyze (Multipart: file, tipo_esperado, Header: X-Internal-Token)
        FastAPI->>FastAPI: Verificar X-Internal-Token vs GRAPHILEARN_INTERNAL_TOKEN
        FastAPI->>FastAPI: Preprocesamiento OpenCV + Adelgazamiento Zhang-Suen
        FastAPI->>FastAPI: Calcular características geométricas y 4 indicadores
        FastAPI-->>Laravel: 200 OK con JSON (indicadores, características, sugerencia)
        Laravel->>DB: Guardar en analysis_results (indicadores, características, estado = 'procesado')
    end

    Laravel-->>Docente: 201 Created (Datos de actividad, imagen cargada y métricas listas)
```

---

#### 2.1.2. Diagrama de Secuencia 2: Valoración Pedagógica Manual y Auditoría en Historial

Este diagrama detalla cómo la docente emite su calificación cualitativa (S / ED / NA) respetando el principio *Human-in-the-Loop*, y cómo el sistema garantiza la trazabilidad inmutable:

```mermaid
sequenceDiagram
    autonumber
    actor Docente as Docente (Navegador)
    participant Controller as ActivityEvaluationController
    participant Policy as ActividadPolicy
    participant Historial as ActivityEvaluationHistory
    participant DB as PostgreSQL

    Docente->>Controller: PUT /api/v1/actividades/{id}/evaluacion (rating: 'S'|'ED'|'NA', observaciones: '...')
    Controller->>Policy: Verificar autorización (puedeAccederAlCurso)
    Policy-->>Controller: Autorizado (es la docente titular)
    
    Controller->>DB: Consultar registro actual de la actividad
    alt Ya existía una valoración u observación previa
        Controller->>Historial: create(actividad_id, changed_by, previous_rating, previous_observations, created_at)
        Historial->>DB: INSERT en activity_evaluation_history (Snapshot inmutable)
    end

    Controller->>DB: UPDATE actividades SET pedagogical_rating = rating, pedagogical_observations = obs, evaluated_by = user.id, valorado_en = now(), estado = 'valorado'
    Controller-->>Docente: 200 OK (Valoración registrada con éxito y trazabilidad actualizada)
```
