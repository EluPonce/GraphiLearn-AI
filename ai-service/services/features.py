import cv2
import numpy as np
import math
from typing import Dict, Any, List

def calculate_stroke_length(skeleton: np.ndarray) -> float:
    """
    Calcula la longitud del trazo en píxeles euclidianos sobre el esqueleto de 1 px.
    Pondera conexiones ortogonales con peso 1.0 y diagonales con peso sqrt(2).
    """
    y_coords, x_coords = np.where(skeleton > 0)
    num_points = len(x_coords)
    if num_points <= 1:
        return float(num_points)

    # Padding para vecindad 3x3
    pad = np.pad((skeleton > 0).astype(np.uint8), 1, mode='constant')

    # Vecinos de cada pixel no cero
    y_p = y_coords + 1
    x_p = x_coords + 1

    # Vecinos ortogonales: arriba, abajo, izq, der
    ortho_neighbors = (
        pad[y_p - 1, x_p] +
        pad[y_p + 1, x_p] +
        pad[y_p, x_p - 1] +
        pad[y_p, x_p + 1]
    )

    # Vecinos diagonales: esquinas
    diag_neighbors = (
        pad[y_p - 1, x_p - 1] +
        pad[y_p - 1, x_p + 1] +
        pad[y_p + 1, x_p - 1] +
        pad[y_p + 1, x_p + 1]
    )

    # Cada arista se cuenta 2 veces (desde ambos extremos)
    total_ortho_edges = np.sum(ortho_neighbors) / 2.0
    total_diag_edges = np.sum(diag_neighbors) / 2.0

    length = total_ortho_edges * 1.0 + total_diag_edges * math.sqrt(2.0)

    # Si es una colección de puntos sin aristas directas, retornar conteo de puntos
    if length < 1.0 and num_points > 0:
        return float(num_points)

    return round(float(length), 2)

def calculate_bounding_box(skeleton: np.ndarray) -> Dict[str, Any]:
    """Obtiene alto, ancho y coordenadas extremas del trazo."""
    y_coords, x_coords = np.where(skeleton > 0)
    if len(x_coords) == 0:
        return {"ancho": 0, "alto": 0, "bbox": [0, 0, 0, 0]}

    x_min, x_max = int(np.min(x_coords)), int(np.max(x_coords))
    y_min, y_max = int(np.min(y_coords)), int(np.max(y_coords))

    ancho = x_max - x_min + 1
    alto = y_max - y_min + 1

    return {
        "ancho": ancho,
        "alto": alto,
        "bbox": [x_min, y_min, x_max, y_max]
    }

def calculate_aspect_ratio(ancho: int, alto: int) -> float:
    """Calcula relación de aspecto ancho / alto cuidando división por cero."""
    if alto <= 0:
        return 1.0
    return round(float(ancho / alto), 3)

def calculate_orientation_angle(skeleton: np.ndarray) -> float:
    """
    Calcula el ángulo de inclinación principal en grados [-90°, 90°]
    mediante análisis de momentos centrales de segundo orden (PCA).
    """
    y_coords, x_coords = np.where(skeleton > 0)
    if len(x_coords) < 3:
        return 0.0

    moments = cv2.moments(skeleton)
    mu20 = moments['mu20']
    mu02 = moments['mu02']
    mu11 = moments['mu11']

    # Ángulo principal = 0.5 * atan2(2*mu11, mu20 - mu02)
    angle_rad = 0.5 * math.atan2(2 * mu11, mu20 - mu02)
    angle_deg = math.degrees(angle_rad)

    # Normalizar a [-90°, 90°]
    if angle_deg > 90.0:
        angle_deg -= 180.0
    elif angle_deg < -90.0:
        angle_deg += 180.0

    return round(float(angle_deg), 2)

