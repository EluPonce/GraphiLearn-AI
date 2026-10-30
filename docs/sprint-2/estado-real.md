# Estado real de GraphiLearn AI

**Corte de revisión:** 25 de octubre de 2026. Este documento describe el código y los artefactos presentes en el repositorio. La existencia de una prueba se distingue de su ejecución: durante esta documentación no se ejecutaron pruebas.

## Resumen

El repositorio contiene una aplicación Laravel con API autenticada, una interfaz React servida por Vite, un microservicio FastAPI y un pipeline OpenCV que decodifica imágenes, limpia el trazo, lo esqueletiza, extrae geometría e indicadores y consulta un clasificador opcional. Laravel implementa el flujo de almacenamiento y persistencia de resultados. La integración de interfaz con backend es parcial: algunas pantallas llaman a la API, mientras estudiantes, ejercicios y actividades se mantienen principalmente en estado local de React.

El entorno local descrito por `.env` selecciona PostgreSQL (`pgsql`, puerto 5432, base `graphilearn`). Laravel también define conexión PostgreSQL en `config/database.php`; `.env.example` usa SQLite. Esta constatación de configuración no demuestra por sí sola que una instancia de PostgreSQL estuviera disponible o que se hubieran aplicado las migraciones en la revisión actual.

## Laravel

**Implementado en el repositorio:**

- API v1 para autenticación con Sanctum, cursos, estudiantes, ejercicios, actividades, carga/descarga/eliminación de imágenes, dashboard, análisis y gestión de versiones de modelo. Rutas en `routes/api.php` y `routes/api/v1/*.php`.
- Controladores, requests de validación, policies, recursos JSON y middleware de roles. Se incluyen roles de docente y administrador; el procesamiento comprueba acceso al estudiante y a la actividad.
- Servicios para validar y guardar imágenes, consumir FastAPI y orquestar el análisis. `AnalysisService` evita duplicados y solicitudes concurrentes, llama a FastAPI y persiste un único resultado por actividad en una transacción.
- Migraciones para instituciones, usuarios, cursos, estudiantes, ejercicios, actividades, imágenes, resultados y versiones de modelo. El resultado guarda mediciones geométricas, indicadores, etiqueta/score, revisión pedagógica y detalles computacionales.
- El controlador de versiones verifica el archivo al registrarlo/activarlo y solicita su carga a FastAPI. El cliente HTTP permite configurar URL y timeout mediante `AI_SERVICE_URL` y `AI_SERVICE_TIMEOUT`.

**Pruebas escritas:** `tests/Feature/GraphiLearnInitialBackendTest.php` cubre seeder, autenticación, acceso por rol y listados. `tests/Feature/GraphiLearnSprint2BackendTest.php` contiene escenarios para procesar actividad, permisos, falta de imagen, indisponibilidad/timeout, respuesta inválida, duplicados y versiones de modelo. Las llamadas a FastAPI se sustituyen con `Http::fake`; por tanto, esos escenarios no prueban una comunicación real con el microservicio. No se afirma aquí que estas pruebas hayan pasado.

## React

**Implementado en el repositorio:**

- Aplicación React 19 montada desde `resources/js/main.jsx`, con vistas de login, dashboard, cursos, estudiantes, ejercicios, actividades, detalle, análisis y perfil.
- El login y logout llaman a la API y guardan token/usuario en `localStorage`; Axios envía el token Bearer. Cursos y algunas operaciones de detalle/imagen/análisis consultan rutas Laravel.
- `ActivityDetailView.jsx` permite cargar una imagen y solicitar el procesamiento. `AnalysisView.jsx` intenta leer el resultado almacenado.
- `App.jsx` inicializa estudiantes, ejercicios y actividades con datos locales de ejemplo. Las vistas de estudiantes, ejercicios y nueva actividad modifican ese estado, sin llamadas API visibles en esas vistas para persistir sus cambios. El dashboard recibe esos datos locales. Cursos sí carga desde API y usa datos de respaldo si falla.

**Pruebas:** no se encontraron pruebas automatizadas de React en los archivos de aplicación revisados. El código de Laravel no las sustituye.

## FastAPI y OpenCV

**Implementado en el repositorio:**

- `ai-service/main.py` monta routers de análisis y modelos, configura CORS y publica health check. Existe `/api/analyze`, administración del clasificador bajo `/api/models/*` y el endpoint de compatibilidad `/predict`.
- `/api/analyze` valida tipo de contenido y tamaño de archivo; el procesamiento decodifica con OpenCV, escala imágenes grandes, convierte a gris, aplica filtro bilateral, umbral de Otsu invertido, elimina componentes pequeños y aplica Zhang–Suen.
- Se calculan longitud, caja delimitadora, proporción, orientación, curvatura, separación y posición normalizada; además desviación respecto a patrón, rugosidad, continuidad y regularidad.
- El servicio devuelve un esquema tipado y, si no hay modelo cargado, responde explícitamente `no_disponible` sin asignar score.

**Pruebas escritas:** `ai-service/tests/test_ai_service.py` cubre decodificación válida/vacía/corrupta, imagen en blanco, preprocesamiento, adelgazamiento, algunas propiedades geométricas e indicadores, modo de clasificador no disponible y contrato HTTP de análisis. Las imágenes de prueba son generadas sintéticamente. No se ejecutaron en esta revisión.

## Random Forest

**Implementado en el repositorio:** `ai-service/training/train.py` genera un conjunto sintético determinista por sujeto y entrena un pipeline `StandardScaler` + `RandomForestClassifier`; también contempla SVM. El artefacto `ai-service/models/randomforest_v1.0-benchmark.joblib` y su JSON de métricas están presentes. `RiskClassifier` puede cargar un paquete joblib y construir una predicción con once variables.

El artefacto está descrito por el propio script y el JSON como benchmark reproducible/sintético. No es evidencia de validación clínica ni de rendimiento en dibujos reales de niñas y niños de nivel inicial. La regla sintética asigna clases por sujeto y genera variables con rangos prefijados por clase; el modelo puede aprender esas reglas artificiales. Las métricas del JSON pertenecen a esa partición sintética y no se deben presentar como precisión esperada en campo. El código indica expresamente que hace falta un conjunto clínico de nivel inicial.

## PostgreSQL

**Implementado/configurado:** `config/database.php` define conexión `pgsql`; el `.env` presente selecciona `pgsql` y la base local `graphilearn`. Las migraciones crean el esquema relacional, claves foráneas y campos JSON para mediciones/metadatos. `.env.example` conserva SQLite como configuración de ejemplo. La configuración no certifica disponibilidad, estado de migraciones ni una prueba de integración real contra PostgreSQL en este corte.

## Fuentes principales

`routes/api/v1/`, `app/Services/`, `app/Http/Controllers/Api/V1/`, `database/migrations/`, `resources/js/`, `ai-service/main.py`, `ai-service/routers/`, `ai-service/services/`, `ai-service/training/train.py`, `ai-service/tests/test_ai_service.py` y las pruebas feature Laravel.
