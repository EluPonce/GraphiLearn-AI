# Revisión técnica del pipeline de visión artificial

## Flujo general

Laravel recibe una solicitud autenticada para procesar una actividad, obtiene la imagen privada y envía el archivo multipart a `POST /api/analyze`, junto con `tipo_esperado`. FastAPI ejecuta las etapas descritas y devuelve JSON. Laravel guarda características, indicadores y clasificación en `analysis_results` y marca la actividad como procesada. La llamada HTTP ocurre antes de la transacción que persiste el resultado.

A continuación se agrupa la implementación en cinco etapas funcionales. El detalle computacional de FastAPI enumera además subpasos internos de preprocesamiento.

## Etapa 1 — Recepción, validación y decodificación

- **Entrada:** archivo multipart `file`; `tipo_esperado` opcional, por defecto `circulo`.
- **Proceso/algoritmos:** valida que el MIME comience por `image/`, que el archivo no esté vacío y que no supere el límite implementado. `decode_image_bytes` usa `numpy.frombuffer` y `cv2.imdecode` en modo color; rechaza imágenes no decodificables o menores al tamaño mínimo codificado en el servicio.
- **Salida:** matriz BGR de OpenCV o error HTTP controlado (`400` para validaciones del endpoint, `422` para fallos `PreprocessingError`).
- **Pruebas existentes:** decodificación de bytes válidos, vacíos y corruptos en `ai-service/tests/test_ai_service.py`; la prueba HTTP del endpoint verifica una imagen sintética. No se ejecutaron aquí.

## Etapa 2 — Limpieza, binarización y esqueleto

- **Entrada:** matriz BGR.
- **Proceso/algoritmos:** reducción de tamaño si excede la dimensión máxima configurada; conversión a escala de grises; filtro bilateral; umbral de Otsu invertido para separar trazo oscuro de fondo; componentes conexos con conectividad 8 para retirar áreas pequeñas; adelgazamiento Zhang–Suen con límite de iteraciones.
- **Salida:** máscara binaria limpia, esqueleto de un píxel y metadatos de dimensiones, escala, componentes y píxeles.
- **Pruebas existentes:** detección de círculo sintético, rechazo de hoja blanca y grosor del esqueleto en una barra artificial. Las pruebas no documentan cámaras, iluminación o fotografías reales.

## Etapa 3 — Extracción de características geométricas

- **Entrada:** esqueleto y dimensiones de la imagen procesada.
- **Proceso/algoritmos:** longitud sobre vecindad 8 con peso euclidiano para diagonales; bounding box; razón ancho/alto; ángulo principal por momentos centrales de segundo orden; curvatura aproximada sobre puntos de contorno muestreados; distancia entre centroides de componentes desconectados; centroide y caja normalizados a la imagen.
- **Salida:** `longitud_trazo`, `alto`, `ancho`, `proporcion`, `inclinacion`, `curvatura`, `separacion_componentes` y `posicion_normalizada`.
- **Pruebas existentes:** propiedades de una línea horizontal sintética y verificaciones del contrato de respuesta en `test_ai_service.py`. No hay evidencia ahí de tolerancias sobre imágenes reales.

## Etapa 4 — Indicadores frente al patrón

- **Entrada:** esqueleto ordenado aproximadamente y tipo de trazo esperado (`linea`, `circulo`, `espiral`, `zigzag`).
- **Proceso/algoritmos:** orden aproximado mediante contornos; desviación con ajuste lineal `cv2.fitLine`, círculo algebraico por mínimos cuadrados, espiral de Arquímedes por regresión lineal radial-angular o aproximación poligonal `cv2.approxPolyDP` para zigzag. Se calculan rugosidad con variación angular, continuidad por componentes y regularidad como combinación ponderada de desviación, rugosidad y continuidad. Tipo desconocido cae al ajuste circular.
- **Salida:** `desviacion`, `rugosidad`, `continuidad`, `regularidad`.
- **Pruebas existentes:** comparaciones de línea regular/temblorosa y círculo suave/irregular creados sintéticamente; comprueba orden relativo y rango de regularidad. No son evaluación clínica ni validación de ejercicios reales.

## Etapa 5 — Clasificación, respuesta y persistencia

- **Entrada:** siete características geométricas y cuatro indicadores cuantitativos.
- **Proceso/algoritmos:** `RiskClassifier` devuelve `no_disponible` y `risk_score: null` si no hay modelo. Si se carga el artefacto, ensambla las once variables en orden fijo, ejecuta `predict` y, si disponible, toma el último elemento de `predict_proba` como score. El entrenamiento disponible usa `StandardScaler` y `RandomForestClassifier` (también hay opción SVM). Laravel valida el resultado recibido y persiste valores, versión asociada y detalles.
- **Salida:** etiqueta (`bajo_riesgo`, `riesgo_potencial` o salida normalizada), score nullable y versión; respuesta JSON de análisis y registro persistido por actividad.
- **Pruebas existentes:** el servicio comprueba el fallback sin modelo y el contrato `/api/analyze`; las pruebas backend usan `Http::fake` para verificar persistencia, autorización, errores, duplicados y administración. No son una prueba end-to-end del modelo real en el microservicio.

## Random Forest de benchmark: alcance y limitaciones

`ai-service/training/train.py` construye por defecto 120 filas sintéticas asignadas a 20 identificadores de sujeto. Las clases se asignan por grupo de sujeto, y los rangos de desviación, rugosidad, continuidad y regularidad se generan deliberadamente en función de la clase. La partición `GroupShuffleSplit` separa sujetos entre entrenamiento y prueba, lo que reduce la fuga entre ejemplos del mismo identificador, pero no convierte los datos en observaciones clínicas.

El artefacto `ai-service/models/randomforest_v1.0-benchmark.joblib` y el sidecar `randomforest_v1.0-benchmark_metrics.json` están versionados en el repositorio. El reporte corresponde a este benchmark sintético. No permite inferir precisión, sensibilidad ni utilidad con población real; puede reflejar las reglas con que se fabricaron las etiquetas y atributos. El propio artefacto pide entrenamiento con dataset clínico de nivel inicial antes de despliegue clínico. El clasificador también puede producir score basado en probabilidades del modelo, pero el código no muestra calibración clínica de ese score.

## Pruebas y alcance

Los casos unitarios Python están en `ai-service/tests/test_ai_service.py`. Los casos de backend están en `tests/Feature/GraphiLearnSprint2BackendTest.php`; el backend simula el microservicio y por eso no cubre transporte real de extremo a extremo. Los nombres y aserciones describen cobertura prevista; este documento no declara que se hayan ejecutado o aprobado.

## Archivos de implementación relevantes

- `ai-service/routers/analysis.py`, `ai-service/schemas/analysis.py`
- `ai-service/services/preprocessing.py`, `skeletonization.py`, `features.py`, `indicators.py`, `classifier.py`
- `ai-service/training/train.py`, `ai-service/models/`
- `app/Services/FastApiClient.php`, `app/Services/AnalysisService.php`
- `tests/Feature/GraphiLearnSprint2BackendTest.php`, `ai-service/tests/test_ai_service.py`