def calculate_curvature(skeleton: np.ndarray) -> float:
    """
    Calcula la variación angular acumulada por unidad de distancia (rad/px).
    Utiliza el contorno del esqueleto o trazo para medir cambios de dirección tangencial.
    """
    contours, _ = cv2.findContours(skeleton, cv2.RETR_LIST, cv2.CHAIN_APPROX_NONE)
    if not contours:
        return 0.0

    total_angle_change = 0.0
    total_length = 0.0

    for c in contours:
        pts = c.reshape(-1, 2)
        if len(pts) < 3:
            continue

        # Muestreo cada k píxeles para evitar ruido a nivel de cuadrícula discreta
        step = max(1, len(pts) // 50)
        sampled = pts[::step]
        if len(sampled) < 3:
            continue

        v1 = np.diff(sampled, axis=0)
        lengths = np.linalg.norm(v1, axis=1)
        valid = lengths > 0
        v1 = v1[valid]
        lengths = lengths[valid]

        if len(v1) < 2:
            continue

        # Vectores unitarios consecutivos
        u = v1 / lengths[:, np.newaxis]
        dot_products = np.sum(u[:-1] * u[1:], axis=1)
        dot_products = np.clip(dot_products, -1.0, 1.0)

        angles = np.arccos(dot_products)
        total_angle_change += float(np.sum(angles))
        total_length += float(np.sum(lengths))

    if total_length < 1.0:
        return 0.0

    curvatura = total_angle_change / total_length
    return round(float(curvatura), 4)

def calculate_component_separation(skeleton: np.ndarray) -> float:
    """
    Calcula la distancia mínima entre componentes visibles desconectados.
    Si el trazo es completamente continuo (1 solo componente conexo),
    retorna 0.0 px (estado documentado y controlado).
    """
    num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(skeleton, connectivity=8)

    # num_labels incluye el fondo (label 0)
    num_components = num_labels - 1
    if num_components <= 1:
        return 0.0

    comp_centroids = centroids[1:]
    min_dist = float('inf')

    for i in range(len(comp_centroids)):
        for j in range(i + 1, len(comp_centroids)):
            dist = math.dist(comp_centroids[i], comp_centroids[j])
            if dist < min_dist:
                min_dist = dist

    if math.isinf(min_dist):
        return 0.0

    return round(float(min_dist), 2)

def calculate_normalized_position(
    skeleton: np.ndarray,
    img_width: int,
    img_height: int
) -> Dict[str, Any]:
    """
    Calcula las coordenadas relativas del centroide y del bounding box
    dentro del marco global de la imagen [0.0 - 1.0].
    """
    y_coords, x_coords = np.where(skeleton > 0)
    if len(x_coords) == 0 or img_width == 0 or img_height == 0:
        return {
            "center_x": 0.5,
            "center_y": 0.5,
            "bbox_normalized": [0.0, 0.0, 1.0, 1.0]
        }

    cx = float(np.mean(x_coords)) / float(img_width)
    cy = float(np.mean(y_coords)) / float(img_height)

    x_min, x_max = float(np.min(x_coords)), float(np.max(x_coords))
    y_min, y_max = float(np.min(y_coords)), float(np.max(y_coords))

    return {
        "center_x": round(max(0.0, min(1.0, cx)), 4),
        "center_y": round(max(0.0, min(1.0, cy)), 4),
        "bbox_normalized": [
            round(max(0.0, min(1.0, x_min / img_width)), 4),
            round(max(0.0, min(1.0, y_min / img_height)), 4),
            round(max(0.0, min(1.0, x_max / img_width)), 4),
            round(max(0.0, min(1.0, y_max / img_height)), 4),
        ]
    }

def extract_all_geometric_features(
    skeleton: np.ndarray,
    image_shape: tuple
) -> Dict[str, Any]:
    """
    Extrae el conjunto completo de características geométricas según HU-08.
    """
    h_img, w_img = image_shape[:2]

    bbox_info = calculate_bounding_box(skeleton)
    ancho = bbox_info["ancho"]
    alto = bbox_info["alto"]

    longitud = calculate_stroke_length(skeleton)
    proporcion = calculate_aspect_ratio(ancho, alto)
    inclinacion = calculate_orientation_angle(skeleton)
    curvatura = calculate_curvature(skeleton)
    separacion = calculate_component_separation(skeleton)
    pos_norm = calculate_normalized_position(skeleton, w_img, h_img)

    return {
        "longitud_trazo": longitud,
        "alto": alto,
        "ancho": ancho,
        "proporcion": proporcion,
        "inclinacion": inclinacion,
        "curvatura": curvatura,
        "separacion_componentes": separacion,
        "posicion_normalizada": pos_norm,
    }
