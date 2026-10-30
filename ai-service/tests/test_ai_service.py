import io
import math
import os
import sys

# Asegurar que ai-service esté en el path de módulos
ai_service_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if ai_service_dir not in sys.path:
    sys.path.insert(0, ai_service_dir)

import cv2
import numpy as np
import pytest
from fastapi.testclient import TestClient

from main import app
from services.skeletonization import zhang_suen_thinning
from services.preprocessing import (
    decode_image_bytes,
    preprocess_stroke_image,
    PreprocessingError,
)
from services.features import (
    calculate_stroke_length,
    calculate_bounding_box,
    calculate_aspect_ratio,
    calculate_orientation_angle,
    calculate_curvature,
    calculate_component_separation,
    extract_all_geometric_features,
)
from services.indicators import (
    calculate_deviation_by_type,
    calculate_roughness,
    calculate_continuity,
    calculate_regularity,
    compute_all_quantitative_indicators,
)
from services.classifier import classifier_instance

client = TestClient(app)

# ---------------------------------------------------------------------------
# Helpers para generar imágenes sintéticas controladas
# ---------------------------------------------------------------------------

def create_synthetic_image_with_circle(radius=60, center=(150, 150), img_size=(300, 300), jitter=False):
    """Crea una imagen BGR simulando un trazo de lápiz circular sobre papel blanco."""
    img = np.ones((img_size[1], img_size[0], 3), dtype=np.uint8) * 255
    if not jitter:
        cv2.circle(img, center, radius, (40, 40, 40), thickness=3)
    else:
        # Círculo con temblor / irregularidad
        pts = []
        for angle_deg in range(0, 360, 5):
            rad = math.radians(angle_deg)
            r = radius + np.random.uniform(-10, 10)
            x = int(center[0] + r * math.cos(rad))
            y = int(center[1] + r * math.sin(rad))
            pts.append([x, y])
        cv2.polylines(img, [np.array(pts, dtype=np.int32)], isClosed=True, color=(40, 40, 40), thickness=3)

    _, buf = cv2.imencode(".png", img)
    return buf.tobytes()

def create_synthetic_image_with_line(p1=(50, 150), p2=(250, 150), img_size=(300, 300), jitter=False):
    """Crea una imagen BGR simulando un trazo de línea recta."""
    img = np.ones((img_size[1], img_size[0], 3), dtype=np.uint8) * 255
    if not jitter:
        cv2.line(img, p1, p2, (30, 30, 30), thickness=3)
    else:
        pts = []
        for x in range(p1[0], p2[0], 5):
            y = p1[1] + int(np.random.uniform(-12, 12))
            pts.append([x, y])
        cv2.polylines(img, [np.array(pts, dtype=np.int32)], isClosed=False, color=(30, 30, 30), thickness=3)

    _, buf = cv2.imencode(".png", img)
    return buf.tobytes()

def create_blank_image(img_size=(200, 200)):
    """Crea una hoja de papel blanco sin ningún trazo."""
    img = np.ones((img_size[1], img_size[0], 3), dtype=np.uint8) * 255
    _, buf = cv2.imencode(".png", img)
    return buf.tobytes()

# ---------------------------------------------------------------------------
# Test suite: Preprocesamiento y Esqueletización (HU-07)
# ---------------------------------------------------------------------------

def test_decode_image_valid():
    img_bytes = create_synthetic_image_with_line()
    decoded = decode_image_bytes(img_bytes)
    assert decoded is not None
    assert decoded.shape[0] == 300
    assert decoded.shape[1] == 300

def test_decode_image_empty_raises_error():
    with pytest.raises(PreprocessingError) as exc_info:
        decode_image_bytes(b"")
    assert "vacío" in str(exc_info.value).lower()

def test_decode_image_corrupt_raises_error():
    with pytest.raises(PreprocessingError) as exc_info:
        decode_image_bytes(b"not an image binary stream")
    assert "decodificar" in str(exc_info.value).lower()

def test_preprocessing_detects_stroke_in_valid_image():
    img_bytes = create_synthetic_image_with_circle()
    img = decode_image_bytes(img_bytes)
    binary, skeleton, meta = preprocess_stroke_image(img)

    assert binary is not None
    assert np.count_nonzero(binary) > 0
    assert np.count_nonzero(skeleton) > 0
    assert meta["componentes_identificados"] >= 1

def test_preprocessing_fails_on_blank_paper():
    blank_bytes = create_blank_image()
    img = decode_image_bytes(blank_bytes)
    with pytest.raises(PreprocessingError) as exc_info:
        preprocess_stroke_image(img)
    assert "no se identificaron trazos" in str(exc_info.value).lower()

def test_skeletonization_produces_single_pixel_thickness():
    """
    Verifica que la esqueletización Zhang-Suen reduzca una barra gruesa
    a un ancho máximo de 1 píxel.
    """
    # Barra gruesa horizontal de 8 píxeles de alto por 40 de largo
    thick_bar = np.zeros((30, 60), dtype=np.uint8)
    thick_bar[10:18, 10:50] = 255

    skeleton = zhang_suen_thinning(thick_bar)
    assert np.any(skeleton > 0)

    # Cada columna vertical en el centro debe tener exactamente 1 píxel activo
    col_counts = np.sum(skeleton[:, 15:45] > 0, axis=0)
    assert np.all(col_counts == 1), f"El esqueleto no tiene 1px de grosor: {col_counts}"

