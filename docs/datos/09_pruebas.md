# 09 · Pruebas

## 1. Ejecución

### 1.1 Laravel (PHPUnit)

```
Fecha y hora de ejecución: 2026-11-14 19:05:02 -0400
$ php artisan test --compact

  ............................

  Tests:    28 passed (92 assertions)
  Duration: 3.87s

exit: 0
```

### 1.2 FastAPI (pytest)

Se ejecutó con `-p no:cacheprovider` porque la carpeta `.pytest_cache` existente tiene permisos que deniegan el acceso. No se cambió nada más.

```
Fecha y hora de ejecución: 2026-11-14 19:05:08 -0400
$ python -m pytest -v -p no:cacheprovider
============================= test session starts =============================
platform win32 -- Python 3.14.5, pytest-9.1.1, pluggy-1.7.0 -- C:\Users\HP\AppData\Local\Programs\Python\Python314\python.exe
rootdir: E:\9no semestre\Taller de Grado\2-2026\Proyecto_Taller\ai-service
plugins: anyio-4.15.1, platformdirs-4.14.0
collecting ... collected 16 items

tests/test_ai_service.py::test_decode_image_valid PASSED                 [  6%]
tests/test_ai_service.py::test_decode_image_empty_raises_error PASSED    [ 12%]
tests/test_ai_service.py::test_decode_image_corrupt_raises_error PASSED  [ 18%]
tests/test_ai_service.py::test_preprocessing_detects_stroke_in_valid_image PASSED [ 25%]
tests/test_ai_service.py::test_preprocessing_fails_on_blank_paper PASSED [ 31%]
tests/test_ai_service.py::test_skeletonization_produces_single_pixel_thickness PASSED [ 37%]
tests/test_ai_service.py::test_geometric_features_calculation PASSED     [ 43%]
tests/test_ai_service.py::test_deviation_regular_vs_irregular_line PASSED [ 50%]
tests/test_ai_service.py::test_roughness_and_regularity_behavior PASSED  [ 56%]
tests/test_ai_service.py::test_classifier_returns_null_suggestion_when_no_model PASSED [ 62%]
tests/test_ai_service.py::test_api_endpoint_analyze_contract PASSED      [ 68%]
tests/test_ai_service.py::test_all_endpoints_reject_missing_internal_token PASSED [ 75%]
tests/test_ai_service.py::test_root_requires_internal_token_and_does_not_advertise_legacy_routes PASSED [ 81%]
tests/test_ai_service.py::test_model_load_rejects_identifier_outside_allowlist PASSED [ 87%]
tests/test_ai_service.py::test_model_load_rejects_client_supplied_file_path PASSED [ 93%]
tests/test_ai_service.py::test_model_load_requires_allowlisted_id_and_matching_hash PASSED [100%]

============================== warnings summary ===============================
C:\Users\HP\AppData\Local\Programs\Python\Python314\Lib\site-packages\fastapi\testclient.py:1
  C:\Users\HP\AppData\Local\Programs\Python\Python314\Lib\site-packages\fastapi\testclient.py:1: StarletteDeprecationWarning: Using `httpx` with `starlette.testclient` is deprecated; install `httpx2` instead.
    from starlette.testclient import TestClient as TestClient  # noqa

C:\Users\HP\AppData\Local\Programs\Python\Python314\Lib\site-packages\starlette\testclient.py:53
  C:\Users\HP\AppData\Local\Programs\Python\Python314\Lib\site-packages\starlette\testclient.py:53: DeprecationWarning: The anyio.abc.BlockingPortal alias is deprecated, use anyio.from_thread.BlockingPortal instead.
    _PortalFactoryType = Callable[[], AbstractContextManager[anyio.abc.BlockingPortal]]

-- Docs: https://docs.pytest.org/en/stable/how-to/capture-warnings.html
======================= 16 passed, 2 warnings in 1.83s ========================
exit: 0
```

**Resultado:** 28 pruebas Laravel (92 aserciones) y 16 pruebas pytest, todas aprobadas.

## 2. Lista de pruebas por archivo

### `GraphiLearn/tests/Feature/EvaluationApiTest.php` (flujo nuevo)

