import os
import joblib
from typing import Dict, Any, Optional

FEATURE_NAMES = [
    "longitud_trazo",
    "alto",
    "ancho",
    "proporcion",
    "inclinacion",
    "curvatura",
    "separacion_componentes",
    "desviacion",
    "rugosidad",
    "continuidad",
    "regularidad",
]

class RiskClassifier:
    """
    Clasificador experimental. Solo acepta sugerencias S, ED o NA ya presentes
    como clases del modelo; no transforma etiquetas de riesgo en valoraciones.
    """
    def __init__(self, model_path: Optional[str] = None):
        self.model_path = model_path
        self.model = None
        self.metadata = {}
        self.version_name = None
        self.model_id = None
        if model_path and os.path.exists(model_path):
            self.load_model(model_path)

    def load_model(self, path: str, model_id: Optional[str] = None):
        if not os.path.exists(path):
            raise FileNotFoundError(f"El archivo del modelo no existe: {path}")
        loaded = joblib.load(path)
        self.model_path = path
        self.model_id = model_id
        if isinstance(loaded, dict) and "model" in loaded:
            self.model = loaded["model"]
            self.metadata = loaded.get("metadata", {})
            self.version_name = self.metadata.get("version", model_id or os.path.basename(path))
        else:
            self.model = loaded
            self.metadata = {}
            self.version_name = model_id or os.path.basename(path)

    def is_available(self) -> bool:
        return self.model is not None

    def predict(
        self,
        features: Dict[str, Any],
        indicators: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Ejecuta inferencia solo si hay modelo cargado y su clase pertenece a S, ED o NA.
        """
        if not self.is_available():
            return {
                "disponible": False,
                "sugerencia": None,
                "model_version": None,
                "mensaje": (
                    "Sugerencia no disponible: no hay un modelo experimental cargado."
                ),
            }

        # Construir vector de características exacto
        try:
            x = [
                float(features.get("longitud_trazo", 0.0)),
                float(features.get("alto", 0)),
                float(features.get("ancho", 0)),
                float(features.get("proporcion", 1.0)),
                float(features.get("inclinacion", 0.0)),
                float(features.get("curvatura", 0.0)),
                float(features.get("separacion_componentes", 0.0)),
                float(indicators.get("desviacion", 0.0)),
                float(indicators.get("rugosidad", 0.0)),
                float(indicators.get("continuidad", 1.0)),
                float(indicators.get("regularidad", 1.0)),
            ]

            prediction = self.model.predict([x])[0]

            suggestion = str(prediction).upper()
            if suggestion not in {"S", "ED", "NA"}:
                suggestion = None

            return {
                "disponible": True,
                "sugerencia": suggestion,
                "model_version": self.version_name,
                "mensaje": (
                    "Sugerencia experimental calculada; la valoración final corresponde a la docente."
                ),
            }
        except Exception as e:
            return {
                "disponible": False,
                "sugerencia": None,
                "model_version": self.version_name,
                "mensaje": f"Error durante la inferencia del modelo: {str(e)}",
            }

# Instancia singleton del clasificador (por defecto sin modelo activo hasta que el admin active uno)
classifier_instance = RiskClassifier()
