# Pendientes y problemas verificados

Ordenados por prioridad técnica. Son observaciones de lectura estática del repositorio; no implican que se haya reproducido cada comportamiento en ejecución.

## Alta

1. **Activación de modelo puede desincronizar Laravel y FastAPI.** `ModelVersionController::activate()` ignora el booleano que devuelve `cargarModeloEnFastApi()` y, después, marca activa la versión en la base de datos aunque el servicio esté apagado o rechace la carga. Laravel puede indicar un modelo activo que FastAPI no tiene cargado. Revisar `app/Http/Controllers/Api/V1/ModelVersionController.php` y `app/Services/FastApiClient.php`.
2. **Desactivación no descarga el modelo del microservicio.** `deactivate()` cambia únicamente `active` en Laravel; no invoca `/api/models/unload`. La instancia FastAPI conserva el modelo en memoria y puede seguir clasificando con él. Revisar `app/Http/Controllers/Api/V1/ModelVersionController.php`, `app/Services/FastApiClient.php` y `ai-service/routers/models.py`.
3. **El dashboard cuenta estados que no pertenecen al enum vigente.** `DashboardController` cuenta `pendiente_imagen` e `imagen_cargada`, mientras la migración limita `actividades.estado` a `pendiente`, `procesando`, `procesado` y `error`. Los conteos de pendientes y actividades con imagen no corresponden al esquema vigente. Revisar `app/Http/Controllers/Api/V1/DashboardController.php` y `database/migrations/2026_09_18_130002_add_processing_fields_to_actividades_table.php`.
4. **Persistencia de las pantallas principales incompleta en React.** `App.jsx` crea listas de estudiantes, ejercicios y actividades con datos locales. `StudentsView.jsx`, `ExercisesView.jsx` y `NewActivityView.jsx` operan sobre setters locales; no se observan llamadas a los endpoints Laravel de CRUD en esas vistas. Cambios y altas no quedan conectados a persistencia/API desde esos flujos. Revisar `resources/js/App.jsx`, `resources/js/views/StudentsView.jsx`, `resources/js/views/ExercisesView.jsx`, `resources/js/views/NewActivityView.jsx`; los endpoints existen en `routes/api/v1/students.php`, `exercises.php` y `actividades.php`.

## Media

5. **Suite de backend no demuestra integración real con FastAPI.** Los escenarios de análisis de `GraphiLearnSprint2BackendTest` simulan respuestas HTTP con `Http::fake`. Esto prueba la orquestación Laravel contra fixtures, pero no serialización multipart, disponibilidad, URL, ni compatibilidad real del esquema entre procesos. Revisar `tests/Feature/GraphiLearnSprint2BackendTest.php`, `app/Services/FastApiClient.php` y `ai-service/routers/analysis.py`.
6. **Sin cobertura automatizada visible para la interfaz.** El repositorio incluye pruebas feature/unit de Laravel y pytest del servicio Python, pero no se hallaron pruebas React en el árbol de `resources/js`. Revisar `package.json`, `resources/js/` y la lista de archivos de pruebas.
7. **Validación del clasificador usa datos sintéticos.** El script y el JSON benchmark documentan datos generados artificialmente y solicitan un dataset clínico de nivel inicial antes de despliegue clínico. Las métricas guardadas no validan generalización a trazos reales. Revisar `ai-service/training/train.py` y `ai-service/models/randomforest_v1.0-benchmark_metrics.json`.
8. **Cobertura de imágenes sintéticas acotada.** Las pruebas del pipeline generan círculos, líneas y papel en blanco; no se identifican casos de integración con fotografías reales ni pruebas explícitas de `/predict`, rutas de carga/descarga de modelos o formatos de imagen del mundo real. Revisar `ai-service/tests/test_ai_service.py` y `ai-service/routers/models.py`.

## Baja / aclaraciones de documentación

9. **README del microservicio está desactualizado frente al código.** `ai-service/README.md` lo describe como stub y documenta `/predict` como endpoint central con un payload anterior; el código implementa `/api/analyze`, esquemas completos y routers de modelos. Actualizar el README cuando se autorice tocar documentación existente. Revisar `ai-service/README.md`, `ai-service/main.py` y `ai-service/routers/analysis.py`.
10. **Hay dos implementaciones de middleware de rol.** Existen `RoleMiddleware.php` y `CheckRole.php`; revisar si ambas son necesarias y cuál está registrada para evitar mantenimiento duplicado. Revisar `app/Http/Middleware/RoleMiddleware.php`, `app/Http/Middleware/CheckRole.php` y `bootstrap/app.php`.

## Estado de verificación

Las pruebas mencionadas existen en el repositorio, pero no se ejecutaron como parte de esta documentación. No se atribuyen resultados de ejecución. La configuración `.env` indica PostgreSQL para el entorno local; no se usó eso como evidencia de una conexión activa o migraciones aplicadas.
