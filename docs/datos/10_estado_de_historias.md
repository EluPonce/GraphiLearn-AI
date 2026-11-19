# 10 · Estado de las historias de usuario

**Fuente de las HU.** La lista de HU-01 a HU-19 que se iba a adjuntar en la solicitud **no venía en el mensaje**. Se usó el Product Backlog v1.0 de `docs/referencias/Panel_1_Taller.pdf` (págs. 31–32), que define **HU-01 a HU-17**. **HU-18 y HU-19: NO ENCONTRADO** en el PDF ni en el repositorio. Si existen en otra versión del backlog, falta evaluarlas.

Criterio: **IMPLEMENTADA** = backend y uso real verificables. **PARCIAL** = existe una parte (por ejemplo, solo el backend, o falta un criterio). **NO IMPLEMENTADA** = no hay código que la cubra.

| HU | Nombre (PB v1.0) | Estado | Evidencia | Qué falta |
|---|---|---|---|---|
| HU-01 | Iniciar sesión | **IMPLEMENTADA** | `POST /api/v1/auth/login`, `AuthController@login`, `LoginView.jsx`, Sanctum con expiración de 60 min, `throttle:5,1`. Pruebas `test_user_login_success_and_failure`, `test_logout_revokes_token` | — |
| HU-02 | Gestionar estudiantes | **PARCIAL** | Solo lectura: `GET /students`, `GET /students/{id}`. `StudentController@store/update/destroy/restore` existen **sin ruta** y `StudentPolicy` devuelve `false`. `StudentsView.jsx` llama a rutas inexistentes y no está en el menú | Registrar, editar y dar de baja estudiantes. Hoy solo se crean por seeder |
| HU-03 | Gestionar ejercicios | **PARCIAL** | Solo lectura: `GET /exercises`. Escritura sin ruta; `ExercisePolicy` devuelve `false`. Catálogo fijo de 4 ejercicios del seeder; el flujo exige exactamente uno activo por tipo (`exerciseCatalog()`, error 503 si no) | Registrar, modificar y desactivar ejercicios desde la aplicación |
| HU-04 | Registrar actividad | **PARCIAL** (rediseñada) | Se reemplazó por **Evaluación** (curso + trimestre): `POST /api/evaluaciones` crea automáticamente una casilla por estudiante × 4 ejercicios. Prueba `test_new_evaluation_creates_four_empty_slots_per_student_and_is_unique` | Pantalla React que la use. El registro individual "estudiante + ejercicio + fecha" del PB ya no existe |
| HU-05 | Cargar imagen | **PARCIAL** | Backend: `POST /api/evaluaciones/{e}/estudiantes/{s}/ejercicios/{x}/foto`, disco privado, JPG/PNG, ≤ 5 MB. Prueba `test_photo_upload_works_without_fastapi...` | El frontend (`ActivityDetailView.jsx`) llama a `POST /api/v1/actividades/{id}/imagen`, que no existe; hoy no se puede subir una foto desde la interfaz |
| HU-06 | Validar imagen | **PARCIAL** | Formato y tamaño (Laravel), decodificación, ≥ 20×20 px y ≤ 10 MB (FastAPI) | Resolución mínima (el `ImageValidationService` de 640×480 no se usa), nitidez, iluminación y encuadre |
| HU-07 | Procesar imagen | **PARCIAL** | Pipeline en `ai-service/services/preprocessing.py` (grises, bilateral, Otsu, filtrado de componentes, Zhang-Suen) con pruebas sintéticas | Corrección de perspectiva y recorte (NO ENCONTRADO). La integración está apagada: `ANALISIS_HABILITADO` no está definido y falta `AI_SERVICE_TOKEN` en `.env`. No se probó con fotos reales |
| HU-08 | Extraer características | **IMPLEMENTADA** | `ai-service/services/features.py`: 7 características + posición normalizada. Prueba `test_geometric_features_calculation` | Validación con trazos reales |
| HU-09 | Generar indicadores | **IMPLEMENTADA** | `ai-service/services/indicators.py`: desviación (por tipo), rugosidad, continuidad, regularidad. Pruebas `test_deviation_regular_vs_irregular_line`, `test_roughness_and_regularity_behavior` | La desviación se mide contra una figura ideal ajustada, no contra la plantilla (`tamano_figura_mm` no se usa). Pesos sin calibrar |
| HU-10 | Clasificar resultado | **PARCIAL** | `ai-service/services/classifier.py` con respuesta segura sin modelo; `train.py`; artefacto RF local | El modelo se entrenó con datos **sintéticos** y clases 0/1, incompatibles con S/ED/NA; `manifest.json` está vacío, así que la sugerencia siempre es `null` |
| HU-11 | Registrar resultado | **PARCIAL** | `EvaluationFlowController@upload` guarda `analisis` (indicadores, características, sugerencia) cuando el análisis está activo | `id_modelo` siempre `null`; `rutas_etapas` siempre `null`; sin UNIQUE en `analisis.id_foto`; sin prueba que guarde un análisis exitoso en el flujo nuevo |
| HU-12 | Consultar resultado | **PARCIAL** | `GET /api/v1/actividades/{id}/resultado`; `StudentProgressView.jsx` (pestaña Historial) muestra los 11 indicadores y la sugerencia | Funciona solo con los 3 análisis migrados; el flujo nuevo no genera análisis con la configuración actual. `GET /api/fotos/{id}/etapas` devuelve todo `null` |
| HU-13 | Consultar historial | **PARCIAL** | Backend: `GET /api/estudiantes/{id}/ficha` (4 ejercicios × T1–T3 y observaciones). UI: `StudentProgressView.jsx` (pestaña Historial, vía `/students/{id}/progress`) | La UI no consume la ficha nueva ni muestra T1–T3 |
| HU-14 | Visualizar evolución | **PARCIAL** | `comparable_evolution` en `LegacyReadController@studentProgress` compara **valoraciones** S/ED/NA entre trimestres | No hay evolución de **indicadores** (lo que pide la HU) ni gráficos |
| HU-15 | Registrar observaciones | **PARCIAL** | Backend: campo `observacion` en `PUT .../valoracion` → tabla `observaciones` con autor. Verificado en `03_api.md` §3.7 | No se pueden editar ni registrar observaciones sin valorar; la UI llama a `PUT /api/v1/actividades/{id}/evaluacion`, que no existe |
| HU-16 | Gestionar versión del modelo | **PARCIAL** | `ModelVersionController` (listar, registrar, activar, desactivar), `ModelVersionsView.jsx`, carga con manifiesto y SHA-256. Pruebas de rol y de ruta | No se puede activar ningún modelo (manifiesto vacío). No cumple "identificar qué versión produjo cada resultado": `analisis.id_modelo = null` siempre |
| HU-17 | Consultar trazabilidad | **PARCIAL** | Existen las piezas por separado: foto (`/imagenes/{id}/download`), características, indicadores y sugerencia (`/actividades/{id}/resultado`) | No hay una vista ni un endpoint que una imagen → características → indicadores → resultado → **modelo**; el vínculo con el modelo no se guarda; las etapas no se generan |
| HU-18 | — | **NO ENCONTRADO** | No figura en el Product Backlog del PDF ni en el código | — |
| HU-19 | — | **NO ENCONTRADO** | No figura en el Product Backlog del PDF ni en el código | — |