| Prueba | Qué verifica |
|---|---|
| `test_teacher_cannot_open_another_teachers_course` | Una docente recibe 403 al abrir el cuadro de un curso de otra docente |
| `test_new_evaluation_creates_four_empty_slots_per_student_and_is_unique` | Crear una evaluación genera 4 casillas por estudiante, el cuadro muestra 4 ejercicios y repetir curso y trimestre da 409 |
| `test_admin_cannot_create_or_rate_evaluations_but_can_keep_model_management_role` | El administrador recibe 403 al crear una evaluación y 200 en versiones del modelo |
| `test_direction_can_read_courses_but_cannot_rate` | Dirección: 200 en `/direccion/cursos` y en el cuadro; 403 al valorar; la casilla sigue `sin_foto` |
| `test_photo_upload_works_without_fastapi_and_stays_private_until_teacher_rates` | Con el análisis apagado, la foto queda en el disco privado bajo `/{id_foto}/`, en estado `foto_lista` y sin análisis; después la valoración ED pasa el estado a `valorado` |
| `test_photo_upload_falls_back_to_manual_rating_when_fastapi_is_down` | Con el análisis activo y FastAPI simulado caído (`ConnectionException`), responde 201 con `analisis_disponible: false` |
| `test_report_counts_ratings_and_two_na_items_for_observation` | El informe cuenta S/ED/NA por ejercicio y lista al estudiante con 2 NA |
| `test_legacy_react_reads_assigned_courses_students_and_photos_after_rename` | Las rutas `/api/v1` de compatibilidad (cursos, estudiantes, actividades con filtro de fecha, progreso) leen las fotos después del renombrado, incluso con el curso inactivo |

### `GraphiLearn/tests/Feature/GraphiLearnInitialBackendTest.php`

| Prueba | Qué verifica |
|---|---|
| `test_database_seeder_loads_all_initial_data` | El `DatabaseSeeder` crea la institución, los usuarios, los cursos, los estudiantes y los 4 ejercicios |
| `test_public_teacher_registration_is_disabled` | El registro público no crea una docente |
| `test_user_login_success_and_failure` | Login correcto devuelve un token; credenciales incorrectas fallan |
| `test_auth_me_returns_user_data_when_authenticated` | `/auth/me` devuelve el usuario |
| `test_auth_me_unauthenticated_returns_401` | Sin token responde 401 |
| `test_logout_revokes_token` | El logout invalida el token |
| `test_teacher_can_access_students_list` | La docente lista estudiantes |
| `test_admin_cannot_access_students_list` | El administrador recibe 403 en estudiantes |
| `test_admin_cannot_access_courses` | El administrador recibe 403 en cursos |
| `test_teacher_can_access_assigned_courses` | La docente ve sus cursos |
| `test_unauthenticated_cannot_access_students_list` | Sin token responde 401 en estudiantes |

### `GraphiLearn/tests/Feature/GraphiLearnSprint2BackendTest.php`

| Prueba | Qué verifica |
|---|---|
| `test_legacy_activity_read_is_available_but_old_processing_route_is_not_exposed` | `GET /api/v1/actividades` responde 200 y `POST /api/v1/actividades/1/procesar` responde 404 |
| `test_only_administrator_can_access_model_version_management` | Versiones del modelo: 200 para el administrador, 403 para la docente |

### `GraphiLearn/tests/Feature/PhaseOneSecurityTest.php`

| Prueba | Qué verifica |
|---|---|
| `test_public_registration_cannot_create_an_administrator` | Registrar con rol administrador da 422 y no crea el usuario |
| `test_teacher_cannot_access_another_teachers_student` | 403 en la ficha de un estudiante de otra docente |
| `test_direction_is_read_only_and_scoped_to_its_institution` | Dirección lee `/direccion/cursos` y recibe 403 al escribir |
| `test_administrator_is_limited_to_model_version_management` | El administrador recibe 200 en versiones y 403 en cursos y estudiantes |
| `test_model_version_path_cannot_escape_ai_service_root` | Registrar una versión con una ruta fuera de `AI_SERVICE_ROOT` da 422 y no se guarda |

