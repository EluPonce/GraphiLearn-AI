import cv2
import numpy as np
import math
from typing import Dict, Any, Tuple

def _order_points_approx(skeleton: np.ndarray) -> np.ndarray:
    """
    Ordena aproximadamente los puntos del esqueleto a lo largo de la trayectoria
    usando contornos para permitir mediciones de rugosidad y variación angular secuencial.
    """
    contours, _ = cv2.findContours(skeleton, cv2.RETR_LIST, cv2.CHAIN_APPROX_NONE)
    if not contours:
        y, x = np.where(skeleton > 0)
        return np.column_stack((x, y))

    # Tomar el contorno más largo
    longest = max(contours, key=cv2.contourArea if len(contours) > 1 else len)
    pts = longest.reshape(-1, 2)
    return pts

# ---------------------------------------------------------------------------
# HU-09: Ajustes a referencias geométricas específicas
# ---------------------------------------------------------------------------

def fit_line_deviation(points: np.ndarray) -> float:
    """
    Ajusta una línea ideal por mínimos cuadrados usando cv2.fitLine.
    Calcula la distancia perpendicular media a la recta ajustada, normalizada.
    """
    if len(points) < 2:
        return 0.0

    vx, vy, x0, y0 = cv2.fitLine(points, cv2.DIST_L2, 0, 0.01, 0.01).flatten()

    # Ecuación de la recta: -vy*(x - x0) + vx*(y - y0) = 0
    # Distancia perpendicular: |-vy*(x - x0) + vx*(y - y0)| / sqrt(vx^2 + vy^2)
    dx = points[:, 0] - x0
    dy = points[:, 1] - y0
    norm = math.sqrt(vx**2 + vy**2)
    if norm == 0:
        return 0.0

    distances = np.abs(-vy * dx + vx * dy) / norm
    mean_dist = float(np.mean(distances))

    # Normalizar por la extensión longitudinal de la línea
    pt_min = np.min(points, axis=0)
    pt_max = np.max(points, axis=0)
    extent = math.sqrt((pt_max[0] - pt_min[0])**2 + (pt_max[1] - pt_min[1])**2)

    if extent <= 0:
        return 0.0

    normalized_dev = mean_dist / extent
    return round(float(normalized_dev), 4)

def fit_circle_deviation(points: np.ndarray) -> float:
    """
    Ajusta un círculo algebraico por mínimos cuadrados (Kåsa fit).
    Calcula la desviación radial media relativa |r_i - R| / R.
    """
    if len(points) < 3:
        return 0.0

    x = points[:, 0].astype(np.float64)
    y = points[:, 1].astype(np.float64)

    # Sistema lineal: A [x_c, y_c, c] = b
    # x^2 + y^2 - 2 x_c x - 2 y_c y + c = 0
    A = np.column_stack((2 * x, 2 * y, np.ones_like(x)))
    b = x**2 + y**2

    try:
        sol, residuals, rank, s = np.linalg.lstsq(A, b, rcond=None)
        xc, yc, c = sol
        radius_sq = xc**2 + yc**2 + c
        if radius_sq <= 0:
            radius = float(np.mean(np.sqrt((x - np.mean(x))**2 + (y - np.mean(y))**2)))
            xc, yc = float(np.mean(x)), float(np.mean(y))
        else:
            radius = math.sqrt(radius_sq)
    except Exception:
        xc, yc = float(np.mean(x)), float(np.mean(y))
        radius = float(np.mean(np.sqrt((x - xc)**2 + (y - yc)**2)))

    if radius <= 0:
        return 0.0

    radii = np.sqrt((x - xc)**2 + (y - yc)**2)
    deviations = np.abs(radii - radius)
    mean_dev = float(np.mean(deviations))

    normalized_dev = mean_dev / radius
    return round(float(normalized_dev), 4)

