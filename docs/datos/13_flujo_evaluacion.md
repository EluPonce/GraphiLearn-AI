# 13 · Flujo de Evaluación en el frontend (pasos 1 a 5)

Estado al 2026-11-15. Este documento describe lo implementado para conectar React con el flujo de Evaluación, cómo se verificó y qué queda pendiente. Vocabulario: **Evaluación** (un curso en un trimestre), **Ejercicio** (línea recta, círculos, zigzag, espiral) y **Foto**.

Referencia visual y de flujo: `docs/graphilearn_prototipo.html`.

## 1. Pantallas

| Rol | Pantalla | Archivo | API que usa |
|---|---|---|---|
| Docente | Mis cursos | `resources/js/views/CoursesView.jsx` | `GET /api/v1/cursos` |
| Docente | Cuadro de la Evaluación (estudiantes × 4 Ejercicios, pestañas T1–T3, crear Evaluación) | `resources/js/views/EvaluationGridView.jsx` | `GET /api/v1/cursos/{id}/evaluaciones/{t}`, `POST /api/v1/evaluaciones` |
| Docente | Captura en 3 pasos: 1 Foto, 2 Análisis, 3 Valoración | `resources/js/views/EvaluationCaptureView.jsx` | `GET .../evaluaciones/{t}`, `POST /api/v1/evaluaciones/{e}/estudiantes/{s}/ejercicios/{ej}/foto`, `PUT .../valoracion` |
| Docente y Dirección | Ficha del estudiante (Ejercicio × T1, T2, T3) | `resources/js/views/StudentSheetView.jsx` | `GET /api/v1/estudiantes/{id}/ficha` |
| Docente | Informes (curso y trimestre) | `resources/js/views/CourseReportView.jsx` | `GET /api/v1/informes/curso/{id}?trimestre=t`, `GET /api/v1/cursos` |
| Dirección | Cursos (tabla de solo lectura) | `resources/js/views/DirectionCoursesView.jsx` | `GET /api/v1/direccion/cursos` |
| Dirección | Curso en solo lectura: resumen, cuadro y enlace a la ficha | `EvaluationGridView.jsx` (`readOnly`) + `ResumenInforme` de `CourseReportView.jsx` | `GET .../evaluaciones/{t}`, `GET /api/v1/informes/curso/{id}` |

Componentes y utilidades compartidas:

- `resources/js/components/EvaluacionChip.jsx`: chip de estado y leyenda.
- `resources/js/utils/evaluacion.js`: niveles, nombres, indicadores, rúbrica y textos fijos.
- Estilos: clases `gl-*` en `resources/css/app.css`.

Navegación (`resources/js/App.jsx`), con los valores de `currentView`:

- Docente: `courses` → `course-evaluation` → `evaluation-capture`. Desde el cuadro o el informe se pasa a `student-sheet`.
- Dirección: `courses` → `direction-course` → `student-sheet`.

### Estados de una celda del cuadro

| Chip | Significado | Condición en la API |
|---|---|---|
| S / ED / NA | Valorado | `valoracion` ∈ {S, ED, NA} |
| Analizada | Foto con análisis, falta la valoración | `estado = foto_lista` y `analisis_disponible = true` |
| Foto lista | Foto subida sin análisis, falta la valoración | `estado = foto_lista` y `analisis_disponible = false` |
| Sin foto | Sin foto | `estado = sin_foto` |

### Indicadores de la captura (paso 2)

Todos van de 0 a 1 y un valor más alto es mejor. Se calculan en el frontend a partir de los indicadores crudos de FastAPI:

| Indicador | Fórmula | Subtítulo en pantalla |
|---|---|---|
| Precisión | 1 − desviación (recortado a 0–1) | Ajuste a la plantilla |
| Firmeza | 1 − rugosidad / 1,5 (recortado a 0–1) | Suavidad del trazo |
| Fluidez | continuidad | Continuidad del trazo |
| Regularidad | regularidad | Uniformidad de la figura |

La palabra que acompaña a cada valor sigue al prototipo: **Alto** si es ≥ 0,8; **Medio** si es ≥ 0,6; **Bajo** en otro caso.

