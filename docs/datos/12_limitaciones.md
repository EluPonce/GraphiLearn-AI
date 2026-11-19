# 12 · Limitaciones, errores conocidos y deuda técnica

Cada punto se verificó leyendo el código, consultando la base o ejecutando peticiones (ver los archivos 03 a 09).

## 1. Errores conocidos (comportamiento incorrecto hoy)

1. **El frontend no puede registrar evaluaciones.** Las pantallas React llaman a rutas que no están registradas: `POST /api/v1/actividades`, `POST /api/v1/actividades/{id}/imagen`, `POST /api/v1/actividades/{id}/procesar`, `PUT /api/v1/actividades/{id}/evaluacion`, `/api/v1/docentes`, y la escritura de cursos, estudiantes, ejercicios y programaciones. Hoy no se puede subir una foto ni valorar desde la interfaz.
2. **El frontend no usa el flujo nuevo.** No hay pantalla para `/api/evaluaciones`, el cuadro, la ficha T1–T3, el informe del curso ni `/api/direccion/cursos` (ver `06_pantallas_react.md`).
3. **Rutas duplicadas para `GET /api/cursos`.** `evaluaciones.php` reemplaza a `courses.php`: Dirección recibe 403 en `/api/cursos`, mientras que `/api/v1/cursos` devuelve otro formato.
4. **El flujo nuevo solo existe en `/api`.** `routes/api.php` no incluye `evaluaciones.php` dentro del grupo `v1`, y el frontend solo usa `/api/v1`.
5. **El panel muestra "—".** `DashboardView.jsx` espera claves (`mis_cursos`, `total_estudiantes`, …) que `DashboardController` no devuelve (devuelve `cursos`, `estudiantes`, `fotos`, `valoraciones`).
6. **Etapas siempre vacías.** `GET /api/fotos/{id}/etapas` responde `{original: null, grises: null, trazo: null, esqueleto: null}` porque FastAPI no genera `rutas_etapas`.
7. **La sugerencia de la IA siempre es `null`.** El manifiesto está vacío (no se puede cargar ningún modelo) y el único modelo existente predice 0/1, no S/ED/NA.
8. **No se guarda la versión del modelo.** `analisis.id_modelo` se guarda siempre como `null` en `EvaluationFlowController@upload`.
9. **Observaciones vacías en la UI.** `LegacyReadController` devuelve `pedagogical_observations: null` para todas las fotos, aunque existan filas en `observaciones`.
10. **Exposición del correo de quien valora.** `PUT .../valoracion` devuelve el objeto completo del usuario en `valorado_por`, incluido su correo.
11. **La dirección no ve el informe del curso.** La ruta `informes/curso/{id}` es solo para `docente`.
12. **`php artisan db:show` falla.** Falta la extensión PHP `intl`.

## 2. Deuda técnica

