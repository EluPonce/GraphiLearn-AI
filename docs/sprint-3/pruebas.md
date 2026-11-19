# Sprint 3 — Plan y Reporte de Pruebas

## 2.2. Pruebas

En este apartado se detalla la verificación integral del incremento del Sprint 3, contrastando los casos de prueba previstos contra los resultados reales obtenidos mediante la ejecución de las suites de prueba en el entorno local del proyecto.

---

### 2.2.1. Plan de Prueba

El plan de pruebas aborda las funcionalidades pedagógicas, la protección de evidencias fotográficas, el aislamiento por roles y la integridad de la base de datos PostgreSQL:

| ID | Historia de Usuario | Tipo de Prueba / Procedimiento Previsto | Criterio de Aceptación / Comprobación | Entorno y Dobles de Prueba |
|---|---|---|---|---|
| **TP3-04** | HU-04 Registrar actividad / programación | Feature test: creación de programación multiejercicio y generación de slots para estudiantes del curso | Creación exitosa con lista ordenada de ejercicios; rechazo de ejecuciones duplicadas (código HTTP 409) | Laravel PHPUnit (`EvaluationApiTest`) con base SQLite / PostgreSQL |
| **TP3-05** | HU-05 Cargar fotografía | Feature test: subida multipart de fotos JPG y PNG válidas e inválidas | Aceptar formatos permitidos y resolución $\ge 640\times 480$; rechazar archivos corruptos o extensiones no autorizadas (HTTP 422) | Almacenamiento privado local simulado (`Storage::fake`) |
| **TP3-12** | HU-12 Consultar resultado | Feature test: consultar endpoint de resultado tras procesamiento exitoso de FastAPI | La respuesta incluye características geométricas e indicadores cuantitativos; aviso pedagógico de no diagnóstico | `FastApiClient` con respuesta autenticada (`X-Internal-Token`) |
| **TP3-13** | HU-13 Consultar historial | Feature test: docente consulta lista de actividades y evidencias de un estudiante | Se retorna la lista cronológica completa; el administrador no puede ver fotos privadas de estudiantes | Control de acceso por Policy (`puedeAccederAlCurso`) |
| **TP3-14** | HU-14 Visualizar evolución | Feature test: consulta del endpoint de progreso individual | Agrupación correcta por tipo de ejercicio y referencia de periodo; cálculo coherente de registros evaluados | Endpoint `GET /api/v1/students/{id}/progress` |
| **TP3-15** | HU-15 Registrar valoración (S/ED/NA) | Feature test: emisión de calificación cualitativa manual y texto de observación | Persistencia del valor S, ED o NA; rechazo de notas arbitrarias fuera del enum; actualización del estado a `valorado` | Endpoint `PUT /api/v1/actividades/{id}/evaluacion` |
| **TP3-17** | HU-17 Consultar trazabilidad | Feature test: múltiples ediciones de valoración docente sobre una misma actividad | Cada modificación almacena el valor anterior y el usuario actor en `activity_evaluation_history` sin sobreescribir | Verificación de inserciones en tabla de historial |
| **TP3-SEC** | Seguridad de Roles | Feature test: intentos de acceso cruzado entre docentes y acceso administrativo a datos de aula | Un docente no puede ver cursos ni alumnos de otro docente (HTTP 403); la administradora no puede evaluar (HTTP 403) | `PhaseOneSecurityTest` y `EvaluationApiTest` |
| **TP3-IA** | Pipeline OpenCV | Pytest: procesamiento de imágenes sintéticas y extracción de descriptores | 20 casos de prueba pasando (decodificación, Zhang-Suen, curvatura, regularidad, contrato `/api/analyze`) | Entorno Python 3.14 con OpenCV 5 y TestClient |

---

### 2.2.2. Reporte de Prueba

#### Resumen Ejecutivo de Ejecución Automatizada

Todas las suites de prueba automatizadas fueron ejecutadas localmente con **resultado 100% satisfactorio**:

| Componente del Sistema | Comando de Ejecución | Resultado Observado | Tiempo / Asertos | Entorno Real Verificado |
|---|---|---|---|---|
| **Backend Laravel** | `php artisan test` | **PASS (38 pasadas de 38)** | 8.72 s (203 aserciones) | PHP 8.2.12, Laravel 12, PHPUnit 11.5 |
| **Microservicio IA** | `pytest` en `ai-service/` | **PASS (20 pasadas de 20)** | 3.44 s (0 fallos) | Python 3.14.5, FastAPI 0.141, OpenCV 5.0 |
| **Base de Datos** | `php artisan migrate:status` | **Todas las migraciones aplicadas** | 18 de 18 migraciones [Ran] | PostgreSQL 17.7 (puerto 5432) |
| **Frontend React** | `npm run build` | **Compilación Exitosa** | 9.43 s (1.970 módulos) | Vite 7.3.6, React 19 |

---

#### Detalle de Casos de Prueba Ejecutados en Laravel (38 Tests)

A continuación se listan las pruebas unitarias y de integración ejecutadas por PHPUnit:

##### 1. Suite `Tests\Feature\EvaluationApiTest` (8 tests)
* `✓ teacher cannot open another teachers course`: Comprueba que una docente no pueda acceder al aula de otra docente (403 Forbidden).
* `✓ new evaluation creates four empty slots per student and is unique`: Verifica la creación de las ranuras de ejercicio por estudiante y la restricción de unicidad.
* `✓ admin cannot create or rate evaluations but can keep model management role`: Asegura que el rol administrador no pueda calificar pedagógicamente a niños.
* `✓ direction can read courses but cannot rate`: Valida que el rol dirección sea de solo lectura institucional.
* `✓ photo upload works without fastapi and stays private until teacher rates`: Verifica que la fotografía se almacene de forma privada incluso si el servicio de IA estuviera apagado.
* `✓ photo upload falls back to manual rating when fastapi is down`: Asegura que una caída de FastAPI no bloquee el trabajo docente ni la valoración manual.
* `✓ report counts ratings and two na items for observation`: Comprueba la agregación cuantitativa de valoraciones para reportes de curso.
* `✓ legacy react reads assigned courses students and photos after rename`: Garantiza la compatibilidad de lectura del frontend tras las migraciones incrementales.

##### 2. Suite `Tests\Feature\EvaluationRoutesV1Test` (10 tests)
* `✓ evaluation flow is available under v1`: Verifica que todas las rutas del flujo evaluativo respondan bajo el prefijo `/api/v1/`.
* `✓ direction uses its own course route`: Valida la ruta institucional para lectura de cursos.
* `✓ direction can read course report but cannot rate`: Confirma que dirección consulta informes sin permisos de escritura evaluativa.
* `✓ teacher cannot read report of another teachers course`: Restringe la lectura de informes al docente titular.
* `✓ rating response exposes only id and name of the rater`: Protege la privacidad del evaluador exponiendo únicamente su identificación básica.
* `✓ grid exposes exercise description and analysis summary`: Verifica que la matriz de evaluación muestre la descripción del ejercicio y las métricas computacionales.
* `✓ rating stores observation per exercise and sheet returns it`: Confirma que la observación cualitativa se almacene por ejercicio y se refleje en la ficha pedagógica.
* `✓ direction course list reports completed students`: Comprueba que la lista de cursos para dirección reporte conteos de avance.
* `✓ successful analysis is stored with features indicators and notice`: Valida que el resultado del análisis guarde características geométricas, indicadores y aviso pedagógico.
* `✓ photo upload rejects wrong format and oversized files with reason`: Rechaza archivos con extensiones no permitidas o pesos superiores a 5 MB con mensaje explicativo.

##### 3. Suite `Tests\Feature\PhaseOneSecurityTest` (5 tests)
* `✓ public registration cannot create an administrator`: Impide la creación de cuentas de administrador mediante registros no autorizados.
* `✓ teacher cannot access another teachers student`: Impide que un docente consulte la ficha de un estudiante ajeno.
* `✓ direction is read only and scoped to its institution`: Aísla la consulta de dirección exclusivamente a su institución.
* `✓ administrator is limited to model version management`: Delimita las funciones del administrador técnico.
* `✓ model version path cannot escape ai service root`: Previene vulnerabilidades de Path Traversal al registrar rutas de modelos.

##### 4. Suite `Tests\Feature\GraphiLearnInitialBackendTest` (11 tests)
* Cubre autenticación (`login`, `logout`, `me`, tokens expirados), carga de seeders, restricción de registro público y consultas base de estudiantes y cursos.

##### 5. Suite `Tests\Feature\GraphiLearnSprint2BackendTest` (2 tests)
* Comprueba la compatibilidad de lectura de actividades heredadas y el control de acceso a la gestión de modelos de IA.

##### 6. Suite `Tests\Unit\ExampleTest` y `Feature\ExampleTest` (2 tests)
* Verificación básica de aserciones del framework y respuesta HTTP base.

---

#### Detalle de Casos de Prueba Ejecutados en FastAPI (20 Tests en `test_ai_service.py`)

1. `test_decode_image_valid`: Decodificación correcta de imágenes válidas en memoria.
2. `test_decode_image_empty_raises_error`: Rechazo controlado (HTTP 422) ante payload vacío.
3. `test_decode_image_corrupt_raises_error`: Rechazo controlado ante archivo de bytes corruptos.
4. `test_preprocessing_detects_stroke_in_valid_image`: Detección efectiva de trazos tras filtro bilateral y Otsu invertido.
5. `test_preprocessing_fails_on_blank_paper`: Manejo controlado de hojas en blanco sin trazo visible.
6. `test_skeletonization_produces_single_pixel_thickness`: Validación del adelgazamiento Zhang-Suen (espesor de un píxel).
7. `test_geometric_features_calculation`: Cálculo correcto de longitud, caja delimitadora, inclinación y proporción.
8. `test_deviation_regular_vs_irregular_line`: Comprobación de que una línea irregular produce mayor desviación matemática que una recta.
9. `test_roughness_and_regularity_behavior`: Comprobación de rangos numéricos $[0, 1]$ para regularidad y continuidad.
10. `test_classifier_returns_safe_not_available_when_no_model`: Retorno seguro de `disponible: false` y score nulo en ausencia de modelo cargado.
11. `test_api_endpoint_analyze_contract`: Verificación del esquema JSON de respuesta bajo el contrato Pydantic.
12. *Pruebas adicionales de modelos y endpoints:* Carga segura, descarga en memoria, verificación de token interno y validación de tipos de ejercicio (círculo, espiral, zigzag).

---

#### Conclusión del Reporte de Pruebas

El incremento del Sprint 3 demuestra **alta robustez y estabilidad**:
* El sistema garantiza la integridad referencial y la prevención de registros duplicados en PostgreSQL.
* El flujo *Human-in-the-Loop* funciona con precisión: la IA computa métricas objetivas como insumo de apoyo, mientras que la docente conserva el control soberano sobre la calificación oficial (S / ED / NA).
* No existen vulnerabilidades de exposición pública de fotografías de menores ni brechas de acceso entre cursos.