def fit_spiral_deviation(points: np.ndarray) -> float:
    """
    Ajusta una espiral de Arquímedes r = a + b * theta.
    Calcula la desviación radial media respecto a la trayectoria teórica.
    """
    if len(points) < 10:
        return 0.0

    xc, yc = float(np.mean(points[:, 0])), float(np.mean(points[:, 1]))
    dx = points[:, 0] - xc
    dy = points[:, 1] - yc

    r = np.sqrt(dx**2 + dy**2)
    theta = np.arctan2(dy, dx)

    # Desenvolver theta para obtener progresión angular continua
    theta_unwrapped = np.unwrap(theta)

    # Regresión lineal r = a + b * theta
    A = np.column_stack((np.ones_like(theta_unwrapped), theta_unwrapped))
    try:
        (a, b), _, _, _ = np.linalg.lstsq(A, r, rcond=None)
        r_fitted = a + b * theta_unwrapped
        deviations = np.abs(r - r_fitted)
        r_max = float(np.max(r))
        if r_max <= 0:
            return 0.0
        normalized_dev = float(np.mean(deviations)) / r_max
        return round(float(normalized_dev), 4)
    except Exception:
        return 0.0

def fit_zigzag_deviation(points: np.ndarray) -> float:
    """
    Ajusta segmentos poli-lineales aproximados para el patrón de zigzag.
    Calcula la distancia de los puntos a los segmentos de línea de los vértices.
    """
    if len(points) < 6:
        return 0.0

    # Aproximación poligonal para hallar vértices del zigzag
    # Usando epsilon relativo a la extensión del trazo
    pt_min = np.min(points, axis=0)
    pt_max = np.max(points, axis=0)
    diag = math.sqrt((pt_max[0] - pt_min[0])**2 + (pt_max[1] - pt_min[1])**2)
    if diag <= 0:
        return 0.0

    epsilon = max(2.0, 0.04 * diag)
    pts_curve = points.reshape(-1, 1, 2).astype(np.int32)
    approx_vertices = cv2.approxPolyDP(pts_curve, epsilon, closed=False).reshape(-1, 2)

    if len(approx_vertices) < 2:
        return fit_line_deviation(points)

    # Calcular distancia de cada punto a los segmentos ideales
    total_dist = 0.0
    for pt in points:
        min_seg_dist = float('inf')
        for i in range(len(approx_vertices) - 1):
            p1 = approx_vertices[i].astype(np.float64)
            p2 = approx_vertices[i + 1].astype(np.float64)

            seg_vec = p2 - p1
            seg_len_sq = np.dot(seg_vec, seg_vec)
            if seg_len_sq == 0:
                d = np.linalg.norm(pt - p1)
            else:
                t = max(0.0, min(1.0, np.dot(pt - p1, seg_vec) / seg_len_sq))
                proj = p1 + t * seg_vec
                d = np.linalg.norm(pt - proj)
            if d < min_seg_dist:
                min_seg_dist = d
        total_dist += min_seg_dist

    mean_dist = total_dist / float(len(points))
    normalized_dev = mean_dist / diag
    return round(float(normalized_dev), 4)

def calculate_deviation_by_type(skeleton: np.ndarray, tipo_trazo: str) -> float:
    """
    Calcula la desviación normalizada frente a la referencia geométrica correspondiente.
    """
    pts = _order_points_approx(skeleton)
    if len(pts) < 2:
        return 0.0

    tipo = (tipo_trazo or 'circulo').strip().lower()

    if 'line' in tipo:
        return fit_line_deviation(pts)
    elif 'circ' in tipo:
        return fit_circle_deviation(pts)
    elif 'espiral' in tipo or 'spiral' in tipo:
        return fit_spiral_deviation(pts)
    elif 'zig' in tipo:
        return fit_zigzag_deviation(pts)
    else:
        # Fallback genérico a círculo
        return fit_circle_deviation(pts)

