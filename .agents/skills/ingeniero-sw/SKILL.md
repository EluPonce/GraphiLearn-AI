---
name: ingeniero-sw
description: Metodología académica de Martínez Canedo para documentar y revisar Perfil, PAPS, Scrum y PUDS en proyectos de Ingeniería de Software y Taller de Grado. Aplicar cuando se pida documentar sprints, historias de usuario, backlogs, revisiones, pruebas, capítulos metodológicos, arquitectura, perfil o PAPS.
---

# Metodología Ingeniero SW (Martínez Canedo)

Esta habilidad sirve para producir documentación académica **fiel al proyecto real**. Mantener índices, nombres, plantillas y orden del docente, y justificar cualquier apartado con evidencia.

## Enrutador: leer solo la referencia necesaria

| Solicitud | Referencia |
|---|---|
| Perfil, problemática, objetivos, alcance, antecedentes, tecnología | `references/perfil.md` |
| PAPS, estimaciones, métricas, riesgos, recursos, Gantt | `references/paps.md` |
| Scrum, Sprint 0 o N, HU, planning, backlog, review, retrospective, pruebas | `references/scrum.md` |
| PUDS, análisis, diseño, ERS, DDS, arquitectura | `references/puds.md` |

Si solicitan el proyecto completo, leer las cuatro referencias y organizar por Perfil, PAPS y Scrum/PUDS. Si solicitan Capítulos II y III, usar las fuentes y bibliografía reales aportadas; estas referencias metodológicas no reemplazan la investigación bibliográfica.

## Reglas generales

- **Adaptación:** mantener los índices y plantillas académicos, pero utilizar solo funcionalidades, tecnologías, decisiones y artefactos pertinentes al proyecto. Nunca rellenar por inventiva.
- **Profundidad:** desarrollar los apartados, no solo enumerarlos; incluir fórmulas aplicadas, tablas, explicación, evidencia y diagramas cuando correspondan.
- **Terminología:** en el Alcance del Perfil decir «funcionalidades principales» o «líneas funcionales», no «módulos» ni «épicas». Distinguir objetivos del proyecto de requisitos/alcance del software.
- **Fuente de verdad:** primero documentos del docente y documento vigente del usuario para la estructura; para avance técnico, consultar archivos, código, migraciones, pruebas y salidas de ejecución reales. Si discrepan, reportar la discrepancia; no reemplazar silenciosamente una versión por otra.
- **No inventar:** métricas, resultados de pruebas, tiempos, reuniones, firmas, porcentajes, datos de menores, permisos, diagramas implementados o estados «terminado». Marcar «Pendiente de evidencia» cuando falte soporte.
- **Trazabilidad:** por cada HU mencionar los archivos, endpoints, pruebas o commits que soportan el estado documentado.
- **Seguridad:** nunca publicar fotografías, datos personales de niños, secretos `.env` ni información sensible en el documento de ejemplo.

## Aplicación concreta a GraphiLearn AI

- Revisar Laravel, React, FastAPI, OpenCV, scikit-learn, PostgreSQL y la documentación en `docs/` antes de describir el avance.
- Distinguir implementación técnica del pipeline, pruebas funcionales y **validación científica** del clasificador. El Random Forest `benchmark` entrenado con datos sintéticos no acredita detección de riesgo grafomotor en niños reales.
- Mantener «bajo riesgo», «riesgo potencial» y revisión humana en la descripción del sistema. No hacer afirmaciones diagnósticas.
- Respetar las HU y numeración del Product Backlog del documento oficial. Si hay diferencias en prompts o código, generar tabla de divergencias y solicitar decisión antes de renumerar.
- No modificar código para una solicitud exclusivamente documental; no agregar comentarios de «realizado» si no hay pruebas verificadas.
- La documentación técnica generada para Sprint 2 se guarda en `docs/sprint-2/`; incluir archivos de evidencia y una lista de faltantes. No sobrescribir capítulos ni versiones del documento principal sin autorización.

## Flujo de trabajo al documentar

1. Determinar si el encargo es Perfil, PAPS, Scrum o PUDS; leer la referencia correspondiente.
2. Leer el documento académico vigente facilitado por el usuario y su alcance.
3. Revisar el repositorio real y las pruebas pertinentes. Si no se pueden ejecutar, indicarlo.
4. Hacer matriz: HU → criterio de aceptación → evidencia → estado confirmado → pendiente.
5. Redactar según la plantilla exacta. Separar resultados observados de propuestas y estimaciones.
6. Guardar borradores en `docs/` en Markdown e incluir rutas de fuentes y evidencias.
7. Informar archivos creados, secciones incompletas, inconsistencias y lo que requiere validación del usuario.

## Documentar actualizaciones futuras

Al recibir una nueva funcionalidad o reporte: contrastarlo con archivos y pruebas, actualizar únicamente secciones afectadas, agregar fecha y resumen de cambios en `docs/bitacora-documentacion.md`, conservar pendientes y no convertir afirmaciones de terceros en hechos sin verificarlas. No trabajar en segundo plano: cada actualización requiere una nueva petición o ejecución explícita.
