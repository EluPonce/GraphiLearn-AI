# GraphiLearn AI — Sprint 2

## Alcance y criterio de evidencia

Este expediente documenta Sprint 2 conforme a la referencia Scrum del skill `ingeniero-sw` y al orden/plantillas del Sprint 1 de `docs/referencias/Panel_1_Taller.pdf`: Sprint Planning, objetivo, HU, contexto, Sprint Backlog, diseño, ejecución, pruebas, revisión y retrospectiva.

**Corte de revisión del repositorio y ejecución de pruebas:** 29 de octubre de 2026. Esta fecha es la de esta verificación documental, no una fecha atribuida al Sprint.

Se usan estos estados:

- **Implementado (I):** existe código en el repositorio que realiza total o parcialmente la función.
- **Probado (P):** existe una prueba y se ejecutó en este corte; se indica el entorno y sus límites.
- **Pendiente (PE):** falta evidencia, funcionalidad o validación para cerrar el criterio. La presencia de código o de una prueba simulada no convierte por sí sola una HU en terminada.

El Random Forest versionado es un benchmark entrenado con datos sintéticos. Sus métricas no son validación de riesgo grafomotor real, no deben interpretarse como precisión en niños y no respaldan una conclusión clínica. La clasificación disponible debe tratarse como orientativa y sujeta a revisión humana; el sistema no diagnostica.

## Archivos

| Archivo | Contenido |
|---|---|
| [planning-y-backlog.md](planning-y-backlog.md) | Planning reconstruido con límites de evidencia, objetivo, HU-07 a HU-11 y HU-16, contexto y Sprint Backlog. |
| [diseno.md](diseno.md) | Arquitectura en capas, despliegue lógico, datos, mapeo y secuencias. |
| [pruebas.md](pruebas.md) | Plan, ejecución observada, resultados y límites de cobertura. |
| [review-y-retrospectiva.md](review-y-retrospectiva.md) | Plantillas de revisión y retrospectiva con hechos documentados separados de pendientes. |
| [pendientes-academicos.md](pendientes-academicos.md) | Diferencias entre Product Backlog/código y evidencias requeridas para el cierre académico. |
| [fase-1-seguridad.md](fase-1-seguridad.md) | Correcciones de seguridad, permisos y configuración, con pruebas ejecutadas y pendientes. |

## Fuentes locales consultadas

- Plantilla y Product Backlog: `docs/referencias/Panel_1_Taller.pdf`.
- Metodología: `.agents/skills/ingeniero-sw/SKILL.md` y `.agents/skills/ingeniero-sw/references/scrum.md`.
- Aplicación: `routes/api/v1/`, `app/Http/Controllers/Api/V1/`, `app/Services/`, `app/Models/`, `database/migrations/` y `resources/js/`.
- Servicio de análisis: `ai-service/main.py`, `ai-service/routers/`, `ai-service/services/`, `ai-service/training/train.py`, `ai-service/models/` y `ai-service/tests/test_ai_service.py`.
- Pruebas Laravel: `tests/Feature/GraphiLearnSprint2BackendTest.php` y `tests/Feature/GraphiLearnInitialBackendTest.php`.

Los artefactos describen el estado del repositorio al corte indicado; no acreditan por sí solos fechas de trabajo, acuerdos de Scrum, aceptación de interesados, despliegue productivo ni validación de campo.
