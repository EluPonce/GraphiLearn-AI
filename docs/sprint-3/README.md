# GraphiLearn AI — Sprint 3

## Expediente Metodológico y Técnico del Sprint 3

Este expediente documenta de forma completa y exhaustiva el **Sprint 3** de GraphiLearn AI conforme a la metodología de Ingeniería de Software de Martínez Canedo (UAGRM) y a la estructura establecida en el Sprint 1 y Sprint 2:

### Documentos del Sprint 3

| Documento | Contenido Principal |
|---|---|
| [planning-y-backlog.md](planning-y-backlog.md) | Sprint Planning, Objetivos del Sprint, Historias de Usuario (HU-04, HU-12, HU-13, HU-14, HU-15, HU-17), Diagrama de Contexto del Sistema y Sprint Backlog con tareas y estimaciones. |
| [diseno.md](diseno.md) | Diseño de la Arquitectura, Diagrama de Despliegue, Diagrama de Paquetes en Capas, Diseño de Datos, Diagrama de Clases, Mapeo Relacional (Diccionario de Datos) y Diagramas de Secuencia. |
| [pruebas.md](pruebas.md) | Plan de Pruebas detallado por HU y Reporte de Pruebas con ejecución real observada (PHPUnit 38/38 aprobadas con 203 aserciones, pytest 20/20 aprobadas, migraciones PostgreSQL y compilación Vite). |
| [review-y-retrospectiva.md](review-y-retrospectiva.md) | Revisión de Sprint (Sprint Review) con tabla de funciones presentadas y Retrospectiva de Sprint (Sprint Retrospective) con análisis de mejoras y lecciones aprendidas bajo la plantilla oficial. |

---

## Incremento de corrección de roles y gestión (Antecedentes Técnicos)

**Corte técnico:** 30 de octubre de 2026. Este expediente registra cambios en la rama `feature/crud-roles-evaluacion`; no afirma que exista un Sprint Planning aprobado o una aceptación de Product Owner.

## Relación con el Product Backlog

Este incremento corrige responsabilidades y completa partes de la gestión ya descrita por el Product Backlog vigente. No crea, renumera ni reprioriza historias. Antes de atribuir cada tarea a una HU concreta, se debe cotejar la versión editable aprobada del Product Backlog y confirmar la numeración con el Product Owner.

## Decisión sobre actividades

La tabla existente `actividades` no es una definición programable: cada fila identifica a un estudiante y ejercicio, tiene fecha de realización, se vincula con una imagen y puede tener un resultado de análisis. Se conserva su significado como ejecución individual.

Se incorpora `scheduled_activities` para una definición administrativa asociada a curso y ejercicio. Las ejecuciones nuevas pueden referenciarla mediante `actividades.scheduled_activity_id`, que admite `NULL` para conservar todas las filas anteriores. No se migran ni reinterpretan registros históricos.

## Reglas implementadas

- Administradora: gestión de docentes de su institución; cursos y asignaciones docentes; inscripciones de estudiantes; catálogo de ejercicios; actividades programadas; estadísticas institucionales agregadas y versiones de modelos. El registro público de cuentas quedó deshabilitado.
- Docente: lectura de cursos asignados, estudiantes de esos cursos, catálogo y programaciones activas asignadas; creación de ejecuciones; carga privada de imágenes, solicitud de análisis y valoración pedagógica manual.
- Las rutas de fotografías, ejecuciones y evaluaciones no conceden acceso administrativo. Las estadísticas institucionales no exponen conteos de imágenes ni revisiones individuales.
- Cambios a la valoración S, ED o NA y observaciones se registran en `activity_evaluation_history`. La inferencia del modelo no determina la valoración pedagógica.

## Evaluación pedagógica

Se conservan los ejercicios de línea, círculo, espiral y zigzag y las categorías S, ED y NA transcritas de la entrevista. Se incorporan una referencia de periodo opcional y observaciones manuales. La estructura no impone número ni fecha de evaluaciones: la expectativa de tres evaluaciones, el vínculo de la primera con adaptación y la comparación entre periodos quedan visibles como requisitos de seguimiento, con periodos exactos y criterios por confirmar con la licenciada. No se inventan umbrales para las categorías.

