# 07 · Pipeline de visión y modelo

Rutas relativas a `ai-service/`.

## 1. Pasos del pipeline

Orden real de ejecución en `routers/analysis.py` → `services/preprocessing.py::preprocess_stroke_image` → `features.py` → `indicators.py` → `classifier.py`.

| Paso | Estado | Archivo / función | Detalle real |
|---|---|---|---|
| Corrección de perspectiva por marcas | **NO ENCONTRADO** | — | No hay detección de marcas fiduciales, `getPerspectiveTransform` ni `warpPerspective` |
| Control de calidad de la imagen | **PARCIAL** | `routers/analysis.py`, `preprocessing.py::decode_image_bytes` | Solo verifica: `content_type` image/*, que no esté vacía, ≤ 10 MB, que se pueda decodificar y que mida al menos 20×20 px. Laravel exige JPG/PNG ≤ 5 MB. **No** mide nitidez, iluminación ni contraste. `ImageValidationService` (640×480) existe en Laravel, pero no se usa |
| Recorte (a la zona del ejercicio) | **NO ENCONTRADO** | — | Solo hay redimensionado: si el lado mayor supera 1200 px, se escala con `cv2.resize(..., INTER_AREA)` |
| Escala de grises | **IMPLEMENTADO** | `preprocessing.py` | `cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)` |
| Filtro bilateral | **IMPLEMENTADO** | `preprocessing.py` | `cv2.bilateralFilter(gray, d=9, sigmaColor=75, sigmaSpace=75)` |
| Umbral de Otsu | **IMPLEMENTADO** | `preprocessing.py` | `cv2.threshold(filtered, 0, 255, THRESH_BINARY_INV + THRESH_OTSU)` (trazo = 255) |
| Filtrado de componentes | **IMPLEMENTADO** | `preprocessing.py` | `connectedComponentsWithStats` (conectividad 8); descarta los componentes con área < 15 px. Si no queda ninguno: `PreprocessingError` → HTTP 422 |
| Esqueletización Zhang-Suen | **IMPLEMENTADO** | `services/skeletonization.py::zhang_suen_thinning` | Implementación propia con NumPy (2 subiteraciones, máximo 100 iteraciones) |
| Desviación contra la plantilla | **PARCIAL** | `indicators.py::calculate_deviation_by_type` | No compara con una plantilla impresa ni usa `tamano_figura_mm`. Ajusta una **figura ideal** al propio trazo (recta, círculo de Kåsa, espiral de Arquímedes o polilínea) y mide el error normalizado |
| Indicadores | **IMPLEMENTADO** | `indicators.py::compute_all_quantitative_indicators` | desviación, rugosidad, continuidad, regularidad |
| Características | **IMPLEMENTADO** | `features.py::extract_all_geometric_features` | 7 escalares + posición normalizada |
| Imágenes de etapas (`rutas_etapas`) | **NO ENCONTRADO** | — | FastAPI no guarda ni devuelve imágenes intermedias. Laravel tiene `GET /api/fotos/{id}/etapas`, pero siempre devuelve `null` en las 4 etapas (verificado, ver `03_api.md` §3.11) |

## 2. Características geométricas (`services/features.py`)

Se calculan sobre el esqueleto de 1 px.

| Campo | Función | Fórmula / método |
|---|---|---|
| `longitud_trazo` (px) | `calculate_stroke_length` | Σ aristas ortogonales × 1 + Σ aristas diagonales × √2 (cada arista se cuenta desde ambos extremos y se divide entre 2). Si sale < 1, usa el número de píxeles |
| `alto`, `ancho` (px) | `calculate_bounding_box` | `y_max − y_min + 1`, `x_max − x_min + 1` |
| `proporcion` | `calculate_aspect_ratio` | `ancho / alto` (1.0 si alto ≤ 0), redondeado a 3 decimales |
| `inclinacion` (°) | `calculate_orientation_angle` | `0.5 · atan2(2·μ11, μ20 − μ02)` con `cv2.moments`, normalizado a [−90, 90] |
| `curvatura` (rad/px) | `calculate_curvature` | En cada contorno se muestrea cada `len/50` puntos; Σ ángulos entre vectores unitarios consecutivos / Σ longitudes |
| `separacion_componentes` (px) | `calculate_component_separation` | Distancia mínima entre centroides de componentes conexos; 0.0 si hay uno solo |
| `posicion_normalizada` | `calculate_normalized_position` | `center_x = mean(x)/ancho_img`, `center_y = mean(y)/alto_img`, `bbox_normalized = [x_min/W, y_min/H, x_max/W, y_max/H]` (todo limitado a [0, 1]) |

## 3. Indicadores cuantitativos (`services/indicators.py`)

Los puntos se ordenan tomando el contorno más largo (`_order_points_approx`).

| Indicador | Función | Fórmula |
|---|---|---|
| `desviacion` — línea | `fit_line_deviation` | `cv2.fitLine` (L2); media de las distancias perpendiculares / diagonal del bbox de los puntos |
| `desviacion` — círculo | `fit_circle_deviation` | Ajuste algebraico de Kåsa por mínimos cuadrados; `mean(|r_i − R|) / R` |
| `desviacion` — espiral | `fit_spiral_deviation` | Centro = media de los puntos; regresión `r = a + b·θ` (θ desenrollado); `mean(|r − r̂|) / r_max` |
| `desviacion` — zigzag | `fit_zigzag_deviation` | `cv2.approxPolyDP` con ε = max(2, 0.04·diagonal); media de la distancia de cada punto al segmento más cercano / diagonal |
| (otro tipo) | `calculate_deviation_by_type` | Usa la fórmula del círculo por defecto |
| `rugosidad` (rad) | `calculate_roughness` | Muestreo cada `len/60` puntos; **desviación estándar** de los ángulos de giro entre vectores consecutivos |
| `continuidad` [0–1] | `calculate_continuity` | 1.0 si hay un solo componente; si no, `(área_mayor / área_total) · 1 / (1 + 0.15·(n − 1))` |
| `regularidad` [0–1] | `calculate_regularity` | `1 − (0.45·min(1, 2.5·desv) + 0.35·min(1, rug/1.5) + 0.20·(1 − cont))` |

Los pesos (0.45/0.35/0.20) y los factores de escala (2.5 y 1.5) son constantes fijas en el código. No hay evidencia de que se hayan calibrado con datos reales.

## 4. Endpoints de FastAPI y contrato

Todas las rutas, incluida `/` y la documentación automática, pasan por el middleware `require_internal_token` (`main.py`): si `GRAPHILEARN_INTERNAL_TOKEN` no está configurado responde **503**, y si la cabecera `X-Internal-Token` falta o no coincide (comparación con `hmac.compare_digest`) responde **401**. CORS: `allow_origins=[]`.

| Método | Ruta | Entrada | Salida | Errores |
|---|---|---|---|---|
| GET | `/` | — | `{sistema, servicio, estado, version: "2.0.0", mensaje}` | 401/503 |
| POST | `/api/analyze` | multipart: `file` (imagen), `tipo_esperado` (form, por defecto `"circulo"`) | `AnalyzeResponseSchema` (abajo) | 400 (no es imagen, vacía, > 10 MB), 422 (decodificación o sin trazo), 500 |
| GET | `/api/models/status` | — | `{disponible, version_activa, metadatos, model_id}` | — |
| POST | `/api/models/load` | JSON `{model_id, version_name?}` (`extra="forbid"`) | `{loaded, model_id, version, metadatos}` | 422 (id inválido), 404 (no está en el manifiesto o falta el archivo), 409 (el hash no coincide), 503 (manifiesto inválido), 400 (error de carga) |
| POST | `/api/models/unload` | — | `{loaded: false, mensaje}` | — |

`AnalyzeResponseSchema` (`schemas/analysis.py`):

```
{
  estado: str ("procesado"),
  mensaje: str,
  tipo_trazo: str,
  caracteristicas_geometricas: {
    longitud_trazo: float, alto: int, ancho: int, proporcion: float, inclinacion: float,
    curvatura: float, separacion_componentes: float,
    posicion_normalizada: { center_x: float, center_y: float, bbox_normalized: [float x4] }
  },
  indicadores_cuantitativos: { desviacion: float, rugosidad: float, continuidad: float, regularidad: float },
  clasificacion: { disponible: bool, sugerencia: "S"|"ED"|"NA"|null, model_version: str|null, mensaje: str },
  detalles_computacionales: { archivo, tiempo_procesamiento_segundos, metadatos_imagen{...}, etapas_completadas[8], aviso_pedagogico }
}
```

Laravel guarda `indicadores_cuantitativos` → `analisis.indicadores`, `caracteristicas_geometricas` → `analisis.caracteristicas` y `clasificacion.sugerencia` → `analisis.sugerencia` (solo si es S, ED o NA), con `id_modelo = null` siempre (`EvaluationFlowController@upload`). `rutas_etapas` queda en `null` porque FastAPI no lo envía.

## 5. Estado del modelo scikit-learn

| Aspecto | Dato real |
|---|---|
| Algoritmo | `Pipeline([StandardScaler, RandomForestClassifier(n_estimators=100, max_depth=5, min_samples_split=3, class_weight="balanced", random_state=42)])`. `train.py` también admite `--model svm` (SVC RBF) |
| Datos de entrenamiento | **Sintéticos.** `train.py::generate_synthetic_benchmark_dataset`: 120 muestras de 20 "niños" ficticios (`RandomState(42)`); cada clase se genera con rangos uniformes distintos para desviación, rugosidad y continuidad |
| Clases | **Binarias `0` / `1`** ("bajo_riesgo" / "riesgo_potencial"), **no S/ED/NA** |
| División | `GroupShuffleSplit(test_size=0.25)` por niño: 91 de entrenamiento / 29 de prueba (5 niños) |
| Métricas guardadas | `models/randomforest_v1.0-benchmark_metrics.json`: precision 1.0, recall 1.0, f1 1.0, roc_auc 1.0, matriz `[[16,0],[0,13]]`. Son esperables con clases separables por construcción y **no son una validación** |
| Archivo cargable | `models/randomforest_v1.0-benchmark.joblib` existe en local (74 258 bytes). SHA-256 `43e95425c2037d1f229dcb90d20d35ccbe00af7a43cf6247203083d432d07b8e`. Está **ignorado por git** (`**/*.joblib`), así que no está en el repositorio |
| ¿Se puede cargar hoy por la API? | **No.** `models/manifest.json` es `{"models": {}}`, así que `/api/models/load` responde 404 para cualquier `model_id` |
| ¿Produciría sugerencias si se cargara? | **No.** `classifier.py::predict` convierte la clase a texto y solo la acepta si está en {S, ED, NA}; con clases 0/1 devuelve `sugerencia: null` |

Verificación del artefacto:

```
43e95425c2037d1f229dcb90d20d35ccbe00af7a43cf6247203083d432d07b8e *models/randomforest_v1.0-benchmark.joblib
dict ['model', 'metadata']
pipeline steps ['scaler', 'classifier']
classes_ [np.int64(0), np.int64(1)]
n_features 11
```

Las 11 características de entrada (`FEATURE_NAMES` en `classifier.py`): longitud_trazo, alto, ancho, proporcion, inclinacion, curvatura, separacion_componentes, desviacion, rugosidad, continuidad, regularidad.

### Ruta de carga segura (manifiesto + SHA-256)

1. El administrador registra la versión en Laravel (`POST /api/model-versions`). `ModelVersionController::resolveModelPath` verifica que `file_path` exista y quede **dentro** de `AI_SERVICE_ROOT` (con `realpath`; bloquea `../` y rutas absolutas fuera de esa raíz).
2. Al activar, Laravel vuelve a verificar la ruta y llama a `POST /api/models/load` con `model_id = model_versions.version`. **No envía la ruta del archivo.**
3. FastAPI (`routers/models.py::_resolve_registered_model`):
   - valida `model_id` con `^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$`;
   - lo busca en `models/manifest.json` → `{filename, sha256}`;
   - exige que `filename` sea un nombre simple (sin directorios), con extensión `.joblib` o `.pkl`, y que `sha256` tenga 64 caracteres hexadecimales;
   - resuelve el archivo y exige que su carpeta sea exactamente `models/`;
   - calcula el SHA-256 del archivo y lo compara en tiempo constante; si no coincide responde 409.
4. Solo después ejecuta `joblib.load`. Laravel marca la versión como activa únicamente si FastAPI responde `loaded: true` con el mismo `model_id`; si no, responde 503 y no cambia nada.
5. Volumen Docker `./ai-service/models:/app/models:ro` (solo lectura).

Advertencia: `joblib.load` deserializa con pickle. El control de hash protege contra archivos alterados, pero no contra un artefacto malicioso que alguien haya registrado en el manifiesto a propósito.

Limitación de trazabilidad: el modelo cargado vive en memoria del proceso FastAPI. Si el contenedor se reinicia, vuelve sin modelo, mientras `model_versions.active` sigue en `true` en Laravel. Además, el flujo nuevo guarda `analisis.id_modelo = null` siempre.

## 6. Qué pasa con `ANALISIS_HABILITADO` apagado

- Valor por defecto: `false` (`config/services.php`). En el `.env` local **no está definido**, así que hoy está apagado.
- En `EvaluationFlowController@upload` se guarda la foto en el disco privado y el estado pasa a `foto_lista`, pero **no se llama a FastAPI** y no se crea ninguna fila en `analisis`.
- Respuesta 201: `{"id": …, "estado": "foto_lista", "analisis_disponible": false, "mensaje_analisis": "Análisis no disponible por ahora.", "analisis": null}` (capturada en `03_api.md` §3.6).
- La docente puede valorar S/ED/NA igual (`PUT .../valoracion`).
- En el cuadro, `analisis_disponible` es `false` en todas las casillas.
- Lo cubre la prueba `test_photo_upload_works_without_fastapi_and_stays_private_until_teacher_rates`.

Con `ANALISIS_HABILITADO=true`, el análisis se ejecuta **de forma síncrona** dentro de la misma petición de subida (sin cola), con hasta `AI_SERVICE_TIMEOUT` = 30 s de espera. Si falla, se aplica el mismo comportamiento de respaldo descrito arriba.
