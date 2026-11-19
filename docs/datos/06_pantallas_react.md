# 06 · Pantallas React

La SPA no tiene URLs por pantalla: `routes/web.php` sirve la misma vista para cualquier ruta que no sea `/api`, y `App.jsx` decide qué mostrar según el estado `currentView`. En la columna "Ruta" va ese valor interno.

## 1. Pantallas que existen hoy

| Pantalla | Ruta (`currentView`) | Acceso desde el menú | Qué muestra |
|---|---|---|---|
| Ingreso institucional | (sin sesión) | — | Formulario de correo y contraseña |
| Mis cursos / Cursos | `courses` | docente ("Mis cursos"), direccion ("Cursos") | Lista de cursos (`/api/v1/cursos`). Al abrir uno: datos del aula, totales de "Ejercicios realizados" y "Con valoración docente" por ejercicio (`/seguimiento`), estudiantes inscritos con botón "Abrir ficha" (solo docente) y actividades programadas |
| Ficha de seguimiento | `student-profile` | docente, desde "Abrir ficha" | Pestañas **Evaluar** (actividades programadas del curso y ejercicios con estado), **Observaciones** (una por cada trabajo valorado) e **Historial** (fotos, 11 indicadores, sugerencia experimental si existe y comparación entre periodos) |
| Informes | `reports` | docente | Selección de un estudiante e historial de sus evaluaciones (`/students/{id}/progress`) |
| Registrar trabajo del estudiante | `new-activity` | docente, desde la ficha | Selección de la programación y el ejercicio; intenta `POST /api/v1/actividades` (ruta inexistente) |
| Trabajos de los estudiantes | `activities`, `analysis` | no está en el menú | Lista de trabajos |
| Detalle del trabajo | `activity-detail`, `analysis-detail` | no está en el menú | Tomar o subir foto, procesar y valorar; usa rutas inexistentes (ver `05_clases_y_componentes.md` §8) |
| Panel | `dashboard` | no está en el menú | Tarjetas de métricas; las claves no coinciden con la respuesta del backend, así que muestra "—" |
| Gestión de estudiantes | `students` | no está en el menú | CRUD de estudiantes, importación CSV y ficha administrativa (la escritura no tiene backend) |
| Ejercicios grafomotores | `exercises` | no está en el menú | CRUD de ejercicios (la escritura no tiene backend) |
| Evaluaciones programadas | `programmed-activities` | no está en el menú | CRUD de programaciones (la escritura no tiene backend) |
| Gestión de docentes | `teachers` | administrador; no está en el menú | CRUD de docentes (`/api/v1/docentes` no existe) |
| Versiones de modelos de IA | `model-versions` | administrador (pantalla inicial) | Formulario para registrar una versión (nombre, versión, algoritmo, ruta del artefacto, descripción), lista de versiones y botón para activar o desactivar |
| Perfil | `profile` | todos | Datos del usuario en sesión |

`AnalysisView.jsx` existe, pero `App.jsx` no la importa.

## 2. Comparación con el flujo esperado

| Punto del flujo | Estado | Evidencia |
|---|---|---|
| **Mis cursos** | **PARCIAL** | Existe la pantalla `courses` (`CoursesView.jsx`), pero consume `/api/v1/cursos` (`CourseController@index`) y no `/api/cursos` (`EvaluationFlowController@courses`). Por eso **no** muestra el trimestre actual, el nivel ni "estudiantes completos / total". El backend de esa versión sí existe (ver `03_api.md` §3.1) |
| **Cuadro de evaluación estudiantes × 4 ejercicios con tabs de trimestre** | **NO ENCONTRADO** (en React) | No hay ninguna vista que llame a `GET /api/cursos/{id}/evaluaciones/{trimestre}` ni a `POST /api/evaluaciones`, y no hay pestañas T1/T2/T3. `Sidebar.jsx` menciona los identificadores `course-evaluation` y `evaluation-capture`, pero `App.jsx` no renderiza nada con esos valores. **Backend: IMPLEMENTADO** (`EvaluationFlowController@grid` y `@create`, con pruebas) |
| **Captura en 3 pasos (foto → análisis → valoración S/ED/NA)** | **NO ENCONTRADO** (en React con el flujo nuevo) | `ActivityDetailView.jsx` tiene foto, procesar y valorar, pero contra rutas del diseño anterior que no existen (`POST /api/v1/actividades/{id}/imagen`, `/procesar`, `PUT /evaluacion`). No llama a `POST .../foto` ni a `PUT .../valoracion`. **Backend: IMPLEMENTADO** (foto + análisis opcional en una llamada, valoración en otra) |
| **Ficha del estudiante con T1 a T3 y observaciones** | **PARCIAL** | Existe `StudentProgressView.jsx` con pestañas Evaluar, Observaciones e Historial, pero lee `/api/v1/students/{id}/progress` (formato legado por programaciones), **no** `/api/estudiantes/{id}/ficha`. No hay una tabla ejercicio × T1/T2/T3. Las observaciones se muestran desde `pedagogical_observations`, que `LegacyReadController` siempre devuelve en `null`. Editar una observación llama a una ruta inexistente. **Backend: IMPLEMENTADO** (`studentSheet`) |
| **Informes del curso** | **PARCIAL** | La pantalla "Informes" (`StudentReportsView.jsx`) es **por estudiante**, no por curso. No consume `/api/informes/curso/{id}`. **Backend: IMPLEMENTADO** (`report`: conteos S/ED/NA por ejercicio, completitud y estudiantes con ≥ 2 NA) |
| **Vista de Dirección en solo lectura** | **PARCIAL** | El menú de Dirección solo tiene "Cursos" y "Perfil", con la etiqueta "Dirección · Solo lectura". La lista de cursos funciona (`/api/v1/cursos`), pero no se usa `/api/direccion/cursos` (completitud % y conteo S/ED/NA), y el botón "Abrir ficha" está oculto para Dirección. **Backend: IMPLEMENTADO** y verificado (Dirección recibe 403 al intentar valorar) |
| **Versiones del modelo (administrador)** | **IMPLEMENTADO** (pantalla y API) | `ModelVersionsView.jsx` + `ModelVersionController`. Limitación funcional: no se puede activar ningún modelo porque `ai-service/models/manifest.json` está vacío (ver `07_pipeline_y_modelo.md`) |

## 3. Resumen

El flujo nuevo (evaluación por curso y trimestre, cuadro de 4 ejercicios, foto, valoración, ficha T1–T3, informe del curso y vista de Dirección) está **implementado y probado en el backend** (`/api/...`), pero **el frontend React no lo consume**. Las pantallas actuales siguen el diseño anterior ("actividades programadas" y "trabajos") y leen datos a través del puente `LegacyReadController`. Las acciones de escritura de esas pantallas (subir foto, procesar, valorar, CRUD) apuntan a rutas que ya no están registradas, así que hoy **no se puede registrar una valoración desde la interfaz**.

No se ejecutó la interfaz en un navegador. Este análisis sale de leer el código de `resources/js` y compararlo con `php artisan route:list`.