# ---------------------------------------------------------------------------
# Test suite: Extracción de Características (HU-08)
# ---------------------------------------------------------------------------

def test_geometric_features_calculation():
    img_bytes = create_synthetic_image_with_line(p1=(20, 100), p2=(220, 100))
    img = decode_image_bytes(img_bytes)
    _, skeleton, _ = preprocess_stroke_image(img)

    feats = extract_all_geometric_features(skeleton, img.shape)

    assert feats["longitud_trazo"] > 150.0
    assert feats["ancho"] >= 180
    assert feats["alto"] < 15 # Línea horizontal delgada
    assert math.isfinite(feats["longitud_trazo"])
    assert math.isfinite(feats["curvatura"])
    assert math.isfinite(feats["inclinacion"])
    assert feats["separacion_componentes"] == 0.0 # Continuo
    assert 0.0 <= feats["posicion_normalizada"]["center_x"] <= 1.0

# ---------------------------------------------------------------------------
# Test suite: Indicadores Cuantitativos (HU-09)
# ---------------------------------------------------------------------------

def test_deviation_regular_vs_irregular_line():
    """
    Una línea regular debe tener menor desviación que una línea temblorosa/irregular.
    """
    regular_bytes = create_synthetic_image_with_line(jitter=False)
    irregular_bytes = create_synthetic_image_with_line(jitter=True)

    _, skel_reg, _ = preprocess_stroke_image(decode_image_bytes(regular_bytes))
    _, skel_irreg, _ = preprocess_stroke_image(decode_image_bytes(irregular_bytes))

    dev_reg = calculate_deviation_by_type(skel_reg, "linea")
    dev_irreg = calculate_deviation_by_type(skel_irreg, "linea")

    assert dev_reg < dev_irreg, f"Esperado dev_reg ({dev_reg}) < dev_irreg ({dev_irreg})"
    assert math.isfinite(dev_reg)
    assert math.isfinite(dev_irreg)

def test_roughness_and_regularity_behavior():
    """
    Un trazo suave debe tener menor rugosidad y mayor regularidad que un trazo irregular.
    """
    reg_bytes = create_synthetic_image_with_circle(jitter=False)
    irreg_bytes = create_synthetic_image_with_circle(jitter=True)

    _, skel_reg, _ = preprocess_stroke_image(decode_image_bytes(reg_bytes))
    _, skel_irreg, _ = preprocess_stroke_image(decode_image_bytes(irreg_bytes))

    rough_reg = calculate_roughness(skel_reg)
    rough_irreg = calculate_roughness(skel_irreg)

    ind_reg = compute_all_quantitative_indicators(skel_reg, "circulo")
    ind_irreg = compute_all_quantitative_indicators(skel_irreg, "circulo")

    assert rough_reg <= rough_irreg
    assert ind_reg["regularidad"] >= ind_irreg["regularidad"]
    assert 0.0 <= ind_reg["regularidad"] <= 1.0
    assert 0.0 <= ind_irreg["regularidad"] <= 1.0

# ---------------------------------------------------------------------------
# Test suite: Inferencia de Clasificador y Contrato JSON (HU-10)
# ---------------------------------------------------------------------------

def test_classifier_returns_safe_not_available_when_no_model():
    """
    En ausencia de modelo validado cargado, debe retornar estado explícito 'no_disponible'
    sin asignar arbitrariamente 'bajo riesgo'.
    """
    classifier_instance.model = None
    res = classifier_instance.predict({}, {})

    assert res["disponible"] is False
    assert res["risk_label"] == "no_disponible"
    assert res["risk_score"] is None
    assert "no disponible" in res["mensaje"].lower()

def test_api_endpoint_analyze_contract():
    """
    Verifica que el endpoint POST /api/analyze retorne el contrato JSON completo esperado.
    """
    img_bytes = create_synthetic_image_with_circle()
    files = {"file": ("test_circle.png", io.BytesIO(img_bytes), "image/png")}
    data = {"tipo_esperado": "circulo"}

    response = client.post("/api/analyze", files=files, data=data)
    assert response.status_code == 200

    json_data = response.json()
    assert json_data["estado"] == "procesado"
    assert json_data["tipo_trazo"] == "circulo"

    # Verificar presencia de características geométricas
    geom = json_data["caracteristicas_geometricas"]
    for field in ["longitud_trazo", "alto", "ancho", "proporcion", "inclinacion", "curvatura", "separacion_componentes", "posicion_normalizada"]:
        assert field in geom
        if field != "posicion_normalizada":
            assert math.isfinite(geom[field])

    # Verificar presencia de indicadores cuantitativos
    ind = json_data["indicadores_cuantitativos"]
    for field in ["desviacion", "rugosidad", "continuidad", "regularidad"]:
        assert field in ind
        assert math.isfinite(ind[field])

    # Verificar estado de clasificación no disponible
    cl = json_data["clasificacion"]
    assert cl["risk_label"] == "no_disponible"
    assert cl["risk_score"] is None
