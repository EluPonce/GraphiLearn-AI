# 01 · Stack y estructura

Datos obtenidos el 2026-11-14 desde el repositorio local (rama `feature/crud-roles-evaluacion`, con cambios sin commit).

## 1. Versiones reales

### 1.1 Declaradas en archivos de dependencias

| Componente | Archivo | Restricción declarada |
|---|---|---|
| PHP | `GraphiLearn/composer.json` | `^8.2` |
| Laravel | `GraphiLearn/composer.json` | `laravel/framework ^12.0` |
| Laravel Sanctum | `GraphiLearn/composer.json` | `^4.0` |
| PHPUnit | `GraphiLearn/composer.json` (dev) | `^11.5.50` |
| React / React DOM | `GraphiLearn/package.json` | `^19.3.0` |
| Vite | `GraphiLearn/package.json` (dev) | `^7.0.7` |
| @vitejs/plugin-react | `GraphiLearn/package.json` (dev) | `^4.3.4` |
| Tailwind CSS | `GraphiLearn/package.json` (dev) | `^4.0.0` |
| axios | `GraphiLearn/package.json` (dev) | `^1.11.0` |
| lucide-react | `GraphiLearn/package.json` | `^1.47.0` |
| Python (imagen Docker) | `ai-service/Dockerfile` | `FROM python:3.12-slim` |
| FastAPI | `ai-service/requirements.txt` | `fastapi>=0.115.0` |
| Uvicorn | `ai-service/requirements.txt` | `uvicorn>=0.30.0` |
| OpenCV | `ai-service/requirements.txt` | `opencv-python>=4.10.0` |
| NumPy | `ai-service/requirements.txt` | `numpy>=1.26.0` |
| scikit-learn | `ai-service/requirements.txt` | `scikit-learn>=1.5.0` |
| SciPy | `ai-service/requirements.txt` | `scipy>=1.13.0` |
| pytest / httpx | `ai-service/requirements.txt` | `pytest>=8.0.0`, `httpx>=0.27.0` |
| PostgreSQL | docker-compose | NO ENCONTRADO (docker-compose no define servicio de base de datos) |
| Node | `package.json` | NO ENCONTRADO (no hay campo `engines`) |

### 1.2 Instaladas en la máquina de desarrollo

```
PHP 8.2.12 (cli) (built: Oct 24 2023 21:15:15) (ZTS Visual C++ 2019 x64)
Laravel Framework 12.69.2
v22.22.3            (node -v)
10.9.8              (npm -v)
Python 3.14.5
psql (PostgreSQL) 17.7
```

Versiones bloqueadas en `composer.lock`: `laravel/framework v12.69.2`, `laravel/sanctum v4.3.3`, `phpunit/phpunit 11.5.56`.

Versiones instaladas en `node_modules`:

```
react 19.3.0
react-dom 19.3.0
vite 7.3.6
tailwindcss 4.3.3
@vitejs/plugin-react 4.3.4
axios 1.20.0
lucide-react 1.47.0
laravel-vite-plugin 2.1.0
```

Versiones instaladas en el Python local (el que ejecuta pytest):

```
fastapi 0.141.1 opencv 5.0.0 sklearn 1.9.1 numpy 2.5.4 scipy 1.18.1 uvicorn 0.53.0
```

Servidor de base de datos real (`php artisan db:show`):

```
PostgreSQL .................................................................................................... 17.7
Connection ................................................................................................... pgsql
Database ............................................................................................... graphilearn
Port .......................................................................................................... 5432
Tables .......................................................................................................... 22
```

Nota: `php artisan db:show` termina con error porque falta la extensión PHP `intl` (`The "intl" PHP extension is required to use the [format] method.`). Los datos de arriba se imprimieron antes del error.

**Diferencias entre entornos:** Docker usa Python 3.12 y la máquina local usa Python 3.14.5. En local está instalado OpenCV 5.0.0, mientras que `requirements.txt` solo pide `>=4.10.0`. No hay versiones fijadas (`==`) en `requirements.txt`.

## 2. Árbol de carpetas (3 niveles)

Se excluyen `vendor/`, `node_modules/`, `.git/`, `__pycache__/` y `.pytest_cache/`.

```
Proyecto_Taller/
├── .agents/skills/{documentar-taller-grado, ingeniero-sw}
├── GraphiLearn/                    ← aplicación Laravel 12 + React 19 (Vite)
│   ├── GraphiLearn/storage/app/private/migration-safety   (carpeta anidada vacía, ver nota)
│   ├── app/{Exceptions, Http, Models, Policies, Providers, Services}
│   ├── bootstrap/cache
│   ├── config
│   ├── database/{factories, migrations, seeders}
│   ├── public/build
│   ├── resources/{css, js, views}
│   ├── routes/api
│   ├── storage/{app, framework, logs}
│   └── tests/{Feature, Unit}
├── ai-service/                     ← microservicio FastAPI + OpenCV + scikit-learn
│   ├── models
│   ├── routers
│   ├── schemas
│   ├── services
│   ├── tests
│   └── training
├── docs/{referencias, sprint-2, sprint-3}
└── docker-compose.yml
```

