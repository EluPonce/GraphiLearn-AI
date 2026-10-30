---
name: documentar-taller-grado
description: Documenta el desarrollo de GraphiLearn AI con Scrum a partir de evidencia del repositorio. Úsalo para documentar Sprints, arquitectura, datos, UML, pipeline de imágenes o información técnica para los capítulos II y III.
---

# Documentar Taller de Grado — GraphiLearn AI

Documenta el desarrollo académico de GraphiLearn AI en español formal y claro. El sistema busca detectar tempranamente riesgo grafomotor en niños de nivel inicial. El contexto tecnológico declarado es Laravel 12, React 19, un microservicio Python con FastAPI y OpenCV, scikit-learn con Random Forest, PostgreSQL y metodología Scrum. Trata estos datos como contexto, no como prueba de que cada componente o versión esté efectivamente configurado: contrástalos con el repositorio.

## Reglas de evidencia y alcance

- Antes de redactar, inspecciona el código fuente vigente, configuración, migraciones, rutas, componentes y servicios relevantes. Busca también pruebas automatizadas, documentación existente y artefactos de modelos cuando apliquen.
- Basa cada afirmación sobre comportamiento en evidencia concreta. Cita rutas relativas a la raíz del repositorio y, si resulta útil, clases, métodos, endpoints o pruebas específicas. Distingue observación estática de resultado de ejecución.
- No inventes funcionalidades, historias, decisiones, resultados de pruebas ni métricas de ML. La existencia de una prueba no demuestra que se haya ejecutado ni que pase; informa su estado de ejecución solo si hay evidencia de una ejecución reciente y pertinente.
- Clasifica cada funcionalidad relevante como **implementada**, **probada** (aclara si solo existe prueba o si fue ejecutada y aprobada), **pendiente** o **experimental**. Una funcionalidad puede estar implementada sin estar probada. Explica brevemente las evidencias que justifican cada estado.
- Si una afirmación de documentación previa no coincide con el código actual, prioriza el código y registra la discrepancia con sus fuentes. No copies afirmaciones previas sin volver a verificarlas.
- Si falta evidencia, no completes el vacío por inferencia: marca la sección o dato como **Pendiente de evidencia** y especifica qué falta.
- No uses datos sintéticos para afirmar validez clínica o educativa. Identifica claramente su origen, propósito y límites. Las métricas de datos sintéticos describen solo ese experimento y no el rendimiento esperado en población real.
- Si la solicitud es exclusivamente documental, no cambies código, configuración, pruebas, Product Backlog ni artefactos del sistema. Guarda los documentos nuevos o las modificaciones documentales solicitadas dentro de `docs/`; conserva el Product Backlog original.
- Documenta decisiones técnicas solo cuando estén respaldadas por código, historial o documentación verificable. Si se desconoce el motivo, describe la decisión observable y marca la justificación como pendiente; no atribuyas racionales al equipo.

## Flujo de trabajo

1. Delimita el Sprint, subsistema o pregunta solicitada. Revisa las instrucciones locales aplicables (por ejemplo, `AGENTS.md`) y el árbol de archivos sin modificar nada.
2. Inspecciona la implementación relevante y sigue el flujo entre frontend, backend, microservicio, persistencia y modelo, según corresponda. No infieras integración solo porque dos componentes existan.
3. Localiza y lee las pruebas automatizadas relacionadas. Resume qué verifican y qué dejan fuera. Ejecútalas únicamente si el usuario lo solicita; nunca presentes pruebas existentes como ejecutadas sin haberlas corrido.
4. Contrasta el estado con documentación previa y registra inconsistencias. Identifica historias de usuario solo si están documentadas o se pueden rastrear inequívocamente a criterios y flujos implementados. No conviertas capacidades supuestas en historias completadas.
5. Redacta el documento solicitado con estados explícitos, evidencias próximas a las afirmaciones y vacíos marcados. Para una solicitud de Sprint, usa la estructura siguiente.
6. Guarda el resultado en una ubicación descriptiva dentro de `docs/` (por ejemplo, `docs/sprint-N/`). Revisa el documento final para detectar afirmaciones no respaldadas, resultados inventados o cambios fuera del alcance documental.