## Migración y compatibilidad PostgreSQL

Se revisó y aplicó `GraphiLearn/database/migrations/2026_10_29_000001_add_activity_programming_and_pedagogical_evaluations.php` con `php artisan migrate` contra PostgreSQL 17.7 (`graphilearn`). El respaldo pre-migración `storage/app/private/migration-safety/graphilearn_pre_activity_roles_20261029_234124.dump` fue restaurado en una base temporal aislada y sus conteos coincidieron; también se conservó el respaldo previo `...230456.dump`. El SQL previsto fue revisado antes de la aplicación. La migración es aditiva, con claves foráneas y nuevas referencias nullable para no reinterpretar las ejecuciones históricas.

La migración crea `scheduled_activities` y `activity_evaluation_history`; agrega a `actividades` `scheduled_activity_id`, `evaluated_by`, `pedagogical_rating`, `pedagogical_observations` y `period_reference`; y agrega `active` a `courses` y `users`. `migrate:status` confirma Batch 3, Ran. No se utilizó `migrate:fresh`, `db:wipe`, rollback ni seeders.

Conteos previos a la migración y previos a los datos DEMO: instituciones 1, usuarios 3, cursos 3, estudiantes 6, actividades ejecutadas 0. Después de la migración se conservaron exactamente esos valores. Tras las pruebas DEMO: instituciones 1, usuarios 5, cursos 5, estudiantes 8, ejecuciones 3, programaciones 5 (4 activas y una desactivada), historial de evaluación 5. Los seis estudiantes originales siguen presentes sin cambios; los tres registros administrativos adicionales activos son claramente `[DEMO]`. Se conservaron además filas DEMO desactivadas para comprobar el flujo de baja lógica.

La cuenta docente ficticia activa tiene su correo y contraseña aleatoria en el archivo privado ignorado por Git `GraphiLearn/storage/app/private/migration-safety/demo-teacher-credentials.json`; no registrar ni copiar la contraseña a logs o documentación. El ingreso de administradora se comprobó por la API usando temporalmente una contraseña aleatoria dentro de una transacción, restaurando su hash original antes de confirmar los registros DEMO.

## Verificación ejecutada

- Runner de integración mediante el Kernel HTTP de Laravel y PostgreSQL real: login admin/docente; CRUD docente/curso/estudiante; programación y baja; acceso docente limitado a curso asignado; denegaciones para escrituras docentes no permitidas y datos privados para administradora; tres ejecuciones; tres imágenes sintéticas 640x480; análisis FastAPI; guardado manual S/ED/NA; observaciones y cinco eventos de historial. Todo pasó. Las filas de prueba quedaron marcadas `[DEMO]`; no se modificaron datos originales ni se cambió el pipeline de IA.
- `php artisan test`: 34 pruebas aprobadas, 104 aserciones. PHPUnit usa SQLite en memoria según `phpunit.xml`; no es la prueba contra PostgreSQL, que se informa por separado arriba.
- `npm run build`: Vite compiló correctamente (1962 módulos).
- PHP CLI utilizado: `C:\xampp\php\php.exe`, PHP 8.2.12, `C:\xampp\php\php.ini`. `intl` no está cargada; la extensión existe como `C:\xampp\php\ext\php_intl.dll` y la directiva está comentada. Corrección mínima: habilitar `extension=intl` en ese ini y volver a comprobar `php -m`; no se reemplazó PHP ni se editó el ini automáticamente.
- FastAPI estuvo disponible en `127.0.0.1:8001`; tres llamadas de análisis sintético respondieron correctamente. El indicador de estado del clasificador/modelo activo estaba vacío, por lo que la prueba confirma la ruta de análisis geométrico/servicio, no la clasificación Random Forest.

## Pendientes

- Completar una interfaz de seguimiento agregado de evolución por estudiante; los registros y filtros del API existen, pero no hay gráfico o comparación de periodos en la UI.
- Confirmar con la licenciada los periodos exactos y los criterios pedagógicos; documentar la aceptación resultante sin derivarlos de Random Forest.
- Validar la experiencia responsive en dispositivos móviles reales y probar la cámara física; la carga de archivo sintético quedó verificada.
- Habilitar PHP `intl` en el ini indicado si se necesita el formato completo de `php artisan db:show`.
- La desactivación conserva datos; no se implementó restauración desde papelera de estudiantes/programaciones.

