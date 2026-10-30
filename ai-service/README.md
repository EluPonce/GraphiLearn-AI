# GraphiLearn AI — Microservicio de Inferencia (FastAPI)

Este microservicio se encarga del procesamiento de imágenes de ejercicios grafomotores y la clasificación de riesgo para GraphiLearn AI. En esta etapa inicial actúa como un stub que define el contrato de comunicación con el backend de Laravel.

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

Para iniciar el servidor de desarrollo local:
```bash
uvicorn main:app --reload --port 8001
```

La documentación interactiva Swagger estará disponible en:
- `http://localhost:8001/docs`

## Endpoints

- **GET `/`**: Chequeo de estado del servicio.
- **POST `/predict`**: Recibe un archivo de imagen en formato `multipart/form-data` con el campo `file` y retorna:
  ```json
  {
    "risk_label": "bajo_riesgo",
    "risk_score": 0.12,
    "features": {
      "deviation": 0.0,
      "length": 0.0
    }
  }
  ```