# ---------------------------------------------------------------------------
# Indicadores complementarios: Rugosidad, Continuidad, Regularidad
# ---------------------------------------------------------------------------

def calculate_roughness(skeleton: np.ndarray) -> float:
    """
    Calcula la rugosidad o variación angular local del trazo.
    Mide la desviación estándar de los cambios angulares locales consecutivos.
    Un trazo suave y controlado tiene rugosidad cercana a 0.0;
    un trazo tembloroso o espasmódico presenta alta rugosidad.
    """
    pts = _order_points_approx(skeleton)
    if len(pts) < 5:
        return 0.0

    step = max(1, len(pts) // 60)
    sampled = pts[::step]
    if len(sampled) < 4:
        return 0.0

    v = np.diff(sampled, axis=0)
    lengths = np.linalg.norm(v, axis=1)
    valid = lengths > 0
    v = v[valid]
    lengths = lengths[valid]

    if len(v) < 3:
        return 0.0

    u = v / lengths[:, np.newaxis]
    dots = np.sum(u[:-1] * u[1:], axis=1)
    dots = np.clip(dots, -1.0, 1.0)
    angles = np.arccos(dots)

    # La rugosidad es la desviación estándar de los giros locales sucesivos
    std_angles = float(np.std(angles))
    return round(float(std_angles), 4)

def calculate_continuity(skeleton: np.ndarray) -> float:
    """
    Calcula el índice de continuidad visible del trazo [0.0 - 1.0].
    Fórmula: (píxeles componente principal / píxeles totales) * factor de penalización por fragmentos.
    1.0 = trazo perfectamente continuo.
    Valores inferiores indican fragmentación visible o cortes en el trazo.
    """
    num_labels, labels, stats, _ = cv2.connectedComponentsWithStats(skeleton, connectivity=8)
    num_components = num_labels - 1

    if num_components <= 0:
        return 0.0
    if num_components == 1:
        return 1.0

    areas = stats[1:, cv2.CC_STAT_AREA]
    max_area = float(np.max(areas))
    total_area = float(np.sum(areas))

    if total_area <= 0:
        return 0.0

    main_ratio = max_area / total_area
    # Penalización gradual según número de fragmentos desconectados
    fragment_penalty = 1.0 / (1.0 + 0.15 * (num_components - 1))
    continuity = main_ratio * fragment_penalty

    return round(max(0.0, min(1.0, float(continuity))), 3)

def calculate_regularity(
    desviacion: float,
    rugosidad: float,
    continuidad: float
) -> float:
    """
    Calcula el índice de regularidad geométrica [0.0 - 1.0].
    Combina la fidelidad a la pauta geométrica (1 - desv), la suavidad angular (1 - rugosidad)
    y la continuidad del trazo.
    1.0 = máxima regularidad geométrica.
    """
    # Desviación típica normalizada suele estar en [0.02, 0.40]
    dev_penalty = min(1.0, desviacion * 2.5)

    # Rugosidad típica suele estar en [0.1, 1.2] rad
    rough_penalty = min(1.0, rugosidad / 1.5)

    # Regularidad base
    reg = 1.0 - (0.45 * dev_penalty + 0.35 * rough_penalty + 0.20 * (1.0 - continuidad))

    return round(max(0.0, min(1.0, float(reg))), 3)

def compute_all_quantitative_indicators(
    skeleton: np.ndarray,
    tipo_trazo: str
) -> Dict[str, float]:
    """
    Calcula los 4 indicadores cuantitativos de HU-09 para el ejercicio dado.
    """
    desviacion = calculate_deviation_by_type(skeleton, tipo_trazo)
    rugosidad = calculate_roughness(skeleton)
    continuidad = calculate_continuity(skeleton)
    regularidad = calculate_regularity(desviacion, rugosidad, continuidad)

    return {
        "desviacion": desviacion,
        "rugosidad": rugosidad,
        "continuidad": continuidad,
        "regularidad": regularidad,
    }
