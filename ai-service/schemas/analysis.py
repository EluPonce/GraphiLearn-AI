from pydantic import BaseModel, Field
from typing import Dict, Any, Optional, List

class NormalizedPosition(BaseModel):
    center_x: float = Field(..., description="Posición X normalizada del centroide [0.0 - 1.0]")
    center_y: float = Field(..., description="Posición Y normalizada del centroide [0.0 - 1.0]")
    bbox_normalized: List[float] = Field(..., description="[x_min, y_min, x_max, y_max] normalizados [0.0 - 1.0]")

class GeometricFeaturesSchema(BaseModel):
    longitud_trazo: float = Field(..., description="Longitud acumulada del esqueleto en píxeles euclidianos (px)")
    alto: int = Field(..., description="Alto del bounding box mínimo del trazo (px)")
    ancho: int = Field(..., description="Ancho del bounding box mínimo del trazo (px)")
    proporcion: float = Field(..., description="Relación de aspecto del trazo (ancho / alto)")
    inclinacion: float = Field(..., description="Orientación angular del eje principal en grados [-90° a 90°]")
    curvatura: float = Field(..., description="Curvatura media a lo largo de la trayectoria (rad/px o suma angular normalizada)")
    separacion_componentes: float = Field(..., description="Distancia media/mínima entre componentes conexos visibles (0.0 si es continuo) (px)")
    posicion_normalizada: NormalizedPosition = Field(..., description="Ubicación espacial relativa en el plano de la hoja")

class QuantitativeIndicatorsSchema(BaseModel):
    desviacion: float = Field(..., description="Desviación normalizada frente al patrón geométrico de referencia (a menor valor, mayor ajuste)")
    rugosidad: float = Field(..., description="Variación angular local / vacilación del trazo (a menor valor, trazo más suave)")
    continuidad: float = Field(..., description="Índice de continuidad del trazo [0.0 - 1.0] (1.0 = trazo completamente continuo)")
    regularidad: float = Field(..., description="Índice de uniformidad geométrica [0.0 - 1.0] (1.0 = máxima regularidad)")

class ClassificationResultSchema(BaseModel):
    disponible: bool = Field(False, description="Indica si existe un modelo de clasificación validado y cargado")
    risk_label: Optional[str] = Field("no_disponible", description="Etiqueta orientativa de riesgo: 'bajo_riesgo', 'riesgo_potencial' o 'no_disponible'")
    risk_score: Optional[float] = Field(None, description="Probabilidad o score calibrado [0.0 - 1.0], None si no está disponible")
    model_version: Optional[str] = Field(None, description="Identificador de la versión del modelo utilizada")
    mensaje: str = Field(..., description="Explicación controlada del estado del clasificador")

class AnalyzeResponseSchema(BaseModel):
    estado: str = Field("procesado", description="Estado del procesamiento: 'procesado' o 'error'")
    mensaje: str = Field(..., description="Mensaje descriptivo del resultado")
    tipo_trazo: str = Field(..., description="Tipo de ejercicio analizado: 'linea', 'circulo', 'espiral', 'zigzag'")
    caracteristicas_geometricas: GeometricFeaturesSchema
    indicadores_cuantitativos: QuantitativeIndicatorsSchema
    clasificacion: ClassificationResultSchema
    detalles_computacionales: Dict[str, Any] = Field(default_factory=dict)
