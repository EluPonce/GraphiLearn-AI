# Informe técnico: pipeline de análisis grafomotor

**Versión revisada:** 30 de octubre de 2026  
**Alcance:** descripción del código que existe en `ai-service/` y su integración Laravel. Este informe es independiente de la guía de uso docente. No implica validación clínica ni modificación o reentrenamiento del modelo.

## Arquitectura

React presenta el formulario de evaluación y envía las acciones a la API Laravel. Laravel autentica a la docente, verifica el acceso al curso y al estudiante, guarda la fotografía en el disco privado y registra sus metadatos en PostgreSQL. Cuando se solicita el análisis, `AnalysisService` lee el archivo privado y `FastApiClient` envía la imagen a FastAPI por HTTP multipart. FastAPI procesa la imagen en memoria con OpenCV y devuelve JSON. Laravel persiste las características, indicadores, clasificación, estado y detalles en `analysis_results`, relacionados con la ejecución y la imagen. La valoración S/ED/NA y las observaciones son datos manuales separados del resultado automático y sus modificaciones quedan en el historial pedagógico.

```text
React → Laravel/Sanctum → almacenamiento privado + PostgreSQL
                              ↓ solicitud de análisis
                         FastApiClient → FastAPI
                              ← JSON de análisis
                         analysis_results
```

## Entrada y validación

El endpoint real es `POST /api/analyze` (`ai-service/routers/analysis.py`). Recibe `file` como multipart y `tipo_esperado` como campo de formulario opcional cuyo valor por defecto es `circulo`. Los tipos reconocidos por el contrato son `linea`, `circulo`, `espiral` y `zigzag`.

FastAPI exige un MIME que empiece con `image/`, rechaza archivos vacíos y limita el cuerpo leído a 10 MiB. OpenCV debe poder decodificarlo y la imagen debe tener al menos 20 × 20 píxeles. El preprocesamiento reduce el lado mayor a 1200 píxeles si hace falta y descarta componentes con área menor a 15 píxeles. Laravel aplica además su validación de carga para la interfaz; actualmente admite JPEG/PNG hasta 5 MiB y requiere al menos 640 × 480 píxeles. Por ello, el límite efectivo de carga desde la aplicación es el de Laravel.

Las fotografías se guardan en el disco privado `graphilearn/imagenes/` con nombre UUID. La descarga requiere autorización Laravel y no expone una URL pública. No se devuelve una imagen procesada por el endpoint actual.

## Preprocesamiento y esqueleto

`services/preprocessing.py` decodifica bytes con `cv2.imdecode`, convierte la imagen BGR a escala de grises, aplica filtro bilateral (`d=9`, `sigmaColor=75`, `sigmaSpace=75`), umbralización inversa de Otsu y filtrado de componentes conectados pequeños. Si no queda ningún trazo significativo, devuelve un error de preprocesamiento. Después llama a `services/skeletonization.py`.

`zhang_suen_thinning` aplica las dos subiteraciones de Zhang–Suen sobre una máscara binaria, con hasta 100 iteraciones y padding de un píxel. El resultado que consume el resto del código es una imagen binaria de un píxel de grosor. FastAPI devuelve metadatos de dimensiones, factor de escala, componentes y recuentos de píxeles; no devuelve el mapa binario ni una URL de imagen procesada.

## Características geométricas

`services/features.py` calcula sobre el esqueleto:

- Longitud estimada en píxeles, sumando conexiones ortogonales con peso 1 y diagonales con peso √2.
- Alto y ancho del rectángulo delimitador, en píxeles, y proporción ancho/alto.
- Inclinación principal en grados por momentos de segundo orden (PCA), normalizada a −90°…90°.
- Curvatura angular media por distancia (rad/px, según la implementación).
- Distancia entre centroides de componentes desconectados (px; cero para un solo componente).
- Centroide y rectángulo delimitador normalizados respecto al marco de la imagen (coordenadas relativas sin unidad).

Los valores de tamaño son píxeles de la imagen procesada; no son medidas físicas del papel. El código no calcula calibración en centímetros.

## Indicadores cuantitativos

`services/indicators.py` devuelve cuatro valores:

- `desviacion`: desviación normalizada frente al ajuste de referencia geométrica del tipo esperado. El código usa ajuste de recta, círculo, espiral de Arquímedes o zigzag según el tipo; el caso desconocido usa el ajuste circular.
- `rugosidad`: desviación estándar de cambios angulares locales del contorno muestreado.
- `continuidad`: índice implementado entre 0 y 1, según proporción del componente principal y penalización por fragmentos.
- `regularidad`: combinación codificada de desviación, rugosidad y continuidad, recortada a 0…1.

Son descriptores computacionales del trazo capturado. La interfaz informa los nombres, unidades presentes en el contrato y valores devueltos; no los convierte en recomendaciones, diagnósticos ni categorías pedagógicas.

## Clasificación experimental

`services/classifier.py` devuelve disponibilidad, `risk_label`, `risk_score`, versión y mensaje. Si no hay modelo cargado, informa `no_disponible` y score nulo. Si hay un artefacto cargado, construye un vector con 11 características y llama a `predict`; si existe `predict_proba`, toma el último valor como score. La etiqueta de Random Forest/SVM es una salida experimental independiente. La interfaz debe mostrarla como no diagnóstica y nunca mapearla a S, ED o NA.

