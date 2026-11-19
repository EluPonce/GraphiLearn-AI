# 08 · Seguridad y privacidad

## 1. Medidas implementadas

| Medida | Estado | Evidencia |
|---|---|---|
| **Autenticación por token** | IMPLEMENTADO | Laravel Sanctum (tokens Bearer). `config/sanctum.php`: `'expiration' => env('SANCTUM_EXPIRATION', 60)`; `.env` local: `SANCTUM_EXPIRATION=60` (minutos). Todas las rutas, salvo login y registro, usan `auth:sanctum` |
| Contraseñas con hash | IMPLEMENTADO | `User::casts()` → `'password' => 'hashed'` (bcrypt); `$hidden = ['password', 'remember_token']` |
| Límite de intentos de login | IMPLEMENTADO | `throttle:5,1` (5 intentos por minuto) en `auth/login` y `auth/register` (`routes/api/v1/auth.php`) |
| Registro público deshabilitado | IMPLEMENTADO | `AuthController@register` siempre devuelve 403. Prueba: `test_public_registration_cannot_create_an_administrator` |
| Cuentas desactivadas bloqueadas | IMPLEMENTADO | `AuthController@login` rechaza `active === false`; `CheckRole` responde 403 si `active === false` |
| Logout revoca el token | IMPLEMENTADO | `currentAccessToken()->delete()`. Prueba: `test_logout_revokes_token` |
| Control de acceso por rol y alcance | IMPLEMENTADO | Middleware `role:` + Policies + `User::puedeAccederAlCurso` (ver `02_roles_y_permisos.md`). Pruebas en `PhaseOneSecurityTest` y `EvaluationApiTest` |
| **Token interno de FastAPI** | IMPLEMENTADO | `ai-service/main.py::require_internal_token`: todas las rutas exigen `X-Internal-Token`, comparado con `hmac.compare_digest` contra `GRAPHILEARN_INTERNAL_TOKEN`; si la variable falta responde 503 y si el token falla, 401. Laravel lo envía desde `AI_SERVICE_TOKEN` y se niega a llamar si no está configurado. Pruebas: `test_all_endpoints_reject_missing_internal_token`, `test_root_requires_internal_token...` |
| **Red interna** | PARCIAL | `docker-compose.yml`: red `graphilearn-internal` con `internal: true` y `expose: 8001` (sin `ports`). Laravel no está en el compose, así que en local FastAPI se usa vía `AI_SERVICE_URL` sin aislamiento de red |
| CORS de FastAPI | IMPLEMENTADO | `allow_origins=[]`, `allow_credentials=False` |
| **Almacenamiento privado de fotos** | IMPLEMENTADO | Disco `private` (`storage/app/private`, `visibility: private`). Ruta `graphilearn/fotos/{id_foto}/{uuid}.{jpg/png}`: el nombre original no se usa. La carpeta está en `.gitignore` (`**/storage/app/private/**`). La ruta `storage/{path}` que registra Laravel para el disco `local` (misma carpeta) exige **URL firmada** (`ServeFile::hasValidSignature`), y la aplicación no genera ninguna |
| **Acceso a fotos por Policy** | PARCIAL | Subir y valorar: `FotoEjercicioPolicy::update`. Etapas: `FotoEjercicioPolicy::view`. Descarga (`/imagenes/{id}/download`): **no usa la Policy**, sino el filtro de consulta `visiblePhotos()` (estudiantes de `cursosAccesibles()`); el efecto es equivalente |
| Foto no reemplazable tras valorar | IMPLEMENTADO | 409 si `estado === 'valorado'` (verificado en `03_api.md` §3.8) |
| **Validación de archivos** | PARCIAL | Laravel: `mimes:jpg,jpeg,png`, `max:5120` KB y comprobación del MIME real (`getMimeType()` ∈ {image/jpeg, image/png}). FastAPI: content-type `image/*`, ≤ 10 MB, decodificable con OpenCV, al menos 20×20 px. **No** se valida la resolución mínima en el flujo nuevo (`ImageValidationService` existe, pero no se usa) |
| Carga segura de modelos | IMPLEMENTADO | Manifiesto + SHA-256 + nombre simple + carpeta fija; Laravel verifica que la ruta no salga de `AI_SERVICE_ROOT` (ver `07_pipeline_y_modelo.md` §5). Pruebas: `test_model_load_*`, `test_model_version_path_cannot_escape_ai_service_root` |
| Token del navegador | IMPLEMENTADO | El SPA guarda el token en `sessionStorage` (se borra al cerrar la pestaña), no en `localStorage` |
| Trazabilidad de valoraciones | PARCIAL | `fotos_ejercicio.valorado_por` y `valorado_en`; `observaciones.autor`. Si se cambia una valoración se sobrescribe sin guardar historial: `activity_evaluation_history` ya no se escribe |
| **Registro de accesos** | **NO ENCONTRADO** | No hay auditoría de quién vio o descargó una foto o una ficha. El único `report()`/`logger()` del flujo es para errores de FastAPI (`EvaluationFlowController@upload`) y un `logger()->info` en la migración |

