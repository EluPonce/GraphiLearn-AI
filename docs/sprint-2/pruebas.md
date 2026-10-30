# Sprint 2 — Plan y reporte de pruebas

## 2.2. Pruebas

El plan distingue pruebas automatizadas ejecutadas de validaciones aún necesarias. La ejecución registrada aquí corresponde al corte documental del 26 de octubre de 2026.

### 2.2.1. Plan de Prueba

| ID | Historia de usuario | Tipo / procedimiento previsto | Criterio de comprobación | Entorno y límite |
|---|---|---|---|---|
| TP-07 | HU-07 Procesar imagen | Unitarias de decodificación/preprocesamiento; contrato HTTP con imagen controlada; luego prueba de integración Laravel–FastAPI | Aceptar imagen sintética válida, rechazar bytes vacíos/corruptos y hoja vacía con respuesta controlada; comprobar transporte real separado | Automatizadas existentes usan imágenes sintéticas. La prueba real multipart entre procesos queda pendiente. |
| TP-08 | HU-08 Extraer características | Unitarias con líneas/círculos artificiales y comprobación del esquema | Campos geométricos presentes y finitos; comparar propiedades limitadas de las figuras de prueba | No hay muestra real ni patrón de referencia etiquetado; no prueba exactitud de medición en campo. |
| TP-09 | HU-09 Generar indicadores | Unitarias de desviación, rugosidad, continuidad y regularidad sobre trazos controlados | Salidas finitas/en rango y orden relativo en escenarios sintéticos incluidos | No valida relación clínica/pedagógica ni umbrales de riesgo. |
| TP-10 | HU-10 Clasificar resultado | Unitarias del modo sin modelo; prueba futura del ciclo carga/inferencia y protocolo de evaluación independiente | Sin modelo: etiqueta `no_disponible`, score nulo; cualquier validación de desempeño requiere dataset real autorizado, separado por sujeto y protocolo explícito | El artefacto de benchmark se genera con entradas/etiquetas artificiales; sus métricas no son criterio de aceptación real. |
| TP-11 | HU-11 Registrar resultado | Feature tests con respuesta de FastAPI simulada; luego integración HTTP y base de datos del entorno de destino | Persistir medidas, indicadores, estado de actividad y revisión; cubrir errores, autorización, ausencia de imagen y duplicados | PHPUnit corre con SQLite en memoria y `Http::fake`; PostgreSQL/HTTP real quedan pendientes. |
| TP-16 | HU-16 Gestionar versión del modelo | Feature tests de rol administrador, versión y archivo; luego prueba HTTP real de carga/descarga y consulta de trazabilidad | Restringir rutas a administrador, impedir carga de archivo inexistente, verificar estado del microservicio y modelo realmente usado | Test de carga usa respuesta HTTP simulada; no verifica sincronización desplegada ni UI de administración. |
| TP-UI | HU-11 / consulta visual | Pruebas React de integración y recorrido navegador contra backend persistente | Mostrar resultado persistido, distinguir sin clasificador disponible y permitir revisión humana | No se encontraron tests automatizados de React; ejecución pendiente. |
| TP-PG | HU-11 / persistencia PostgreSQL | Migrar, guardar, recuperar y verificar claves/JSON/enum en PostgreSQL | DDL y relaciones aceptados en versión de PostgreSQL definida por el proyecto | No ejecutado en este corte; versión/instancia no documentadas en este expediente. |
| TP-CLIN | HU-10 / evaluación científica | Protocolo con población/datos de nivel inicial, criterios de inclusión, permisos, verdad de referencia, partición por estudiante y análisis acordado | Resultados interpretables para la pregunta de investigación y revisados por especialistas | Pendiente; no usar el benchmark sintético como sustituto. |

### 2.2.2. Reporte de Prueba

#### Ejecución automatizada observada

| Suite | Comando ejecutado | Resultado observado | Alcance real |
|---|---|---|---|
| Backend Laravel | `.\vendor\bin\phpunit.bat` desde la raíz | **Satisfactorio:** 25 pruebas, 82 aserciones; salida `OK`. | PHPUnit 11.5.56, PHP 8.2.12, SQLite en memoria según `phpunit.xml`. Incluye procesamiento, autorización, fallos, duplicados, resultado y versiones. Las llamadas de IA se falsifican con `Http::fake`; no ejercita PostgreSQL ni red real. |
| FastAPI/OpenCV | `python -m pytest -q` desde `ai-service/` | **Satisfactorio:** 11 pruebas pasaron; 2 advertencias deprecadas de Starlette/AnyIO/httpx. | pytest 9.1.1, Python 3.14.5, FastAPI 0.141.1, OpenCV 5.0.0. Las imágenes son sintéticas; se valida pipeline/contrato y fallback sin modelo, no validez científica ni rendimiento en datos reales. |

