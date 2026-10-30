import cv2
import numpy as np
from typing import Tuple, Dict, Any
from .skeletonization import zhang_suen_thinning

class PreprocessingError(Exception):
    pass

def decode_image_bytes(image_bytes: bytes) -> np.ndarray:
    """Decodifica bytes a una imagen BGR de OpenCV."""
    if not image_bytes or len(image_bytes) == 0:
        raise PreprocessingError("El archivo de imagen está vacío (0 bytes).")

    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if img is None:
        raise PreprocessingError("No se pudo decodificar la imagen. Formato no compatible o archivo corrupto.")

    h, w = img.shape[:2]
    if h < 20 or w < 20:
        raise PreprocessingError(f"Dimensiones de imagen insuficientes ({w}x{h} px). Mínimo requerido: 20x20 px.")

    return img

def preprocess_stroke_image(
    img_bgr: np.ndarray,
    max_dimension: int = 1200,
    min_component_area: int = 15
) -> Tuple[np.ndarray, np.ndarray, Dict[str, Any]]:
    """
    Pipeline completo de preprocesamiento para trazos grafomotores (HU-07):
    1. Redimensión controlada si excede max_dimension (mantiene relación de aspecto).
    2. Conversión a escala de grises.
    3. Reducción de ruido con Filtro Bilateral (preserva bordes finos del grafito).
    4. Binarización Otsu con inversión (trazo = 255, fondo papel = 0).
    5. Filtrado morfológico de ruido puntual y componentes espurios.
    6. Esqueletización morfológica con Zhang-Suen (trazo uniforme de 1 px).

    Retorna:
      (binary_mask, skeleton_1px, metadata_proceso)
    """
    orig_h, orig_w = img_bgr.shape[:2]
    scale_factor = 1.0

    # 1. Normalización de dimensiones si la captura es de muy alta resolución
    if max(orig_h, orig_w) > max_dimension:
        scale_factor = max_dimension / float(max(orig_h, orig_w))
        new_w = int(orig_w * scale_factor)
        new_h = int(orig_h * scale_factor)
        img_resized = cv2.resize(img_bgr, (new_w, new_h), interpolation=cv2.INTER_AREA)
    else:
        img_resized = img_bgr

    # 2. Conversión a escala de grises
    gray = cv2.cvtColor(img_resized, cv2.COLOR_BGR2GRAY)

    # 3. Reducción de ruido con filtro bilateral (elimina ruido de grano del papel preservando el trazo)
    filtered = cv2.bilateralFilter(gray, d=9, sigmaColor=75, sigmaSpace=75)

    # 4. Binarización Otsu (Inversa: trazo de lápiz oscuro pasa a blanco 255, fondo pasa a 0)
    _, binary_inv = cv2.threshold(filtered, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)

    # 5. Filtrado de ruido menor y aislamiento de componentes significativos
    # Eliminar componentes aislados con área menor a min_component_area
    num_labels, labels, stats, _ = cv2.connectedComponentsWithStats(binary_inv, connectivity=8)
    clean_binary = np.zeros_like(binary_inv, dtype=np.uint8)

    foreground_components = 0
    total_stroke_pixels = 0
    for label_idx in range(1, num_labels):
        area = stats[label_idx, cv2.CC_STAT_AREA]
        if area >= min_component_area:
            clean_binary[labels == label_idx] = 255
            foreground_components += 1
            total_stroke_pixels += area

    if foreground_components == 0 or total_stroke_pixels == 0:
        raise PreprocessingError("No se identificaron trazos significativos en la imagen tras el filtrado morfológico.")

    # 6. Esqueletización morfológica (Zhang-Suen) para grosor uniforme de 1 px
    skeleton = zhang_suen_thinning(clean_binary)

    meta = {
        "dimensiones_originales": {"ancho": orig_w, "alto": orig_h},
        "dimensiones_procesadas": {"ancho": clean_binary.shape[1], "alto": clean_binary.shape[0]},
        "factor_escala": scale_factor,
        "componentes_identificados": foreground_components,
        "pixeles_trazo_binario": int(total_stroke_pixels),
        "pixeles_esqueleto_1px": int(np.count_nonzero(skeleton)),
    }

    return clean_binary, skeleton, meta
