import time
from fastapi import APIRouter, File, UploadFile, HTTPException, Form
from typing import Optional

from schemas.analysis import AnalyzeResponseSchema
from services.preprocessing import decode_image_bytes, preprocess_stroke_image, PreprocessingError
from services.features import extract_all_geometric_features
from services.indicators import compute_all_quantitative_indicators
from services.classifier import classifier_instance

router = APIRouter(prefix="/api", tags=["Análisis Computacional"])

@router.post("/analyze", response_model=AnalyzeResponseSchema)
async def analyze_stroke_image(
    file: UploadFile = File(...),
    tipo_esperado: Optional[str] = Form("circulo")
):
    """
    Endpoint principal de análisis grafomotor computacional (HU-07 a HU-10).
    Recibe la imagen de la ficha física de ejercicio, ejecuta el pipeline real de OpenCV,
    extrae descriptores geométricos cuantificados y calcula indicadores frente a la referencia.
    """
    # 1. Validación del archivo
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail="El archivo proporcionado no es una imagen válida (debe ser JPG o PNG)."
        )

    contents = await file.read()
    if len(contents) == 0:
        raise HTTPException(
            status_code=400,
            detail="El archivo enviado está vacío (0 bytes)."
        )

    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail="La imagen excede el tamaño máximo permitido de 10 MB."
        )

    t_start = time.time()

    # 2. Decodificación y preprocesamiento con OpenCV (HU-07)
    try:
        img_bgr = decode_image_bytes(contents)
        clean_binary, skeleton, proc_meta = preprocess_stroke_image(img_bgr)
    except PreprocessingError as pe:
        raise HTTPException(status_code=422, detail=str(pe))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error durante el preprocesamiento digital de la imagen: {str(e)}"
        )

    # 3. Extracción de características geométricas objetivas (HU-08)
    try:
        geometric_features = extract_all_geometric_features(skeleton, clean_binary.shape)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error en el cálculo de características geométricas: {str(e)}"
        )

    # 4. Cálculo de indicadores cuantitativos de comparación (HU-09)
    try:
        quantitative_indicators = compute_all_quantitative_indicators(
            skeleton,
            tipo_esperado or "circulo"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error en el cálculo de indicadores cuantitativos: {str(e)}"
        )

    # 5. Clasificación orientativa con control de disponibilidad (HU-10)
    classification_res = classifier_instance.predict(
        geometric_features,
        quantitative_indicators
    )

    t_elapsed = round(time.time() - t_start, 3)

    return {
        "estado": "procesado",
        "mensaje": "Análisis computacional y extracción de características completado exitosamente.",
        "tipo_trazo": tipo_esperado or "circulo",
        "caracteristicas_geometricas": geometric_features,
        "indicadores_cuantitativos": quantitative_indicators,
        "clasificacion": classification_res,
        "detalles_computacionales": {
            "archivo": file.filename,
            "tiempo_procesamiento_segundos": t_elapsed,
            "metadatos_imagen": proc_meta,
            "etapas_completadas": [
                "1. Recepción y validación de la imagen en memoria",
                "2. Conversión a escala de grises y reducción de ruido (Filtro Bilateral)",
                "3. Binarización de Otsu e inversión morfológica",
                "4. Filtrado de ruido puntual y aislamiento del trazo",
                "5. Esqueletización de Zhang-Suen (1 píxel de grosor)",
                "6. Medición cuantitativa de longitud, curvatura, orientación y continuidad",
                "7. Ajuste y comparación frente al patrón geométrico de referencia",
                "8. Consulta del clasificador supervisado",
            ],
            "aviso_pedagogico": (
                "Características calculadas a partir de la captura estática en papel. "
                "Esta herramienta es de apoyo al docente y no constituye diagnóstico clínico."
            ),
        }
    }
