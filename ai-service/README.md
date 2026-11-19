# GraphiLearn AI — Microservicio de Inferencia (FastAPI)

Este microservicio procesa imágenes y calcula características geométricas. Si hay un modelo experimental cargado que predice una de las clases `S`, `ED` o `NA`, devuelve esa sugerencia; de lo contrario devuelve `sugerencia: null`. La docente conserva siempre la valoración final. El modelo es experimental.

## Requisitos
- Python 3.10 o superior

## Instalación

1. Crear y activar un entorno virtual (recomendado):
   ```bash
   # En Windows:
   python -m venv venv
   .\venv\Scripts\activate
   ```

2. Instalar dependencias:
   ```bash
   pip install -r requirements.txt
   ```

## Ejecución

FastAPI requiere el token compartido `GRAPHILEARN_INTERNAL_TOKEN` en todas las rutas HTTP, incluidos estado, raíz y documentación. Laravel debe tener el mismo secreto en `AI_SERVICE_TOKEN`. No guardar secretos en Git.

PowerShell (terminal de desarrollo local):
```bash
$env:GRAPHILEARN_INTERNAL_TOKEN = "<secreto-local>"
uvicorn main:app --host 127.0.0.1 --port 8001
```

En `GraphiLearn/.env` configurar `AI_SERVICE_TOKEN` con ese mismo secreto y `AI_SERVICE_URL=http://127.0.0.1:8001`. Para llamadas manuales, enviar `X-Internal-Token: <secreto-local>`.

### Docker

Desde la raíz del repositorio, `docker-compose.yml` ejecuta FastAPI sin publicar puertos al host (`expose` solo dentro de la red Docker `graphilearn-internal`, que es interna). Compose exige `GRAPHILEARN_INTERNAL_TOKEN` como variable del entorno de despliegue. Laravel debe ejecutarse en un contenedor conectado a esa misma red y configurar `AI_SERVICE_URL=http://ai-service:8001`; actualmente el repositorio no contiene imagen/servicio Compose para Laravel.

```powershell
$env:GRAPHILEARN_INTERNAL_TOKEN = "<secreto-de-desarrollo>"
docker compose up --build -d ai-service
```

No se incluye un modelo cargable por defecto. El manifiesto `models/manifest.json` inicia vacío. Para permitir una carga, agregar un ID de versión como clave y registrar solo el nombre del archivo dentro de `models/` junto con su SHA-256 verificado:

```json
{
  "models": {
    "version-id": {
      "filename": "version-id.joblib",
      "sha256": "<64 caracteres hexadecimales>"
    }
  }
}
```

El archivo debe ser confiable y aprobado; joblib puede ejecutar código al deserializar. La API recibe `model_id`, nunca una ruta. El volumen Docker de modelos es de solo lectura.

Swagger, OpenAPI y los endpoints de estado también requieren el header interno; en Docker solo son accesibles desde la red interna.

## Contrato

El endpoint de análisis es `POST /api/analyze`. Todos los endpoints requieren `X-Internal-Token`. El clasificador solo expone `sugerencia` con `S`, `ED`, `NA` o `null`; las etiquetas heredadas del benchmark no se convierten en valoraciones.
