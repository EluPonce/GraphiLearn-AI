# PUDS — Proceso Unificado de Desarrollo de Software

> **PRELIMINAR**: estructura general recibida; las reglas detalladas del docente para ERS/DDS y ejemplos aprobados aún deben confirmarse. No declararlo plantilla completa verificada.

## Fundamentos
PUDS: dirigido por casos de uso, centrado en arquitectura, iterativo e incremental.
Fases: Inicio → Elaboración → Construcción → Transición. Reuniones Técnicas Formales (RTF) e hitos al finalizar fases. En cada fase, ejecutar flujos de análisis, diseño, implementación, etc. según corresponda; Elaboración puede incluir código.

## MTGPS — marco de trabajo genérico
1. Comunicación (entrevistas, contexto, modelo de dominio/negocio).
2. Planeación (PAPS).
3. Modelado (análisis y diseño).
4. Construcción (implementación y pruebas).
5. Despliegue (entorno, capacitación, privacidad, licencias).

## Análisis → ERS
Propósito: especificaciones completas, detalladas y no ambiguas de QUÉ debe hacer el sistema. Roles típicos: Analista, Ingeniero en Casos de Uso, Arquitecto.
Actividades de captura: actores, casos de uso, detalle/estructura/prioridades, prototipos. Análisis de arquitectura, casos de uso, clases y paquetes. **No meter decisiones de implementación en la ERS.**

## Diseño → DDS
Propósito: describir CÓMO satisface el sistema los requisitos. Roles típicos: Diseñador, Arquitecto, Ingeniero de software.
- Arquitectura: **diagrama de despliegue** y **diagrama de paquetes organizado en capas** (Específica, General, Interna, Inferior/de Sistema).
- Datos: conceptual (diagrama de clases), lógico (mapeo), físico (tablas, volumen, scripts).
- Negocio: secuencia y actividad.
- Interfaces: prototipos.

## Coherencia con Scrum
Si se crean los mismos diagramas en Scrum y PUDS, reutilizar definiciones y mantener la consistencia; no fabricar arquitecturas diferentes.

## Checklist
- [ ] Advertir reglas aún preliminares al usuario cuando se pide un DDS/ERS detallado.
- [ ] ERS solo requisitos; DDS contiene decisiones de diseño.
- [ ] DDS con dos diagramas de arquitectura.
- [ ] Datos conceptual, lógico, físico.