## Documento de Sprint

Usa estos encabezados y en este orden, adaptando el contenido al alcance y a la evidencia disponible:

1. Sprint Planning
2. Objetivos del Sprint
3. Historias de Usuario
4. Contexto del Sistema
5. Sprint Backlog
6. Diseño de la Arquitectura
7. Diagrama de Despliegue
8. Diagrama de Paquetes
9. Diseño de Datos
10. Diagrama de Clases
11. Mapeo
12. Lógica de Negocio
13. Diagramas de Secuencia
14. Plan de Pruebas
15. Reporte de Pruebas
16. Revisión del Sprint
17. Retrospectiva del Sprint

Busca primero el documento fuente del Sprint 1 y respeta su formato, convenciones y nivel de detalle si está disponible. Si no se encuentra en el repositorio, indícalo brevemente en la documentación; sigue los encabezados y el orden especificados por el usuario sin afirmar que se reprodujo un formato fuente inexistente. No inventes fechas, estimaciones, responsables, acuerdos, resultados de revisión ni retrospectivas. Marca esos datos como pendientes cuando no haya evidencia.

Separa el **Plan de Pruebas** (casos y cobertura previstos, basados en requisitos) del **Reporte de Pruebas** (comandos ejecutados, entorno, fecha, resultado y salidas observadas). Si no se ejecutaron pruebas, indícalo explícitamente. En el backlog del Sprint registra solo elementos respaldados por evidencia; no cambies el Product Backlog original.

## Arquitectura, modelos, UML y mapeo

Cuando se soliciten, describe los componentes y sus responsabilidades a partir del código/configuración observados, así como las relaciones y límites entre procesos. Para modelos de datos, contrasta migraciones, claves, restricciones, modelos ORM y uso efectivo. Para UML (despliegue, paquetes, clases, secuencia u otros), genera diagramas —preferiblemente Mermaid en Markdown cuando resulte legible— solo con elementos y relaciones verificables. Etiqueta elementos inferidos como pendientes o exclúyelos. El **Mapeo** debe explicar la correspondencia entre historias/requisitos, módulos, datos y pruebas cuando esas relaciones se puedan demostrar; si no, registra la trazabilidad faltante.

## Pipeline de procesamiento de imágenes y ML

Al documentar el pipeline, sigue la entrada desde su recepción hasta la respuesta y persistencia, citando la implementación de cada etapa. Describe solo lo que el código confirma, incluyendo cuando exista:

- formato, validaciones y decodificación de imagen;
- limpieza, escala de grises, umbralización, componentes y esqueleto;
- algoritmos empleados y parámetros observables;
- características geométricas extraídas;
- indicadores y cómo se calculan frente al patrón esperado;
- variables, orden, preprocesamiento y clasificador de ML;
- etiquetas, score, comportamiento ante modelo ausente y persistencia del resultado;
- pruebas para cada etapa y los casos que no cubren.

No atribuyas significado clínico a características o indicadores solo por sus nombres. Describe el cálculo implementado y separa cualquier interpretación como no validada. Para Random Forest entrenado con datos sintéticos, informa el mecanismo de generación, partición y artefactos únicamente si se verificaron; explica que las métricas se limitan a esos datos, que el modelo puede aprender las reglas artificiales y que no sustentan validez clínica, educativa ni generalización a dibujos reales. No reproduzcas métricas sin leer la fuente y aclarar su alcance.

## Insumos para capítulos II y III

Cuando se solicite preparar material reutilizable para esos capítulos, organiza hallazgos técnicos con sus evidencias y su estado de verificación. Puedes estructurarlos en antecedentes del sistema actual, arquitectura y tecnologías, análisis de requisitos, diseño, modelo de datos, procesos/algoritmos, pruebas y limitaciones, según lo que se pida. No presentes esa organización como estructura oficial de la institución si no se proporcionó dicha guía. Distingue hechos implementados de propuestas de diseño, resultados observados de resultados no ejecutados y limitaciones conocidas de aspectos aún no evaluados.
