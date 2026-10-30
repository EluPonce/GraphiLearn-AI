import os
import sys

# Asegurar que el directorio de ai-service esté en el PYTHONPATH
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from routers.analysis import router as analysis_router
from routers.models import router as models_router

app = FastAPI(
    title="GraphiLearn AI - Computer Vision & ML Service",
    description="Microservicio de procesamiento de imágenes con OpenCV y análisis de características grafomotoras",
    version="2.0.0"
)

# CORS para comunicación con cliente web y backend Laravel
app.add_middleware(
    CORSMiddleware,
    allow_origins=[],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir routers modulares
app.include_router(analysis_router)
app.include_router(models_router)

@app.get("/")
def read_root():
    return {
        "sistema": "GraphiLearn AI",
        "servicio": "Microservicio de Procesamiento y Visión Artificial",
        "estado": "activo",
        "version": "2.0.0",
        "sprint": "Sprint 2 - Pipeline OpenCV Real y Extracción Geométrica",
        "endpoints": [
            "/api/analyze",
            "/api/models/status",
            "/api/models/load",
            "/predict (compatibilidad)"
        ]
    }

# Endpoint de compatibilidad retrocompatible
@app.post("/predict")
async def predict_compat(file: UploadFile = File(...)):
    """Endpoint de compatibilidad que reenvía a /api/analyze."""
    from routers.analysis import analyze_stroke_image
    res = await analyze_stroke_image(file=file, tipo_esperado="circulo")
    return {
        "risk_label": res["clasificacion"]["risk_label"],
        "risk_score": res["clasificacion"]["risk_score"],
        "features": {
            "deviation": res["indicadores_cuantitativos"]["desviacion"],
            "length": res["caracteristicas_geometricas"]["longitud_trazo"]
        },
        "detalles": res["detalles_computacionales"]
    }
