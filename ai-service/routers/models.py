import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, Optional

from services.classifier import classifier_instance

router = APIRouter(prefix="/api/models", tags=["Administración de Modelos"])

class LoadModelRequest(BaseModel):
    file_path: str
    version_name: Optional[str] = None

@router.get("/status")
def get_model_status():
    """Consulta el estado del clasificador y el modelo activo."""
    return {
        "disponible": classifier_instance.is_available(),
        "version_activa": classifier_instance.version_name,
        "metadatos": classifier_instance.metadata,
        "ruta_archivo": classifier_instance.model_path,
    }

@router.post("/load")
def load_model_file(req: LoadModelRequest):
    """Carga un modelo entrenado (.joblib o .pkl) para inferencia activa."""
    if not os.path.isabs(req.file_path):
        # Resolver relativo a la raíz de ai-service
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        resolved_path = os.path.join(base_dir, req.file_path)
    else:
        resolved_path = req.file_path

    if not os.path.exists(resolved_path):
        raise HTTPException(
            status_code=404,
            detail=f"El archivo del modelo no fue encontrado en: {resolved_path}"
        )

    try:
        classifier_instance.load_model(resolved_path)
        if req.version_name:
            classifier_instance.version_name = req.version_name

        return {
            "mensaje": "Modelo cargado y activado exitosamente.",
            "version": classifier_instance.version_name,
            "metadatos": classifier_instance.metadata,
        }
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"No se pudo cargar el modelo: {str(e)}"
        )

@router.post("/unload")
def unload_model():
    """Desactiva el modelo actual pasando el clasificador a modo NO DISPONIBLE."""
    classifier_instance.model = None
    classifier_instance.metadata = {}
    classifier_instance.version_name = None
    classifier_instance.model_path = None
    return {
        "mensaje": "Modelo desactivado. El clasificador opera ahora en modo 'NO DISPONIBLE'."
    }
