import hashlib
import json
import re
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, ConfigDict, Field

from services.classifier import classifier_instance

router = APIRouter(prefix="/api/models", tags=["Administración de Modelos"])
MODELS_DIR = Path(__file__).resolve().parents[1] / "models"
MANIFEST_PATH = MODELS_DIR / "manifest.json"
MODEL_ID_PATTERN = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$")
SHA256_PATTERN = re.compile(r"^[a-fA-F0-9]{64}$")


class LoadModelRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    model_id: str = Field(min_length=1, max_length=64)
    version_name: Optional[str] = None


def _manifest() -> dict:
    try:
        data = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise HTTPException(status_code=503, detail="El catálogo de modelos no está disponible.") from exc
    if not isinstance(data, dict) or not isinstance(data.get("models"), dict):
        raise HTTPException(status_code=503, detail="El catálogo de modelos no tiene un formato válido.")
    return data["models"]


def _resolve_registered_model(model_id: str) -> Path:
    if not MODEL_ID_PATTERN.fullmatch(model_id):
        raise HTTPException(status_code=422, detail="Identificador de modelo no válido.")

    entry = _manifest().get(model_id)
    if not isinstance(entry, dict):
        raise HTTPException(status_code=404, detail="El identificador de modelo no está registrado.")

    filename = entry.get("filename")
    expected_hash = entry.get("sha256")
    if (
        not isinstance(filename, str)
        or Path(filename).name != filename
        or Path(filename).suffix not in {".joblib", ".pkl"}
        or not isinstance(expected_hash, str)
        or not SHA256_PATTERN.fullmatch(expected_hash)
    ):
        raise HTTPException(status_code=503, detail="La entrada del catálogo de modelos no es válida.")

    resolved_root = MODELS_DIR.resolve()
    resolved_file = (resolved_root / filename).resolve()
    if resolved_file.parent != resolved_root or not resolved_file.is_file():
        raise HTTPException(status_code=404, detail="El archivo registrado no está disponible.")

    digest = hashlib.sha256(resolved_file.read_bytes()).hexdigest()
    if not hmac_compare_digest(digest, expected_hash.lower()):
        raise HTTPException(status_code=409, detail="El hash del modelo no coincide con el catálogo.")
    return resolved_file


def hmac_compare_digest(left: str, right: str) -> bool:
    # Constant-time comparison avoids leaking partial hash matches.
    import hmac
    return hmac.compare_digest(left, right)


@router.get("/status")
def get_model_status():
    return {
        "disponible": classifier_instance.is_available(),
        "version_activa": classifier_instance.version_name,
        "metadatos": classifier_instance.metadata,
        "model_id": classifier_instance.model_id,
    }


@router.post("/load")
def load_model_file(req: LoadModelRequest):
    """Load only an allowlisted model whose SHA-256 matches the deployed manifest."""
    resolved_path = _resolve_registered_model(req.model_id)
    try:
        classifier_instance.load_model(str(resolved_path), model_id=req.model_id)
        if req.version_name:
            classifier_instance.version_name = req.version_name
        return {
            "loaded": classifier_instance.is_available(),
            "model_id": req.model_id,
            "version": classifier_instance.version_name,
            "metadatos": classifier_instance.metadata,
        }
    except Exception as exc:
        raise HTTPException(status_code=400, detail="No se pudo cargar el modelo registrado.") from exc


@router.post("/unload")
def unload_model():
    classifier_instance.model = None
    classifier_instance.metadata = {}
    classifier_instance.version_name = None
    classifier_instance.model_path = None
    classifier_instance.model_id = None
    return {"loaded": False, "mensaje": "Modelo desactivado."}