## Arranque local

Desde `GraphiLearn/`: `php artisan serve` y `npm run dev` (en terminales separadas). Para el servicio existente, desde `ai-service/`: `uvicorn main:app --reload --port 8001`. No se añadieron microservicios ni gateway.

## 2026-10-30 — Aulas, fichas y programaciones con varios ejercicios

- Las tarjetas de cursos abren un detalle mediante las rutas existentes. El detalle muestra docente, estudiantes y programaciones; docentes ven seguimiento agregado de ejecuciones y valoraciones, y administradoras reciben accesos a sus módulos de gestión. La administradora no obtiene datos de imágenes ni valoraciones individuales.
- Se agregó `GET /api/v1/students/{student}/progress`, exclusivo de docentes asignadas. Devuelve los datos básicos, programaciones activas, ejecuciones, descarga protegida de fotografías, métricas geométricas, valoraciones manuales y trazabilidad. S/ED/NA se presenta solo si existe valoración. La comparación agrupa el mismo ejercicio cuando hay al menos dos referencias de periodo con valoraciones; no calcula categorías ni tendencias.
- La interfaz de programaciones permite agregar, retirar y reordenar cualquier cantidad de ejercicios. El formulario docente presenta los ejercicios de la programación y deshabilita los ya registrados para el estudiante; el backend también responde 409 ante duplicados y la migración añade una restricción única.
- El listado administrativo de matrículas distingue `Activo`/`Inactivo`, consulta registros soft-deleted bajo parámetro exclusivo de administradora y permite reactivarlos; docente solo recibe matrículas activas. El estado se presenta separado de la valoración pedagógica.
- Migración incremental preparada: `GraphiLearn/database/migrations/2026_10_30_000001_add_exercises_to_scheduled_activities.php`. Crea una pivote ordenada y copia cada `scheduled_activities.exercise_id` actual como el primer elemento; conserva el campo legado como compatibilidad. La ejecución queda vinculada por programación, estudiante y `id_ejercicio`. La migración verifica duplicados antes del índice único; el conteo real actual de duplicados es cero.
- Respaldo actual creado y restaurado en una base temporal aislada: `storage/app/private/migration-safety/graphilearn_pre_multi_exercise_20261030_043301.dump` (61,821 bytes). Conteos de la restauración: instituciones 1, usuarios 5, cursos 5, estudiantes 8, ejecuciones 3, programaciones 5 e historial 5. La base temporal se eliminó después de comparar conteos.
- **La nueva migración se aplicó** únicamente con `php artisan migrate --path=database/migrations/2026_10_30_000001_add_exercises_to_scheduled_activities.php`, después de revisar `--pretend`, verificar cero duplicados y crear/restaurar el respaldo actual. `migrate:status` la muestra Batch 4, Ran. La verificación posterior confirma cinco filas de pivote para cinco programaciones, cero programaciones sin ejercicio, cero ejecuciones sin ejercicio asociado y cero duplicados. Los conteos de institución, usuarios, cursos, estudiantes, ejecuciones, programaciones e historial permanecieron 1, 5, 5, 8, 3, 5 y 5.
- Riesgo y regla de negocio: la restricción impedirá volver a registrar el mismo ejercicio para el mismo estudiante dentro de la misma programación, incluso si la ejecución se soft-deletea. Antes de migrar se confirmó que no existían duplicidades. Para volver a tomar un ejercicio en otra evaluación, la administración debe crear otra programación.
- Validaciones de esta entrega: PHP lint en controladores, políticas, recursos y migración; revisión de rutas; `npm run build` pasó (1963 módulos). No se ejecutó PHPUnit ni una prueba manual de APIs/UI tras esta entrega; las comprobaciones PostgreSQL fueron de respaldo, esquema y consistencia referencial.
- La barra lateral cambia a navegación inferior desplazable en viewport móvil. No reemplaza la validación de cámara y dispositivos físicos.

## 2026-10-30 — Experiencia docente y presentación del análisis