### `GraphiLearn/tests/Feature/ExampleTest.php` y `GraphiLearn/tests/Unit/ExampleTest.php`

| Prueba | Qué verifica |
|---|---|
| `test_the_application_returns_a_successful_response` | `GET /` responde 200 (plantilla de Laravel) |
| `test_that_true_is_true` | Plantilla de Laravel, sin valor funcional |

### `ai-service/tests/test_ai_service.py`

Las imágenes de prueba son **sintéticas**, generadas con OpenCV en el propio archivo (círculo, línea, hoja en blanco). No se usan fotos reales.

| Prueba | Qué verifica |
|---|---|
| `test_decode_image_valid` | Decodifica una imagen válida |
| `test_decode_image_empty_raises_error` | Bytes vacíos lanzan `PreprocessingError` |
| `test_decode_image_corrupt_raises_error` | Bytes corruptos lanzan `PreprocessingError` |
| `test_preprocessing_detects_stroke_in_valid_image` | El preprocesamiento encuentra trazo en una imagen con un círculo |
| `test_preprocessing_fails_on_blank_paper` | Una hoja en blanco lanza "sin trazos significativos" |
| `test_skeletonization_produces_single_pixel_thickness` | Zhang-Suen deja 1 px de grosor en una barra de 8 px |
| `test_geometric_features_calculation` | Las características tienen valores coherentes |
| `test_deviation_regular_vs_irregular_line` | Una línea irregular da mayor desviación que una regular |
| `test_roughness_and_regularity_behavior` | Un trazo irregular tiene más rugosidad y menos regularidad |
| `test_classifier_returns_null_suggestion_when_no_model` | Sin modelo: `disponible: false`, `sugerencia: null` |
| `test_api_endpoint_analyze_contract` | `/api/analyze` devuelve los bloques del contrato |
| `test_all_endpoints_reject_missing_internal_token` | Sin `X-Internal-Token` responde 401 |
| `test_root_requires_internal_token_and_does_not_advertise_legacy_routes` | `/` exige token y no lista rutas antiguas |
| `test_model_load_rejects_identifier_outside_allowlist` | Rechaza un `model_id` que no está en el manifiesto |
| `test_model_load_rejects_client_supplied_file_path` | Rechaza que el cliente envíe una ruta de archivo |
| `test_model_load_requires_allowlisted_id_and_matching_hash` | Solo carga un modelo si su id está en el manifiesto y el SHA-256 coincide |

## 3. ¿Las pruebas usan una base separada?

**Sí.** `GraphiLearn/phpunit.xml` fija:

```xml
<env name="DB_CONNECTION" value="sqlite"/>
<env name="DB_DATABASE" value=":memory:"/>
<env name="DB_URL" value=""/>
<env name="AI_SERVICE_TOKEN" value="[valor de prueba omitido]"/>
```

Las pruebas Feature usan `RefreshDatabase` (excepto `ExampleTest`), y `bootstrap/cache/` no contiene `config.php` (configuración no cacheada), así que estos valores sí se aplican. La base PostgreSQL de desarrollo no se toca. Además, `EvaluationApiTest` usa `Storage::fake('private')`, por lo que tampoco escribe fotos en el disco real.

**Consecuencia:** las pruebas Laravel corren sobre **SQLite**, no sobre PostgreSQL. Los CHECK, los renombrados de restricciones (`renamePostgresObjects`) y el resto del comportamiento específico de PostgreSQL de la migración `adapt_graphilearn_evaluations` **no se prueban**. La detección de duplicados en `create` busca tanto el código `23505` (PostgreSQL) como el texto "unique" (SQLite).

## 4. Partes sin probar

- No hay pruebas del frontend React (ni unitarias ni de navegador).
- No hay una prueba de integración real Laravel → FastAPI: FastAPI siempre se simula con `Http::fake` o con el análisis apagado.
- No hay prueba de `GET /api/fotos/{id}/etapas`, de `GET /api/estudiantes/{id}/ficha` (solo el caso 403) ni de los conteos de `/api/direccion/cursos`.
- No hay prueba de activar o desactivar un modelo de punta a punta.
- No hay pruebas con fotos reales de fichas.