## 2. Cambios en el backend

| Cambio | Archivo |
|---|---|
| `evaluaciones.php` registrado bajo `/api/v1` | `routes/api.php` |
| Se quitó `GET cursos` de `courses.php`; Dirección usa `/direccion/cursos` | `routes/api/v1/courses.php` |
| Informe del curso, ficha y etapas abiertos a `docente,direccion` | `routes/api/v1/evaluaciones.php` |
| `PUT .../valoracion` devuelve en `valorado_por` solo `{id, nombre}` | `EvaluationFlowController@rate` |
| El cuadro devuelve `descripcion` por Ejercicio y un `analisis` resumido por celda (`indicadores`, `sugerencia`, `aviso_pedagogico`) | `EvaluationFlowController@grid` |
| La valoración guarda la observación con `id_ejercicio` | `EvaluationFlowController@rate`, `app/Models/Observacion.php` |
| La ficha devuelve `trimestres` (`id_evaluacion`, `nivel`), la `observacion` más reciente por celda y las observaciones con `trimestre`, `ejercicio` y `autor` `{id, nombre}`. El estudiante se devuelve solo con `id`, `nombre` y `curso` | `EvaluationFlowController@studentSheet` |
| `direccion/cursos` agrega `estudiantes_completos`, `total_estudiantes` y `nivel` | `EvaluationFlowController@directionCourses` |
| Migración: columna `observaciones.id_ejercicio`, que admite nulos (las filas anteriores quedan como observación general) e índice `(id_estudiante, id_evaluacion, id_ejercicio)` | `database/migrations/2026_11_15_000001_add_exercise_to_observaciones.php` |

**Para la base de desarrollo (PostgreSQL)** hay que ejecutar `php artisan migrate`. La migración se aplicó y se revirtió (`migrate:rollback --step=1`) sobre una copia SQLite sin perder filas.

## 3. Corrección en el frontend

Al recargar la página, "Mis cursos" mostraba **"Unauthenticated."**. El token se configuraba en un `useEffect` de `App.jsx`, y los efectos de las vistas hijas se ejecutan antes que los del padre. Ahora el encabezado `Authorization` se configura en el inicializador de `useState`, antes del primer render.

## 4. Pruebas

### Automáticas (Laravel)

Archivo: `tests/Feature/EvaluationRoutesV1Test.php`, con 8 pruebas.

| Prueba | Qué verifica |
|---|---|
| `test_evaluation_flow_is_available_under_v1` | Crear la Evaluación y leer el cuadro y la lista de cursos bajo `/api/v1` |
| `test_direction_uses_its_own_course_route` | Dirección recibe 403 en `/cursos` y 200 en `/direccion/cursos` |
| `test_direction_can_read_course_report_but_cannot_rate` | Dirección lee el informe y recibe 403 al valorar |
| `test_teacher_cannot_read_report_of_another_teachers_course` | Una docente recibe 403 en el informe de un curso ajeno |
| `test_rating_response_exposes_only_id_and_name_of_the_rater` | `valorado_por` solo contiene `{id, nombre}`, sin correo |
| `test_grid_exposes_exercise_description_and_analysis_summary` | El cuadro incluye `descripcion` y el resumen de análisis, sin otros detalles computacionales |
| `test_rating_stores_observation_per_exercise_and_sheet_returns_it` | La observación se guarda con `id_ejercicio`; la ficha devuelve la más reciente por celda; una observación antigua queda como general; Dirección lee la ficha y otra docente recibe 403 |
| `test_direction_course_list_reports_completed_students` | Los conteos de estudiantes completos, nivel y S/ED/NA en `direccion/cursos` |

Resultado de la suite completa: `php artisan test` → **36 passed (184 assertions)**. Además, `npx vite build` compila sin errores.

### En el navegador