- **Código muerto o roto:** los modelos `Actividad`, `Imagen` y `AnalysisResult` apuntan a tablas que ya no existen. Los controladores `ActividadController`, `ActivityEvaluationController`, `AnalysisController`, `ImagenController`, `ScheduledActivityController`, `StudentProgressController`, `CourseProgressController` y `TeacherController` no tienen ruta. Tampoco se usan los servicios `AnalysisService`, `ImageUploadService`, `ImageValidationService` y `ActividadService`, las políticas `ActividadPolicy` e `ImagenPolicy`, los Resources `ActividadResource`, `AnalysisResultResource` e `ImagenResource`, ni el middleware `RoleMiddleware`. Los archivos `routes/api/v1/actividades.php` y `analysis.php` no se cargan. `ModelVersion::analysisResults()` apunta al modelo antiguo.
- **Métodos de controlador inalcanzables:** `store/update/destroy` de `CourseController`, `StudentController` y `ExerciseController`.
- **Esquema de transición:** `fotos_ejercicio` conserva `legacy_*`, `scheduled_activity_id` y `period_reference`; `analisis` duplica datos en columnas planas y en JSON; las tablas `scheduled_activities`, `scheduled_activity_exercises` y `activity_evaluation_history` solo se leen.
- **Restricciones faltantes en la BD:** no hay UNIQUE en `analisis.id_foto`, ni CHECK en `users.rol`, `evaluaciones.trimestre` y `evaluaciones.nivel`. La restricción UNIQUE `(id_evaluacion, id_estudiante, id_ejercicio)` no cubre filas con `id_evaluacion` NULL.
- **Columnas `deleted_at` sin `SoftDeletes`** en `FotoEjercicio` y `Analisis`.
- **Configuración duplicada:** la clave `analysis_enabled` está dos veces en `config/services.php` y `ANALISIS_HABILITADO` dos veces en `.env.example`.
- **Ejercicios fijos en el código:** `EvaluationFlowController::EXERCISES` define 4 ejercicios fijos (`linea`, `circulos`, `zigzag`, `espiral`); si el catálogo no tiene exactamente uno activo por tipo, responde 503.
- **Rendimiento:** `report()` y `directionCourses()` hacen una consulta por estudiante, ejercicio y valoración (N+1). Además, `grid()` ejecuta `ensureSlots()` (un `firstOrCreate` por casilla) en cada lectura, así que una petición de lectura escribe en la base.
- **Análisis síncrono:** se ejecuta dentro de la petición de subida, con hasta 30 s de espera y sin cola.
- **Respuestas sin capa de Resource** en `EvaluationFlowController` y `LegacyReadController`: exponen columnas internas (`legacy_*`, `ruta_imagen`, `deleted_at`).
- **Docker incompleto:** solo levanta `ai-service`; faltan Laravel y PostgreSQL. La red es `internal`, sin ningún otro miembro.
- **Dependencias Python sin versión fija** (`>=`). Docker usa Python 3.12 y la máquina local 3.14.
- **Git:** 1 commit; todo el trabajo posterior al 2026-10-29 está sin commit (ver `11_git.md`).
- **Carpeta anidada vacía** `GraphiLearn/GraphiLearn/storage/...`.
- **`.pytest_cache` con permisos rotos** en `ai-service/` y en la raíz: impide comprimir la carpeta y obliga a ejecutar pytest con `-p no:cacheprovider`.

## 3. Partes sin probar

- Frontend React: sin ninguna prueba automatizada y sin prueba manual registrada en este relevamiento.
- Integración real Laravel ↔ FastAPI (en las pruebas siempre se simula). En la configuración local tampoco funcionaría: falta `AI_SERVICE_TOKEN` y `ANALISIS_HABILITADO` está apagado.
- Migraciones y restricciones sobre PostgreSQL (las pruebas usan SQLite).
- Guardado exitoso de un `analisis` en el flujo nuevo.
- Endpoints `ficha` (caso 200), `etapas` y los conteos de `direccion/cursos`.
- Activación de un modelo de punta a punta.
- Pipeline con fotografías reales (las pruebas usan imágenes sintéticas).

## 4. Dependencias de datos reales que todavía no existen

- **Dataset etiquetado de nivel inicial** (fotos de fichas con valoración S/ED/NA de docentes) para entrenar y validar el clasificador. Hoy el modelo es sintético y binario; sus métricas de 1.0 no tienen valor de validación.
- **Calibración de indicadores:** los pesos de `regularidad` (0.45/0.35/0.20), los factores de escala (2.5 y 1.5) y la falta de umbrales por edad o nivel requieren datos reales.
- **Plantillas de referencia y fichas físicas con marcas** para implementar la corrección de perspectiva, el recorte y la comparación contra la plantilla (`tamano_figura_mm` existe en la BD, pero el pipeline no lo usa).
- **Protocolo de captura** (iluminación, distancia, resolución mínima) para definir el control de calidad.
- **Evaluaciones reales en la base:** la tabla `evaluaciones` tiene 0 filas; solo hay 6 fotos, 3 análisis y 5 observaciones migrados del diseño anterior.
- **Consentimiento, autorización institucional y política de retención** para fotos de menores (ver `08_seguridad_y_privacidad.md`).
- **Definición final de HU-18 y HU-19** (NO ENCONTRADO).