#### Cobertura observada por HU

| HU | Resultado comprobable | Resultado de prueba al corte | Pendiente para considerar aceptación completa |
|---|---|---|---|
| HU-07 | Decodificación, limpieza, umbralización, filtrado de componentes y Zhang–Suen están implementados. | Pruebas Python de imagen válida/vacía/corrupta, trazo, papel en blanco y esqueletización pasan; contrato `/api/analyze` pasa. | Imágenes reales con variaciones de captura; prueba Laravel→FastAPI real; criterios cuantitativos acordados. |
| HU-08 | Extracción implementada para longitud, caja, proporción, orientación, curvatura, separación y posición. | Casos sintéticos de características y contrato pasan. | Exactitud/tolerancias comparadas con referencia revisada; tamaños, rotación e iluminación de campo. |
| HU-09 | Cálculo implementado para desviación, rugosidad, continuidad y regularidad. | Comparaciones sintéticas regular/irregular y contrato pasan. | Validación de interpretación y umbrales por docentes/especialistas; muestras reales. |
| HU-10 | Clasificador opcional; fallback seguro no disponible; artefacto RF benchmark presente. | Prueba Python del fallback pasa. El test backend confirma que se registra respuesta simulada `no_disponible`. | El benchmark no puede aceptarse como detector real. Falta dataset pertinente, protocolo, evaluación independiente y confirmación de etiquetado humano. |
| HU-11 | Laravel guarda resultado e indicadores y cambia estados; `AnalysisResultResource` expone respuesta. | Feature tests pasan con fixtures de FastAPI; cubren éxito, acceso, falta de imagen, servicio caído/timeout, respuesta inválida, duplicado, concurrencia y revisión pendiente. | Integración FastAPI en vivo, persistencia PostgreSQL, recorrido UI conectado y comprobación post-reinicio. |
| HU-16 | API de versiones registra/lista y controla acceso; verifica archivo al activar. | Pruebas de rol, archivo inexistente y activación pasan; llamada a endpoint de carga es simulada. | Sincronización real Laravel/FastAPI, prueba de unload/estado, interfaz de administración y prueba de modelo realmente usado en un resultado. |

#### Casos Laravel ejecutados (nombres del código)

`test_teacher_can_process_authorized_activity_successfully`, `test_teacher_cannot_process_activity_of_another_teachers_student`, `test_cannot_process_activity_without_image`, `test_ai_service_unavailable_returns_503_and_rolls_back`, `test_ai_service_timeout_returns_504`, `test_invalid_microservice_response_is_handled`, `test_duplicate_processing_returns_409_conflict`, `test_concurrent_processing_request_returns_409`, `test_classification_result_initializes_with_pending_review`, `test_model_version_management_restricted_to_admin`, `test_admin_cannot_activate_non_existent_model_file` y `test_admin_can_register_and_activate_valid_model`.

#### Casos FastAPI ejecutados (nombres del código)

`test_decode_image_valid`, `test_decode_image_empty_raises_error`, `test_decode_image_corrupt_raises_error`, `test_preprocessing_detects_stroke_in_valid_image`, `test_preprocessing_fails_on_blank_paper`, `test_skeletonization_produces_single_pixel_thickness`, `test_geometric_features_calculation`, `test_deviation_regular_vs_irregular_line`, `test_roughness_and_regularity_behavior`, `test_classifier_returns_safe_not_available_when_no_model` y `test_api_endpoint_analyze_contract`.

**Conclusión del reporte:** ambas suites automatizadas pasaron en los entornos descritos. Este resultado demuestra que esos casos de software pasan en ese corte y con esos dobles/sujetos de prueba. No demuestra despliegue productivo, compatibilidad efectiva con PostgreSQL, experiencia de usuario validada ni detección de riesgo grafomotor en niños. No se reporta métrica de precisión clínica.
