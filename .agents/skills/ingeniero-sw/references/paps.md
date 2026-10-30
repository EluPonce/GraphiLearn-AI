# PAPS — Plan de Administración de Proyecto de Software

## Índice (mantener numeración y orden)
1. Introducción
2. Descripción del Problema
3. Métricas
   3.1 Métricas Indirectas
   3.2 Métricas Directas
4. Definiciones para la Estimación del Software
   4.1 Dimensiones del Proyecto
   4.1.1 Tamaño
   4.1.2 Complejidad para el Equipo
   4.1.3 Estructuración del Cliente
   4.2 Ámbito del Proyecto
   4.2.1 Objetivo
   4.2.1.1 Objetivo General
   4.2.1.2 Objetivo Específico
   4.2.2 Requerimientos
   4.2.3 Rendimiento
   4.2.4 Fiabilidad
   4.2.5 Restricciones
   4.2.6 Interfaces Externas
5. Medidas de Estimación
   5.1 Valor Esperado
   5.2 COCOMO II
   5.3 Planning Poker
   5.4 Ecuación del Software
6. Análisis de Riesgo
7. Planificación del Tiempo
   7.1 Diagrama de Gantt
8. Tabla de Recursos
9. Organización Interna
10. Mecanismo de Seguimiento de Control

## 3. Métricas
**Indirectas antes que Directas.** Indirectas = MOF (función): entradas, salidas, peticiones, archivos, interfaces externas. Directas = MOT (tamaño): KLDC, costo, tiempo, número de personas, personas-mes, páginas de documentación, errores, defectos. Seleccionar indicadores aplicables; no forzar tokens ni métricas no usadas.

## 4. Definiciones
Dimensiones: Tamaño según funcionalidades; Complejidad para el equipo según capacidad; Estructuración del cliente según conocimiento, organización y disponibilidad de información.

Objetivo general y específicos: reutilizar los mismos del Perfil, no redefinir. Ámbito: requisitos, rendimiento en tiempo de respuesta, fiabilidad, restricciones (legales, técnicas, recursos), interfaces externas reales.

## 5. Medidas de estimación
Cada método: definición, parámetros, fórmula/procedimiento, aplicación numérica con **datos reales del proyecto**, resultado. No fabricar datos.

**Valor Esperado:** `VE = (O + 4*M + P)/6` donde O optimista, M más probable y P pesimista. Aplicaciones posibles: KLDC, tiempo y costo, con escenarios sustentados.

**COCOMO II (puntos de objeto):** complejidad de pantallas, reportes y componentes 3GL, cálculo de puntos de objeto y productividad (experiencia/capacidad del desarrollador y madurez/capacidad del entorno). Criterios de esfuerzo y tiempo.

**Planning Poker:** definir HU pivote pequeña/conocida y puntaje Fibonacci, comparar otras HU, estimación por consenso, discutir divergencias y establecer capacidad PHU por Sprint. Documentar si la estimación fue individual, no fingir consenso de equipo.

**Ecuación del Software (Pressman, 1988):** `E = [ (LDC * B^0.333) / P ]^3 * (1/t^4)`; E esfuerzo (personas-año), LDC tamaño, P productividad, B destreza, t tiempo. Definir unidades y supuestos.

## 6. Riesgos
Tipos: técnicos, de gestión y de negocio. Categorías: activos y proactivos (según guía). Para proactivos: identificar, estimar probabilidad, medir impacto, elaborar plan de aversión que reduzca probabilidad/impacto. La guía menciona «cinco puntos», aunque enumera cuatro: **señalar esa inconsistencia y pedir criterio antes de inventar un quinto**.
Probabilidad basada en 1) estadísticas/hechos de proyectos anteriores, 2) comparación actual/anterior, 3) experiencia del gestor.

## 7. Planificación
Elegir Scrum/PUDS/predictivo y sus actividades; asignar duración respaldada. Referencia dada: análisis+diseño 50–60 %, implementación 20–25 %, pruebas 25–30 %. Para PUDS: Inicio 10 %, Elaboración 30 %, Construcción 50–65 %, Transición 10 %; son rangos orientativos, comprobar consistencia antes de aplicar.
Gantt basado en tareas y fechas reales.

## 8. Recursos
Categorías: Hardware, Software, Gente, Infraestructura, Logística.
Columnas obligatorias: `Recurso | Fecha Inicio | Fecha Fin | Cantidad | Precio Unit. $us | % Depreciación | Precio Unitario Neto | Costo Total`.
Precio unitario neto = precio unitario × (1 – % depreciación). Gente típicamente 0 % depreciación. No completar precios sin fuente.

## 9. Organización interna
Socialización del PAPS; bitácoras de avance y problemas; RTF (reuniones técnicas formales), herramientas Jira/Trello si se usan. Formas de equipo: DD descentralizada democrática; DC descentralizada controlada; CC centralizada controlada. No atribuir reuniones inexistentes.

## 10. Control
RTF para revisar avances y ajustar; DF diseñar formularios para registrar avances; reportes de finalizadas/en proceso/errores.

## Control de calidad
- [ ] Métricas indirectas preceden directas.
- [ ] Cada estimación desarrolla fórmula, datos y cálculo justificable.
- [ ] Riesgos, fuentes de probabilidad y plan de aversión.
- [ ] Recursos con columnas exactas y categorías.
- [ ] Gantt y distribución temporal coherentes.