Funcionalidades construidas que **no tienen HU** en el PB v1.0:

- Valoración pedagógica S/ED/NA de la docente (`PUT .../valoracion`).
- Cuadro de evaluación (`/cursos/{id}/evaluaciones/{t}`).
- Informe del curso (`/informes/curso/{id}`).
- Vista de Dirección (`/direccion/cursos`).
- Rol `direccion`.

## Diferencias entre lo planeado y lo construido

| Tema | Planeado (PB v1.0 / Panel 1 / documentación previa) | Construido (código actual) |
|---|---|---|
| Versión de Laravel | Laravel 11 (`GraphiLearn/Prompt Panel1.md`, citado en `docs/sprint-2/pendientes-academicos.md`) | Laravel 12.69.2, React 19.3, Vite 7.3 |
| Python | No especificado | Docker: 3.12; máquina local: 3.14.5 |
| Roles | Docente, administrador y "usuario autorizado" (HU-17) | `docente`, `direccion` (nuevo) y `administrador`. El administrador **solo** gestiona versiones del modelo; nadie puede gestionar estudiantes, cursos ni ejercicios desde la aplicación |
| Unidad de trabajo | "Actividad" = estudiante + ejercicio + fecha (HU-04) | "Evaluación" = curso + **trimestre (1–3)** + nivel (1–3) + `tamano_figura_mm`, con 4 casillas fijas por estudiante (línea, círculos, zigzag, espiral) |
| Periodos | Sin periodo definido | Trimestres T1–T3; restricción UNIQUE `(id_curso, trimestre)` |
| Resultado del sistema | "Clasificación" automática (HU-10/11), orientada a riesgo (`risk_label`, `risk_score` en la primera migración) | La valoración final es **manual de la docente (S/ED/NA)**; la IA solo da una "sugerencia experimental" opcional. `risk_*` se renombró o eliminó |
| Modelo | Clasificador entrenado con datos del dominio | RandomForest entrenado con datos **sintéticos**, clases binarias de riesgo; no se puede cargar (manifiesto vacío) |
| Cuadro de evaluación | No figura en el PB | Implementado en el backend; **no** en React |
| Pantallas | Formularios por HU (registrar actividad, cargar imagen, consultar resultado) | Pantallas del diseño intermedio (actividades programadas y trabajos) que leen por un puente de compatibilidad; las acciones de escritura apuntan a rutas eliminadas |
| API | `/api/v1` | Conviven `/api` (con el flujo nuevo) y `/api/v1` (sin el flujo nuevo); el frontend solo usa `/api/v1` |
| Despliegue | Laravel + FastAPI + PostgreSQL | `docker-compose.yml` solo define `ai-service` |
| Trazabilidad | Imagen → características → indicadores → resultado → modelo (HU-16/17) | No se guarda el modelo usado (`id_modelo = null`) ni las imágenes de etapas |
| Control de versiones | Desarrollo iterativo por sprints | **1 commit** en todo el repositorio (2026-10-29); 64 archivos modificados y 39 sin seguimiento sin commit (ver `11_git.md`) |