| Carpeta | Para qué sirve |
|---|---|
| `.agents/skills/` | Instrucciones para asistentes de IA (documentación y metodología). No es código de la aplicación. |
| `GraphiLearn/app/Http/Controllers/Api/V1` | Controladores de la API REST. |
| `GraphiLearn/app/Http/Middleware` | `CheckRole` (alias `role`) y `RoleMiddleware` (este último sin uso). |
| `GraphiLearn/app/Http/Requests` | Form Requests de validación. |
| `GraphiLearn/app/Http/Resources` | Transformadores JSON (API Resources). |
| `GraphiLearn/app/Models` | Modelos Eloquent. |
| `GraphiLearn/app/Policies` | Reglas de autorización por recurso. |
| `GraphiLearn/app/Services` | Lógica de negocio y cliente HTTP hacia FastAPI. |
| `GraphiLearn/app/Exceptions` | Excepciones del servicio de IA (no disponible, timeout, error). |
| `GraphiLearn/config` | Configuración de Laravel. `services.php` define `ai_service`. |
| `GraphiLearn/database/migrations` | 18 migraciones (ver `04_base_de_datos.md`). |
| `GraphiLearn/database/seeders` | `DatabaseSeeder` y `ExampleDataSeeder`. |
| `GraphiLearn/resources/js` | SPA React: `App.jsx`, `components/`, `views/`, `utils/`. |
| `GraphiLearn/resources/views` | Vista Blade `app` que monta la SPA. |
| `GraphiLearn/routes` | `api.php` incluye los archivos de `routes/api/v1/*.php`; `web.php` sirve la SPA. |
| `GraphiLearn/storage/app/private` | Disco `private`, donde se guardan las fotos (`graphilearn/fotos/...`) y copias de seguridad de migración (`migration-safety/`). Ignorado por git. |
| `GraphiLearn/tests` | Pruebas PHPUnit (Feature y Unit). |
| `ai-service/routers` | Endpoints FastAPI: `analysis.py` (`/api/analyze`) y `models.py` (`/api/models/*`). |
| `ai-service/services` | Pipeline: `preprocessing.py`, `skeletonization.py`, `features.py`, `indicators.py`, `classifier.py`. |
| `ai-service/schemas` | Esquemas Pydantic de la respuesta. |
| `ai-service/models` | `manifest.json` (vacío), artefacto `randomforest_v1.0-benchmark.joblib` y sus métricas. Los `.joblib` están ignorados por git. |
| `ai-service/training` | `train.py`: entrenamiento con datos sintéticos. |
| `ai-service/tests` | Pruebas pytest. |
| `docs/` | Documentación de los sprints, auditoría y PDF de referencia (Panel 1). |

Nota: `GraphiLearn/GraphiLearn/storage/app/private/migration-safety` es una carpeta anidada que solo contiene directorios vacíos y no está versionada. Parece haberse creado por error.

## 3. Servicios de docker-compose

Archivo: `docker-compose.yml` (sin commit, aparece como `??` en git status).

```yaml
services:
  ai-service:
    build:
      context: ./ai-service
    environment:
      GRAPHILEARN_INTERNAL_TOKEN: ${GRAPHILEARN_INTERNAL_TOKEN:?Set GRAPHILEARN_INTERNAL_TOKEN in the deployment environment}
    expose:
      - "8001"
    volumes:
      - ./ai-service/models:/app/models:ro
    networks:
      - graphilearn-internal
    restart: unless-stopped

networks:
  graphilearn-internal:
    internal: true
```

| Servicio | Imagen / build | Puertos | Redes | Volúmenes | Variables de entorno |
|---|---|---|---|---|---|
| `ai-service` | build `./ai-service` (Dockerfile `python:3.12-slim`, `uvicorn main:app --host 0.0.0.0 --port 8001`) | `expose: 8001` (solo interno, no publicado al host) | `graphilearn-internal` (`internal: true`) | `./ai-service/models` → `/app/models` (solo lectura) | `GRAPHILEARN_INTERNAL_TOKEN` (obligatoria) |
| Laravel | NO ENCONTRADO | — | — | — | — |
| PostgreSQL | NO ENCONTRADO | — | — | — | — |
| Frontend/Vite | NO ENCONTRADO | — | — | — | — |

**PARCIAL:** el compose solo levanta FastAPI. La red es `internal: true` y ningún otro servicio está en ella, así que Laravel no puede comunicarse con el contenedor si corre fuera de Docker. Faltan los servicios de Laravel y PostgreSQL.

## 4. Variables de entorno (solo nombres)

`GraphiLearn/.env.example`:

```
APP_NAME APP_ENV APP_KEY APP_DEBUG APP_URL APP_LOCALE APP_FALLBACK_LOCALE APP_FAKER_LOCALE
APP_MAINTENANCE_DRIVER BCRYPT_ROUNDS LOG_CHANNEL LOG_STACK LOG_DEPRECATIONS_CHANNEL LOG_LEVEL
DB_CONNECTION SESSION_DRIVER SESSION_LIFETIME SESSION_ENCRYPT SESSION_PATH SESSION_DOMAIN
BROADCAST_CONNECTION FILESYSTEM_DISK QUEUE_CONNECTION CACHE_STORE MEMCACHED_HOST REDIS_CLIENT
REDIS_HOST REDIS_PASSWORD REDIS_PORT MAIL_MAILER MAIL_SCHEME MAIL_HOST MAIL_PORT MAIL_USERNAME
MAIL_PASSWORD MAIL_FROM_ADDRESS MAIL_FROM_NAME AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY
AWS_DEFAULT_REGION AWS_BUCKET AWS_USE_PATH_STYLE_ENDPOINT VITE_APP_NAME SANCTUM_EXPIRATION
AI_SERVICE_URL AI_SERVICE_TIMEOUT AI_SERVICE_ROOT AI_SERVICE_TOKEN ANALISIS_HABILITADO ANALISIS_HABILITADO
```

(`ANALISIS_HABILITADO` aparece dos veces.)

`GraphiLearn/.env` (el local) agrega `DB_HOST DB_PORT DB_DATABASE DB_USERNAME DB_PASSWORD`. **No contiene** `AI_SERVICE_TOKEN` ni `ANALISIS_HABILITADO`.

`ai-service/.env.example`: `GRAPHILEARN_INTERNAL_TOKEN`. No existe `ai-service/.env`.
