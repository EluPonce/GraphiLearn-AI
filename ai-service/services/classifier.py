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
    Gestor del clasificador de Machine Learning para detección orientativa de riesgo grafomotor.
    Si no existe un modelo clínico validado cargado, opera en modo seguro 'NO DISPONIBLE'.
    """
    def __init__(self, model_path: Optional[str] = None):
        self.model_path = model_path
        self.model = None
        self.metadata = {}
        self.version_name = None
        if model_path and os.path.exists(model_path):
            self.load_model(model_path)

    def load_model(self, path: str):
        if not os.path.exists(path):
            raise FileNotFoundError(f"El archivo del modelo no existe: {path}")
        loaded = joblib.load(path)
        if isinstance(loaded, dict) and "model" in loaded:
            self.model = loaded["model"]
            self.metadata = loaded.get("metadata", {})
            self.version_name = self.metadata.get("version", os.path.basename(path))
        else:
            self.model = loaded
            self.metadata = {}
            self.version_name = os.path.basename(path)

    def is_available(self) -> bool:
        return self.model is not None

    def predict(
        self,
        features: Dict[str, Any],
        indicators: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Ejecuta la inferencia si hay un modelo validado cargado.
        Si no hay modelo, devuelve una respuesta explícita y controlada de NO DISPONIBLE.
        """
        if not self.is_available():
            return {
                "disponible": False,
                "risk_label": "no_disponible",
                "risk_score": None,
                "model_version": None,
                "mensaje": (
                    "Clasificación orientativa no disponible: pendiente de entrenamiento "
                    "y validación con dataset clínico especializado de nivel inicial."
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

            # Obtener probabilidad calibrada si el modelo lo soporta
            risk_score = None
            if hasattr(self.model, "predict_proba"):
                probas = self.model.predict_proba([x])[0]
                risk_score = round(float(probas[-1]), 4)

            # Normalizar etiqueta de salida
            label_map = {
                0: "bajo_riesgo",
                1: "riesgo_potencial",
                "bajo_riesgo": "bajo_riesgo",
                "riesgo_potencial": "riesgo_potencial",
            }
            risk_label = label_map.get(prediction, str(prediction))

            return {
                "disponible": True,
                "risk_label": risk_label,
                "risk_score": risk_score,
                "model_version": self.version_name,
                "mensaje": (
                    "Clasificación orientativa calculada. No constituye diagnóstico clínico; "
                    "sujeta a revisión y validación pedagógica."
                ),
            }
        except Exception as e:
            return {
                "disponible": False,
                "risk_label": "no_disponible",
                "risk_score": None,
                "model_version": self.version_name,
                "mensaje": f"Error durante la inferencia del modelo: {str(e)}",
            }

# Instancia singleton del clasificador (por defecto sin modelo activo hasta que el admin active uno)
classifier_instance = RiskClassifier()
