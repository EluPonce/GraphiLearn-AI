# Bitácora de documentación

## 2026-11-17 — Sincronización de seguridad y expediente metodológico del Sprint 3

- Se generó y sincronizó el token de seguridad interno (`X-Internal-Token`) en `ai-service/.env` y `GraphiLearn/.env`, habilitando el análisis computacional real (`ANALISIS_HABILITADO=true`). Se modificó `main.py` para cargar variables de entorno automáticamente sin dependencias externas.
- Se aplicó la migración pendiente `2026_11_15_000001_add_exercise_to_observaciones` en PostgreSQL (`graphilearn`), vinculando observaciones por ejercicio y garantizando integridad referencial.
- Se completó la documentación formal y exhaustiva del Sprint 3 bajo la metodología de Martínez Canedo:
  - `docs/sprint-3/planning-y-backlog.md`: Planning, objetivos, fichas HU-04, HU-12, HU-13, HU-14, HU-15, HU-17, contexto del sistema y Sprint Backlog de 80 horas.
  - `docs/sprint-3/diseno.md`: Diagrama de despliegue, paquetes en 4 capas, diagrama de clases, diccionario de datos y diagramas de secuencia para carga/análisis y valoración docente manual (S/ED/NA).
  - `docs/sprint-3/pruebas.md`: Plan de pruebas y reporte de pruebas con ejecución real automatizada observada.
  - `docs/sprint-3/review-y-retrospectiva.md`: Sprint Review y Sprint Retrospective bajo la plantilla oficial de la facultad.
- Evidencia ejecutada:
  - PHPUnit en Laravel: **38/38 pruebas pasadas (203 aserciones)** sin fallos.
  - Pytest en FastAPI: **20/20 pruebas pasadas**.
  - Vite: Build de producción exitoso (**1.970 módulos procesados** sin errores).
  - Base de datos: 18/18 migraciones en estado `Ran` en PostgreSQL 17.

## 2026-10-30 — Navegación e indicadores por rol

- Se registró la unificación docente en `Trabajos y evaluaciones` y `Informes de seguimiento`, con redirect de la ruta interna heredada `analysis`; el detalle `analysis-detail` se mantiene como detalle individual usando el componente existente.
- Se documentó la ficha administrativa sin acceso pedagógico individual y los contadores del dashboard basados en el endpoint real, diferenciando programaciones, trabajos registrados y pendientes.
- PHPUnit: 35/35, 116 aserciones. Vite: build exitoso, 1964 módulos. La prueba del dashboard verifica aislamiento y que el administrador no reciba agregados S/ED/NA sin autorización.
- Sin migraciones, escrituras PostgreSQL, cambios de Policies ni del pipeline IA.

## 2026-10-30 — Experiencia docente e informe del pipeline

- Se documentaron las secciones Evaluar, Observaciones e Historial, captura con vista previa y acceso privado a imágenes, indicadores realmente devueltos, clasificación experimental separada y fechas locales en `docs/sprint-3/README.md`.
- Se creó `docs/informe-tecnico-pipeline-ia.md` tras revisar el código de FastAPI/OpenCV, el cliente y persistencia Laravel, y el entrenamiento sintético. No se modificó ni reentrenó el pipeline.
- `php artisan test`: 34 pruebas aprobadas, 104 aserciones. `npm run build`: Vite aprobó, 1963 módulos. El build debió ejecutarse fuera del sandbox porque esbuild falló con `spawn EPERM` dentro del sandbox.
- No se repitió la prueba integral contra PostgreSQL/FastAPI en este corte: el endpoint configurado `127.0.0.1:8001` respondió el HTML de Laravel en vez del contrato de FastAPI. No se registran pruebas de cámara física. Estas quedan pendientes; la integración documentada en el apartado anterior pertenece al corte anterior.

## 2026-10-30 — Aulas y evaluaciones con varios ejercicios

- Se documentó el detalle de aulas, ficha pedagógica restringida a docente, indicadores, imágenes protegidas, historial y comparaciones sin reglas pedagógicas inventadas.
- Se aplicó la migración incremental de tabla pivote ordenada y restricción contra duplicados tras revisar SQL previsto, cero duplicados y respaldo restaurable. Se conservaron programaciones/exercise_id actuales mediante backfill; 5/5 tienen pivote y las 3 ejecuciones siguen vinculadas.
- La interfaz administrativa distingue inscripciones activas/inactivas y permite reactivar bajas lógicas; docentes continúan viendo solo estudiantes activos.
- Se creó y restauró de forma aislada el respaldo `graphilearn_pre_multi_exercise_20261030_043301.dump`; conteos restaurados coincidieron. El estado de la base fuente no se alteró.
- Evidencia: SQL de `migrate --pretend` revisado; `migrate:status` Batch 4 Ran; conteos y vínculos PostgreSQL verificados; PHP lint y build Vite aprobados (1963 módulos). No se ejecutaron pruebas automatizadas de esta entrega.

## 2026-10-30 — Migración PostgreSQL y verificación DEMO

- Se aplicó la migración `2026_10_29_000001_add_activity_programming_and_pedagogical_evaluations` a la base PostgreSQL existente `graphilearn`, después de validar el respaldo restaurable y revisar el SQL previsto. No se reconstruyó la base ni se usaron seeders destructivos.
- La integración real confirmó los conteos originales antes de DEMO (instituciones 1, usuarios 3, cursos 3, estudiantes 6, ejecuciones 0) y preservó los seis estudiantes. Se agregaron registros ficticios `[DEMO]` para probar docentes, cursos, inscripciones, cuatro programaciones y tres ejecuciones con imágenes sintéticas, evaluación S/ED/NA y trazabilidad.
- La integración encontró dos errores de binding en rutas de docente y actividad programada; se alinearon los parámetros de ruta con el binding implícito de Laravel y se repitió la prueba completa con éxito.
- Evidencia: PostgreSQL real + FastAPI local disponibles; PHPUnit 34/34 (104 aserciones); Vite build 1962 módulos. No hubo modificación del pipeline OpenCV/Random Forest.
- PHP CLI es `C:\xampp\php\php.exe`; falta cargar `intl`, aunque el DLL está en la instalación. La recomendación es habilitar la directiva existente en `C:\xampp\php\php.ini`.

## 2026-10-29 — Incremento de corrección de roles y CRUD

- Se añadió `docs/sprint-3/README.md` como expediente técnico incremental, sin asignar HU no verificadas ni alterar prioridades del Product Backlog original.
- Se documentó la distinción entre actividad programada y ejecución individual, inicialmente con migración pendiente; ver actualización de aplicación y pruebas en la entrada del 30 de octubre.
- Evidencia original de aquel corte: PHPUnit 34/34 (104 aserciones) contra SQLite en memoria; build de Vite correcto.

## 2026-10-29 — Fase 1 de GraphiLearn AI

- Se incorporó `docs/sprint-2/fase-1-seguridad.md` con hallazgos confirmados, cambios, archivos, pruebas, límites y pendientes.
- Se actualizó el índice de Sprint 2 y su fecha de corte de verificación.
- No se renumeraron historias de usuario ni se asignó esta fase a una HU sin confirmar el Product Backlog aprobado.
- Evidencia ejecutada: PHPUnit 30/30; pytest 11/11 con 2 advertencias; Vite build correcto en salida temporal.
- La reorganización física queda pendiente de localizar una raíz Git que permita preservar el historial.