- Se organizaron las fichas de seguimiento en las secciones «Evaluar», «Observaciones» e «Historial». Cada ejercicio programado presenta su estado de evaluación y abre la ejecución individual correspondiente; el servidor conserva la protección contra duplicados. Las observaciones continúan asociadas a una ejecución y cada modificación conserva el evento anterior.
- El registro docente incorpora captura móvil con el selector de cámara del navegador (`capture="environment"`), alternativa de carga, vista previa, reemplazo antes del análisis y descarga autenticada de la fotografía guardada. La interfaz explica el requisito de permiso y contexto seguro; no se probó una cámara física en esta entrega.
- El informe de resultados separa indicadores que devuelve el servicio de la valoración manual S/ED/NA. Presenta la clasificación solo cuando la respuesta la marca disponible, identificada como experimental/no diagnóstica. FastAPI actual no devuelve una imagen procesada, por lo que la interfaz no la inventa ni simula.
- Se formatearon las fechas visibles en español local y se sustituyeron términos técnicos en el menú/listados docentes. El filtro de actividades conserva «Todos los estados» como selección inicial.
- Se añadió `docs/informe-tecnico-pipeline-ia.md`, contrastado con routers, esquemas, servicios, entrenamiento, cliente Laravel y persistencia. Documenta el contrato observado y distingue el benchmark sintético de una validación científica.
- Verificación ejecutada en este corte: `php artisan test` aprobó 34 pruebas y 104 aserciones; `npm run build` aprobó con 1963 módulos; `git diff --check` no reportó errores de whitespace. No se ejecutó aquí una nueva secuencia de integración PostgreSQL + fotografía + FastAPI. La URL configurada para IA usa `127.0.0.1:8001`, cuya ruta raíz respondió la página Laravel (`CafeSmart Pagos`) durante esta revisión; no se confirmó FastAPI en ese endpoint. Por tanto, la secuencia real descrita en la sección previa corresponde a la verificación documentada en el corte previo y no se declara repetida ahora.
- Pendiente: confirmar/levantar FastAPI en la URL correcta y ejecutar de nuevo la secuencia de prueba integral con registros sintéticos; probar cámara en dispositivo móvil real. No se tocaron tablas/datos ni el pipeline en este corte.

## 2026-10-30 — Menú docente, informes y dashboard por rol

- El menú docente se reorganizó en Panel principal, Mis cursos, Estudiantes, Trabajos y evaluaciones, Informes de seguimiento y Perfil. La vista duplicada `analysis` ahora redirige a Informes; `analysis-detail` se conserva como ruta interna de detalle del trabajo y reutiliza `ActivityDetailView`.
- Trabajos y evaluaciones presenta las programaciones activas de cursos asignados junto con el listado de registros individuales; mantiene el alta del trabajo, captura, análisis y valoración existentes. Informes usa el endpoint docente existente de progreso solo para el estudiante seleccionado y presenta comparación por periodos, observaciones, métricas históricas e historial de cambios sin repetir el listado de trabajos como landing.
- Se añadió una ficha administrativa en el listado de estudiantes con datos del registro, curso, docente y estado de inscripción. Sus secciones pedagógicas son espacios informativos reservados; no llaman al endpoint de progreso ni muestran imágenes, observaciones o valoraciones. No se cambiaron Policies.
- El dashboard ahora obtiene sus conteos de `/api/v1/dashboard`. Diferencia programaciones activas, trabajos registrados y cupos de ejercicios programados pendientes (ejercicios de programaciones activas × estudiantes activos − registros asociados). El docente ve sus datos asignados y evaluaciones manuales registradas. La administradora no recibe conteos de categorías S/ED/NA, pendientes de autorización. En error de carga se presenta «—», no cero.
- `php artisan test`: 35 pruebas aprobadas, 116 aserciones; incluye cobertura de la separación entre programaciones, trabajos y evaluaciones en los dashboard de ambos roles. `npm run build`: Vite aprobó con 1964 módulos. No se modificaron datos ni el pipeline.
- Pendiente: validar con la licenciada si se autoriza en el futuro el acceso administrativo a informes pedagógicos individuales o incluso a agregados S/ED/NA. El panel de la administradora mantiene esos datos ocultos hasta recibir esa autorización.