## 2. Lo que debería tener y NO tiene

1. **Registro de auditoría de accesos** a fotos, fichas e informes de menores (quién, cuándo, qué).
2. **Historial de cambios de valoración y observación.** Hoy la valoración se sobrescribe sin historial.
3. **Consentimiento informado y base legal** para fotografiar trabajos de menores: no hay tabla, campo ni pantalla de consentimiento.
4. **Política de retención y borrado** de fotos: no hay borrado programado ni en cascada de los archivos físicos. Las FK `ON DELETE CASCADE` borran las filas, pero no los archivos del disco.
5. **Cifrado en reposo** de las fotos: se guardan como JPG/PNG sin cifrar.
6. **Ocultar datos personales en las respuestas:** `PUT .../valoracion` devuelve el objeto completo del usuario que valora (incluido su `correo`) y la ficha devuelve `fecha_nacimiento`, aunque no haga falta.
7. **`APP_DEBUG=true`** en el `.env` local: las respuestas de error incluyen la traza de pila (se vio al capturar los ejemplos). Hay que desactivarlo en cualquier despliegue.
8. **Validación de resolución y calidad** (nitidez, iluminación) antes de analizar.
9. **Escaneo o validación de contenido de la imagen** más allá del MIME y la decodificación.
10. **Endurecimiento de `joblib.load`:** deserializar con pickle sigue siendo un riesgo si alguien con acceso de escritura a `models/` y al manifiesto registra un artefacto malicioso.
11. **Rotación del token interno:** existe un solo secreto compartido y no hay mecanismo de rotación.
12. **CHECK de roles en la base:** `users.rol` acepta cualquier texto.
13. **HTTPS y cabeceras de seguridad:** no hay configuración de despliegue en el repositorio (NO ENCONTRADO).

## 3. Archivos sensibles en la máquina de desarrollo (no versionados)

En `GraphiLearn/storage/app/private/migration-safety/` hay volcados `.dump` de la base de datos y un archivo `demo-teacher-credentials.json`. No se abrieron. Todos están cubiertos por `.gitignore`, verificado con:

```
GraphiLearn/storage/app/private/.gitignore:1:*	GraphiLearn/storage/app/private/migration-safety/demo-teacher-credentials.json
GraphiLearn/.gitignore:3:.env	GraphiLearn/.env
.gitignore:28:**/*.joblib	ai-service/models/randomforest_v1.0-benchmark.joblib
```

Hay que tener cuidado al comprimir o compartir la carpeta del proyecto, porque estos archivos sí se incluyen en un `.rar` o `.zip` de la carpeta completa.

Además, `database/seeders/ExampleDataSeeder.php` imprime por consola una contraseña de desarrollo común a las tres cuentas de ejemplo (el valor no se reproduce aquí).