Se usó Chrome sin interfaz controlado por CDP, contra una base SQLite aislada con los seeders (`DatabaseSeeder` y `ExampleDataSeeder`), con `ANALISIS_HABILITADO=false` y un análisis insertado a mano para probar la celda "Analizada". La base PostgreSQL de desarrollo no se usó. En ningún recorrido hubo errores de consola ni respuestas HTTP ≥ 400.

| Paso | Recorrido verificado |
|---|---|
| 2 | Mis cursos → Abrir evaluación → crear la Evaluación T1 (nivel 1, 80 mm) → cuadro de 6×4; la pestaña T2 propone el nivel 2; se muestran todos los estados de celda y la leyenda |
| 3 | "Continuar: …" abre la celda analizada. Indicadores: Precisión 0.92, Firmeza 0.80, Fluidez 1.00, Regularidad 0.85, más la sugerencia y el aviso. Se valora ED con observación → "Guardado." → "Siguiente" → se sube una foto → "Análisis no disponible por ahora." → se valora S → el cuadro se actualiza |
| 4 | Celda → NA con observación → la ficha muestra NA y la observación debajo; los encabezados "T1 · grandes / T2 · medianas / T3 · pequeñas"; "Aún no evaluado"; la nota fija; las observaciones con su chip de trimestre y su Ejercicio |
| 5 (docente) | Informes: se elige curso y trimestre; se ven el aviso, "1 de 6 estudiantes…", las barras S/ED/NA por Ejercicio con "falta valorar", la leyenda y "Requieren observación". En T2 aparece "Todavía no hay Evaluación del Trimestre 2." |
| 5 (Dirección) | Cursos: tabla con docente, "1 de 6", S/ED/NA y "Ver curso". El curso muestra "solo lectura", el resumen y la tabla de estudiantes; la ficha abre en modo lectura. En T2 aparece "La docente aún no creó esta Evaluación.". Se comprobó en la página que no hay botón "Crear evaluación" ni "Continuar", ni celdas clicables, ni campos de archivo o de texto, ni "Guardar" |

## 5. Textos pedagógicos por pantalla

| Texto | Pantalla(s) |
|---|---|
| "Nivel N: figuras grandes / medianas / pequeñas" | Mis cursos (tarjeta), Cuadro (subtítulo y selector al crear), Captura (subtítulo), Informe (título del trimestre) y Ficha (encabezados "T1 · grandes"…) |
| "Los 4 ejercicios se hacen juntos en la misma hoja." | Cuadro (docente y Dirección) |
| "ED: en proceso de lograrlo, es lo esperable a esta edad" | Leyenda del Cuadro (docente y Dirección), leyenda del Informe (docente y Dirección), Captura paso 3 |
| "Esta herramienta apoya la observación; no emite diagnóstico." | Captura (los 3 pasos), Informes de la docente, Curso de Dirección |
| "Qué observa este ejercicio" + `exercises.descripcion` | Captura |
| "Toma la foto con la hoja completa y las 4 marcas de las esquinas visibles." | Captura paso 1 |
| "Análisis no disponible por ahora." | Captura paso 2, si no hay análisis |
| "Cada indicador compara el trazo con la plantilla de este nivel." | Captura paso 2 |
| "Es solo una ayuda. La valoración final la decides tú." | Captura paso 2, solo si hay sugerencia |
| `aviso_pedagogico` de FastAPI | Captura paso 2, solo si el análisis lo trae |
| Rúbrica S/ED/NA por Ejercicio (tomada del prototipo, donde se presenta como ejemplo) | Captura paso 3 |
| "Las figuras son más chicas en cada trimestre. Mantener la valoración con figuras más pequeñas ya es avance." | Ficha (docente y Dirección) |
| "Estudiantes con NA en 2 o más ejercicios." | Informe (docente y Dirección) |

## 6. Código y rutas legadas que ya no usa ninguna pantalla visible

No se borró nada. Los menús actuales solo llevan a estas pantallas:

- Docente: Mis cursos, Informes y Perfil.
- Dirección: Cursos y Perfil.
- Administración: Versiones del modelo y Perfil.

### Vistas React sin acceso desde los menús

