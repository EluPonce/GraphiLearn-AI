# Fase 1 — Seguridad, permisos y configuración

**Fecha de verificación:** 29 de octubre de 2026.
**Estado:** cambios implementados y pruebas ejecutadas; validación de despliegue pendiente.
**Trazabilidad académica:** esta fase técnica no se asigna a una HU nueva. Se conservan los IDs del Product Backlog vigente; la relación con una HU aprobada queda pendiente de confirmación.

## Estado previo confirmado

- Laravel, React y `ai-service/` continúan dentro de `MiProyecto/`. La carpeta hermana `Proyecto_Taller/` está vacía.
- No se encontró raíz Git ni en el proyecto ni en sus ancestros. No se movieron carpetas porque no es posible confirmar la preservación del historial.
- El registro público admitía rol `administrador`; el acceso administrativo a cursos y dashboard no estaba limitado correctamente por institución.
- La URL configurada para FastAPI era el puerto 8000, mientras el servicio documenta 8001. La resolución de modelos asumía que `ai-service/` vivía dentro de Laravel.
- Los tokens Bearer se guardaban en `localStorage` y no tenían vencimiento configurado.
- FastAPI permitía CORS desde cualquier origen.

## Cambios implementados

| Área | Cambio | Evidencia |
|---|---|---|
| Registro y autenticación | Autorregistro limitado a docentes; login y registro limitados a 5 solicitudes por minuto; tokens Sanctum con vencimiento configurable de 60 minutos. React guarda el token en `sessionStorage`. | `RegisterRequest`, `routes/api/v1/auth.php`, `config/sanctum.php`, `resources/js/App.jsx` |
| Ámbito de acceso | Regla común en `User` para autorizar curso y estudiante; `CoursePolicy` nueva y Policies de estudiante, actividad e imagen revisadas. Docentes quedan limitados a cursos asignados. | `app/Models/User.php`, `app/Policies/` |
| Aislamiento institucional | Cursos, estudiantes y dashboard administrativo filtran por la institución de la administradora. Una administradora sin institución no obtiene cursos ni estudiantes por estos ámbitos. | `CourseController`, `StudentController`, `DashboardController` |
| Privacidad administrativa | La administradora conserva acceso a listas de estudiantes y estadísticas agregadas; las Policies bloquean actividades, resultados individuales e imágenes privadas. El endpoint de análisis queda limitado a docentes. | `ActividadPolicy`, `ImagenPolicy`, `routes/api/v1/analysis.php`, `PhaseOneSecurityTest` |
| FastAPI | URL predeterminada y `.env` local usan puerto 8001. `AI_SERVICE_ROOT` permite apuntar al servicio en la ubicación actual o a la futura carpeta hermana. | `config/services.php`, `FastApiClient`, `.env`, `.env.example` |
| Artefactos de modelos | Las rutas deben resolverse dentro de la raíz configurada; se rechazan escapes mediante `..`. Laravel envía a FastAPI la ruta relativa al servicio. | `ModelVersionController`, `PhaseOneSecurityTest` |
| Acceso desde navegador | CORS de FastAPI ya no permite orígenes de navegador. React continúa usando únicamente endpoints Laravel. Esto no sustituye el aislamiento de red del despliegue. | `ai-service/main.py` |

No se añadieron tablas, no se ejecutaron migraciones y no se modificó el pipeline de procesamiento. La revisión mantiene los estados actuales `pendiente`, `aprobada` y `rechazada`; los estados `confirmado` y `corregido`, el autor y fecha de revisión y las observaciones siguen pendientes para la fase funcional correspondiente.

## Pruebas y validación ejecutadas

- **PHPUnit:** 30 pruebas y 100 aserciones aprobadas. Incluye registro administrativo rechazado, aislamiento multiinstitución, acceso docente a estudiantes, privacidad de imagen y rechazo de rutas de modelo fuera del servicio.
- **pytest:** 11 pruebas aprobadas; 2 advertencias deprecadas en dependencias Starlette/AnyIO/httpx.
- **Vite:** build de producción completado con 1.959 módulos transformados. La salida se generó en una carpeta temporal para no sobrescribir `public/build/`.
- PHPUnit usa SQLite en memoria según `phpunit.xml`; no valida PostgreSQL. Las pruebas Laravel existentes simulan HTTP de FastAPI; no se ejecutó integración real entre procesos.
- No se encontró una suite React ni una prueba automatizada de viewport responsive. El build comprueba compilación, no usabilidad móvil.

Las pruebas no validan login contra un servidor desplegado, expiración temporal real del token, CORS desde un navegador ni operación con FastAPI/PostgreSQL independientes.

## Pendientes y decisiones

1. Localizar o restaurar la raíz Git antes de mover archivos. La estructura física requerida sigue pendiente; `.agents/skills/` también permanece bajo `MiProyecto/`.
2. Al mover Laravel a `GraphiLearn/`, establecer `AI_SERVICE_ROOT=../ai-service` y `AI_SERVICE_URL` según la red del entorno. `.env.example` ya muestra la raíz hermana prevista.
3. Decidir el mecanismo de distribución de modelos entre procesos separados; una ruta configurada no comparte archivos entre hosts.
4. Evaluar autenticación SPA con cookie HttpOnly. `sessionStorage` reduce persistencia entre sesiones, pero JavaScript todavía puede leer el token durante la sesión.
5. Implementar administración de docentes/cursos, conexión de pantallas React, revisión y observaciones, historial, estadísticas de curso y evolución individual en fases posteriores.
6. Validar PostgreSQL, red privada de FastAPI, retención de datos infantiles y controles de auditoría antes de producción.

## Archivos principales modificados

`app/Models/User.php`; Policies de curso, estudiante, actividad e imagen; controladores de curso, estudiante, dashboard y versión del modelo; `RegisterRequest`; `ActividadService`; `FastApiClient`; rutas de autenticación/análisis; configuración Sanctum y servicios; `resources/js/App.jsx`; `ai-service/main.py`; `.env` y `.env.example`; pruebas Feature.