El repositorio contiene un artefacto nombrado `randomforest_v1.0-benchmark.joblib` y un JSON de métricas. `training/train.py` también puede generar un benchmark sintético: 120 muestras por defecto y grupos sintéticos de sujetos. Su separación agrupada evita compartir sujetos sintéticos entre los conjuntos. Estas métricas comprueban el flujo experimental sobre datos generados por el propio script, no el desempeño con niñas y niños, ni la validez en educación inicial. Este trabajo no reentrenó ni cargó un modelo nuevo.

## Contrato de API observado

`POST /api/analyze` recibe:

| Campo | Transporte | Requerido | Contenido |
|---|---|---:|---|
| `file` | Multipart file | Sí | Imagen aceptada por validaciones |
| `tipo_esperado` | Multipart form | No | `linea`, `circulo`, `espiral` o `zigzag`; default `circulo` |

La respuesta satisfactoria sigue `AnalyzeResponseSchema` (`ai-service/schemas/analysis.py`):

| Campo | Contenido |
|---|---|
| `estado`, `mensaje`, `tipo_trazo` | Estado y contexto del proceso |
| `caracteristicas_geometricas` | Medidas, orientación, curvatura, separación y posición normalizada |
| `indicadores_cuantitativos` | Desviación, rugosidad, continuidad y regularidad |
| `clasificacion` | Disponibilidad, etiqueta, score, versión y mensaje |
| `detalles_computacionales` | Nombre recibido, tiempo, metadatos y etapas completadas; sin imagen procesada |

El endpoint de compatibilidad `POST /predict` devuelve un subconjunto con `risk_label`, `risk_score`, `features` y `detalles`. El cliente Laravel utiliza `/api/analyze`, no `/predict`. `GET /api/models/status` expone disponibilidad/versión/metadatos del clasificador. Las rutas de carga y descarga de modelo existen en FastAPI; el flujo normal de análisis no entrena modelos.

## Persistencia y errores

`AnalysisService` evita procesar sin imagen y devuelve conflicto cuando la actividad está en proceso o ya fue procesada. Si falla la llamada externa, restaura el estado de la actividad y no guarda resultados parciales. Si responde correctamente, Laravel actualiza o crea un único `analysis_results` por actividad; guarda los campos disponibles, establece estado `procesado` y deja la revisión automática en `pendiente`. La restricción única sobre `actividad_id` respalda esa cardinalidad. Las claves de actividad e imagen tienen las acciones de borrado definidas por migración.

La API FastAPI devuelve 400 para MIME inválido, archivo vacío o exceso de 10 MiB; 422 para errores controlados de decodificación/preprocesamiento; 500 para fallos internos de las etapas de OpenCV. En Laravel, el cliente traduce servicio inaccesible/timeout/errores HTTP o contrato inválido a excepciones del servicio; las rutas responden 503, 504, 422 o 502/500 según el caso y el controlador. Los conflictos por duplicidad o concurrencia se responden como 409.

## Pruebas y límites

El repositorio incluye pruebas Laravel de autorización, procesamiento simulado de extremo a extremo, respuesta no disponible, timeout, contrato inválido y prevención de procesamiento duplicado (`GraphiLearn/tests/Feature/GraphiLearnSprint2BackendTest.php`), además de pruebas de acceso por rol. También existe `ai-service/tests/test_ai_service.py` para el servicio Python. En la verificación de esta entrega se ejecutaron PHPUnit (34 pruebas, 104 aserciones) y `npm run build` (Vite completado). PHPUnit usa la configuración de pruebas de Laravel; esos resultados no prueban por sí mismos una llamada real a FastAPI ni validación científica. No se afirma aquí que se haya realizado la secuencia PostgreSQL + foto + FastAPI en esta entrega.

Queda pendiente para validar desempeño: un conjunto de datos apropiado para trazos grafomotores de educación inicial; consentimiento y gobernanza de datos; criterios de inclusión/exclusión y anotación experta; protocolo ético; evaluación por sujeto e institución independiente; métricas y análisis de errores predefinidos; y validación pedagógica con la licenciada. Hasta contar con ello, la clasificación no debe sustentar decisiones diagnósticas ni categorías S/ED/NA.

## Referencias del código revisado

- `ai-service/main.py`
- `ai-service/routers/analysis.py`, `ai-service/routers/models.py`
- `ai-service/schemas/analysis.py`
- `ai-service/services/preprocessing.py`, `skeletonization.py`, `features.py`, `indicators.py`, `classifier.py`
- `ai-service/training/train.py`, `ai-service/tests/test_ai_service.py`
- `GraphiLearn/app/Services/FastApiClient.php`, `AnalysisService.php`, `ImageUploadService.php`
- `GraphiLearn/app/Http/Controllers/Api/V1/ActividadController.php`, `ImagenController.php`, `ActivityEvaluationController.php`
- `GraphiLearn/app/Http/Resources/AnalysisResultResource.php`
- `GraphiLearn/database/migrations/2026_09_18_130001_create_analysis_results_table.php`