`DashboardView`, `StudentsView`, `ExercisesView`, `ActivitiesView`, `NewActivityView`, `ActivityDetailView`, `ProgrammedActivitiesView`, `TeachersView`, `StudentProgressView`, `StudentReportsView`, y la rama de Dirección y Administración de `CoursesView`.

### Peticiones legadas que siguen activas

`App.jsx` todavía hace 3 peticiones al iniciar sesión, y sus resultados solo los usan las vistas legadas:

- `GET /api/v1/students`
- `GET /api/v1/exercises`
- `GET /api/v1/actividades` (solo para docentes)

### Rutas registradas que ya no llama ninguna pantalla visible

Todas están bajo `/api/v1`:

- `GET actividades`, `actividades/{id}`, `actividades/{id}/resultado`, `actividades/{id}/evaluacion/historial` y `actividades-programadas` (`LegacyReadController`)
- `GET cursos/{id}/seguimiento`, `students/{id}/progress` e `imagenes/{id}/download` (`LegacyReadController`)
- `GET cursos/{course}` (`CourseController@show`)
- `GET dashboard` (`DashboardController`)
- `GET students`, `students/{student}`, `exercises` y `exercises/{exercise}` (solo las usan la carga en segundo plano y las vistas legadas)
- `GET fotos/{id}/etapas`: ninguna pantalla la usa y hoy siempre devuelve imágenes nulas
- `POST auth/register`

### Duplicados sin prefijo `v1`

El grupo completo `/api/...` repite las mismas rutas. El frontend solo usa `/api/v1`.

### Llamadas del código legado a rutas que no existen

Están en vistas sin acceso:

- `POST /actividades`, `/actividades/{id}/imagen` y `/actividades/{id}/procesar`
- `PUT /actividades/{id}/evaluacion`
- `GET`, `POST`, `PUT` y `PATCH` de `/docentes`
- escritura de `cursos`, `students`, `exercises` y `actividades-programadas`

### Backend sin ruta

Ver `12_limitaciones.md`, sección 2: controladores, servicios, políticas y Resources del diseño anterior.

## 7. Estado de los puntos de `12_limitaciones.md`

| Punto | Estado |
|---|---|
| 1.1 El frontend no puede registrar evaluaciones | **Resuelto** para el flujo nuevo: captura, foto y valoración. Las vistas legadas siguen rotas, pero ya no tienen acceso |
| 1.2 El frontend no usa el flujo nuevo | **Resuelto** (pasos 2 a 5) |
| 1.3 Rutas duplicadas para `GET /cursos` | **Resuelto** |
| 1.4 El flujo nuevo solo existe en `/api` | **Resuelto** |
| 1.5 El panel muestra "—" | Pendiente. `DashboardView` ya no está en ningún menú |
| 1.6 Etapas siempre vacías | Pendiente. La captura no muestra etapas |
| 1.7 La sugerencia de la IA siempre es `null` | Pendiente. Requiere un modelo entrenado con datos reales |
| 1.8 No se guarda la versión del modelo | Pendiente |
| 1.9 Observaciones vacías en la UI | **Resuelto** en la ficha nueva. `LegacyReadController` no cambió |
| 1.10 Exposición del correo de quien valora | **Resuelto** |
| 1.11 La dirección no ve el informe | **Resuelto** |
| 1.12 `db:show` sin `intl` | Pendiente (entorno) |

## 8. Pendientes conocidos de este flujo

- **"Exportar PDF"** del informe: aparece en el prototipo y no está implementado. No se muestra el botón.
- **"Nueva observación"** desde la ficha: no hay un endpoint para observaciones sueltas. Hoy las observaciones se registran al valorar cada Ejercicio.
- **Etapas del procesamiento** (las 4 imágenes del prototipo): no se muestran porque FastAPI no genera `rutas_etapas`.
- **Reemplazo de foto:** no se puede reemplazar una foto ya valorada; el backend responde 409.
- **Rúbrica:** es la del prototipo, que la presenta como ejemplo. La docente o la institución deberían validarla.
- **Vista previa:** la captura muestra la foto recién elegida, pero no hay un endpoint para ver una foto ya guardada.
