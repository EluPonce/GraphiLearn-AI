# Sprint 2 — Revisión y Retrospectiva

## 3. Revisión de Sprint

### Revisión de Sprint — plantilla de Panel 1

**Nombre del proyecto y número de revisión:** GraphiLearn AI — Sprint 2.
**Objetivo de revisión:** inspeccionar el pipeline OpenCV, la extracción de características e indicadores, la integración opcional del clasificador, la persistencia del resultado y el manejo de versiones de modelo.
**Lugar, fecha y hora:** Pendiente de evidencia; no se encontró acta de Sprint Review.
**Participantes / roles:** Pendiente de evidencia; no se encontró lista de asistentes.
**Presentación del incremento:** Pendiente de evidencia de demostración a Product Owner/usuarios.
**Retroalimentación recibida:** Pendiente de evidencia.

La tabla siguiente registra una inspección técnica del repositorio y pruebas ejecutadas durante la preparación documental. No constituye constancia de una reunión Review ni de aceptación del incremento.

| Función inspeccionada | Evidencia observable | Retroalimentación de interesados |
|---|---|---|
| Procesamiento y preprocesamiento HU-07 | Código FastAPI/OpenCV y pruebas sintéticas pasadas. | Pendiente de acta/feedback. |
| Descriptores HU-08 | Funciones y esquema implementados; casos sintéticos pasados. | Pendiente. |
| Indicadores HU-09 | Cuatro campos cuantitativos implementados; comparaciones sintéticas pasan. | Pendiente. |
| Clasificador HU-10 | Fallback `no_disponible`; benchmark sintético. No es validación real. | Pendiente. |
| Registro HU-11 | Persistencia en feature tests con SQLite y FastAPI simulado. | Pendiente. |
| Versiones HU-16 | Rutas protegidas y pruebas de API; la llamada FastAPI en prueba se simula. | Pendiente. |

### Tareas completadas

La documentación **no marca HU como aceptadas/terminadas**: no se halló matriz de criterios aprobada ni acta de aceptación del Product Owner. A nivel técnico, el código implementa etapas de procesamiento, extracción, indicadores, persistencia y endpoints de versión; las pruebas ejecutadas se detallan en [pruebas.md](pruebas.md). La HU-10 queda parcial respecto a una aplicación de clasificación validada en el contexto real.

### Para lo que viene

- Acordar y registrar criterios de aceptación por HU, especialmente tolerancias de HU-08/HU-09 y definición de éxito de HU-10.
- Repetir integración con PostgreSQL y FastAPI en un entorno identificable.
- Resolver trazabilidad de la versión del modelo que efectivamente produjo una clasificación.
- Diseñar, aprobar y documentar el protocolo/dataset pertinente antes de presentar resultados de riesgo grafomotor.
- Completar acta, asistentes, feedback, tareas aceptadas y cambios del Product Backlog después de la Review real.

## 4. Retrospectiva de Sprint

### Retrospectiva de Sprint — plantilla de Panel 1

**Nombre del proyecto y número de retrospectiva:** GraphiLearn AI — Sprint 2.
**Objetivos de la retrospectiva:** Pendiente de evidencia del evento. Como guía de cierre: inspeccionar personas/interacciones, procesos, herramientas y Definition of Done, y acordar acciones para mejorar calidad/eficacia.
**Lugar, fecha y hora:** Pendiente de evidencia.
**Participantes:** Pendiente de evidencia.
**Acta / facilitador:** Pendiente de evidencia.

No se encontró un registro de la conversación retrospectiva. Para evitar atribuir opiniones al equipo, abajo se separan observaciones auditables del código de respuestas que solo el equipo puede confirmar.

| Pregunta | Evidencia que puede llevarse a la retrospectiva | Resultado del evento |
|---|---|---|
| ¿Qué salió bien? | Al corte, PHPUnit reportó 25 pruebas/82 aserciones y pytest 11 pruebas satisfactorias. Hay cobertura para pipeline sintético, errores del backend, persistencia simulada y control de rol de modelo. | Pendiente: confirmar qué considera valioso el equipo y registrar acuerdos. |
| ¿Qué no salió bien? ¿Qué problemas hubo y cómo se resolvieron? | Las pruebas del backend no conectan con FastAPI real ni PostgreSQL; no hay tests React localizados; faltan imágenes reales/protocolo de validación; se observó riesgo de discrepancia entre estado de versión Laravel y modelo cargado FastAPI. | Pendiente: el equipo debe confirmar si fueron impedimentos del Sprint, cómo se trataron y qué impacto tuvieron. |
| ¿Qué debemos cambiar para mejorar? | Acciones candidatas: añadir una prueba de contrato/integración entre procesos; incluir prueba PostgreSQL; definir DoD que distinga código, tests, integración y validación científica; persistir evidencia de Planning/Review/Retro; resolver atribución de versión realmente inferida. | Propuestas, no acuerdos retrospectivos. Responsable y fecha de seguimiento pendientes de decisión del equipo. |

Una vez realizada la reunión, completar esta sección con hechos, participantes y acciones acordadas; no sustituir las observaciones técnicas por declaraciones retrospectivas no verificadas.
