import os
import sys
import hmac

# Asegurar que el directorio de ai-service esté en el PYTHONPATH
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

# Cargar variables de entorno desde archivo .env local si existe
_env_file = os.path.join(current_dir, ".env")
if os.path.isfile(_env_file):
    with open(_env_file, "r", encoding="utf-8") as _f:
        for _line in _f:
            _line = _line.strip()
            if _line and not _line.startswith("#") and "=" in _line:
                _k, _v = _line.split("=", 1)
                os.environ.setdefault(_k.strip(), _v.strip())

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

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


@app.middleware("http")
async def require_internal_token(request, call_next):
    """Require the shared service token on every HTTP endpoint, including docs."""
    expected = os.getenv("GRAPHILEARN_INTERNAL_TOKEN", "")
    if not expected:
        return JSONResponse(
            status_code=503,
            content={"detail": "El servicio interno no está configurado."},
        )

    supplied = request.headers.get("X-Internal-Token", "")
    if not supplied or not hmac.compare_digest(supplied, expected):
        return JSONResponse(status_code=401, content={"detail": "No autorizado."})

    return await call_next(request)

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
        "mensaje": "Servicio interno disponible.",
    }
