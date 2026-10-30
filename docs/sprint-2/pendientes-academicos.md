# Sprint 2 — Pendientes académicos y divergencias

## Diferencias entre Product Backlog, Sprint 1 y código

| Tema | Evidencia encontrada | Tratamiento en este expediente | Pendiente de resolución |
|---|---|---|---|
| Correspondencia de filas HU en Product Backlog | La extracción de texto del PDF muestra títulos, descripciones e IDs en celdas/tablas desplazadas o combinadas; varias filas no se pueden atribuir inequívocamente solo con texto extraído. | Se mantienen exactamente los IDs solicitados (HU-07 a HU-11 y HU-16) y los nombres breves que aparecen asociados en el backlog/código: Procesar imagen, Extraer características, Generar indicadores, Clasificar resultado, Registrar resultado, Gestionar versión del modelo. No se renumera. | Confirmar con el PDF editable/original legible la fila exacta, prioridad y texto final de cada HU; especialmente descripción de HU-16. |
| Historia de HU-07–HU-10 | `ai-service/routers/analysis.py` etiqueta el endpoint como “HU-07 a HU-10”; training clasifica el script como HU-10. El Product Backlog lista etapas de análisis en secuencia, pero el texto tabular extraído no basta para fijar criterios formales. | La correspondencia de análisis se documenta como la solicitada y respaldada por comentarios/casos del código, no como transcripción certificada de un acta. | Validar la descomposición del Product Backlog con Product Owner y preservar su versión aprobada. |
| HU-11 y HU-16 | Pruebas Laravel identifican explícitamente registro/revisión del resultado como HU-11 y gestión de versiones de modelo como HU-16; las rutas `model_versions.php` llevan comentario HU-16. | Se conserva la numeración del repositorio y del encargo. | Confirmar que las pruebas siguen la numeración aprobada del Product Backlog. |
| Sprint 1 frente a PB | Sprint 1 contiene HU-03/04/05 y Sprint Backlog con HU-06 “Analizar imagen”; el PDF registra también metas futuras HU-07 a HU-11. La tabla general no tiene celdas perfectamente recuperables con la extracción disponible. | No se corrige retrospectivamente el documento oficial. La traza técnica se hace a rutas, servicios, migraciones y pruebas, además del ID solicitado. | Contrastar con fuente editable y decidir si se mantiene historial de IDs o si existe una versión posterior del Product Backlog. |
| Tecnología planificada frente a código vigente | `Prompt Panel1.md` propone Laravel 11; `composer.json` y dependencias instaladas declaran Laravel 12, Sanctum 4, React 19; el proyecto incorpora FastAPI/OpenCV y un pipeline más avanzado que el esqueleto inicial. | Se documenta la tecnología presente en código real (Laravel 12, FastAPI, OpenCV, Random Forest/scikit-learn, PostgreSQL configurado, React 19). | Actualizar especificación/arquitectura oficial mediante revisión aprobada, sin reescribir el historial de Sprint 1. |
| Versión asociada a resultado | `AnalysisService` puede asignar la versión activa desde Laravel en la rama donde la respuesta no trae un modelo disponible; la activación también depende de llamada HTTP cuyo resultado no siempre gobierna el estado Laravel. | El diseño muestra asociación opcional, pero no afirma siempre que represente el modelo que generó una salida. | Definir una condición verificable para “modelo efectivamente aplicado” y resolver/documentar la sincronización antes de usar trazabilidad académica. |
| Activar/desactivar versión en microservicio | `ModelVersionController::activate()` llama a `cargarModeloEnFastApi()` pero no comprueba su booleano antes de marcar activa la fila en Laravel. `deactivate()` cambia la base Laravel sin invocar `/api/models/unload`. | La prueba existente simula la respuesta positiva de carga; no comprueba esos fallos de sincronización. | Acordar y verificar comportamiento consistente de activar/desactivar y lectura de estado real de FastAPI. |

## Información necesaria para cerrar académicamente el Sprint 2

1. Acta de Sprint Planning con fecha/hora, asistentes y roles, duración/capacidad del Sprint, objetivo aprobado, historias seleccionadas y decisiones de diseño.
2. Product Backlog editable/aprobado que confirme nombre, prioridad, actor, descripción, reglas y criterios de aceptación para HU-07 a HU-11 y HU-16.
3. PHU/Planning Poker, horas/tareas originales, responsable y cambios/estados del Sprint Backlog; no se deducen de código o pruebas.
4. Definition of Done y evidencia de integración/entrega del incremento; ambiente/versiones de PostgreSQL y despliegue que se deben validar.
5. Evidencia de integración Laravel–FastAPI real y de migraciones/operaciones en PostgreSQL; revisión de la UI React conectada y pruebas de aceptación del usuario.
6. Acta de Sprint Review: fecha, asistentes, funciones demostradas, feedback, HU aceptadas/no aceptadas, acciones y actualización del Product Backlog.
7. Acta de Retrospective: fecha, participantes, qué salió bien/mal, impedimentos y acciones acordadas con responsables/seguimiento.
8. Para HU-10, conjunto de datos pertinente y autorizado, población/criterios, procedencia, etiquetas de referencia, protocolo con división por estudiante, evaluación independiente, limitaciones y revisión experta. El benchmark sintético y sus métricas no cubren este requisito.
9. Resolución documentada sobre la semántica de etiqueta/score y la revisión humana, sin presentar resultados como diagnóstico.

## Evidencia técnica ejecutada y límites

- PHPUnit: 25 pruebas/82 aserciones satisfactorias en SQLite en memoria.
- pytest FastAPI: 11 pruebas satisfactorias con imágenes sintéticas.
- Laravel fakea respuestas HTTP a FastAPI en las pruebas de backend; no se probó el transporte real.
- No se encontró una suite automatizada de React en el árbol revisado.
- La configuración de PostgreSQL en el proyecto no demuestra que el servicio estuviera disponible ni que las migraciones se hayan aplicado a él.
- No se ejecutó ni afirmó validación del clasificador con trazos reales de niñas o niños. El JSON `randomforest_v1.0-benchmark_metrics.json` describe un benchmark sintético y sus métricas no son evidencia de riesgo grafomotor real.

**Estado de cierre académico:** Pendiente. El repositorio respalda avance técnico y pruebas automatizadas limitadas, pero faltan acuerdos de Scrum, aceptación, integración del entorno destino y validación científica aplicable.
