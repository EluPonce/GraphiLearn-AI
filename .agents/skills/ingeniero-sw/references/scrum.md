# Scrum

## Conceptos base

Artefactos: Product Backlog, Sprint Backlog, Incremento. Eventos/reuniones: Sprint Planning, Daily Scrum, Sprint Review, Sprint Retrospective.

## Eventos del Sprint (orden)

1. Sprint Planning
2. Sprint Backlog (resultado del planning)
3. Daily Scrum
4. Sprint Review
5. Sprint Retrospective

### ACTIVIDADES DE DEFINICION INICIAL (R-1) -Tabla de definiciones iniciales — Sprint 0

Sprint 0 se usa para preparar el proyecto antes de los Sprints de desarrollo. **No confundir con el Sprint 1.**

| Id | Tarea                                                                                                                                                                     |
| -- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| a) | Definir el equipo Scrum, multifuncional y auto gestionado                                                                                                                 |
| b) | Definir el objetivo del producto                                                                                                                                          |
| c) | Identificar los requerimientos iniciales                                                                                                                                  |
| d) | Definir tiempo de duración de Sprint (ideal el mismo tiempo para todos, 2 a 4 semanas)                                                                                    |
| e) | Definir infraestructura tecnológica (hardware y software) para la Gestión del proyecto (Jira, Azure DevOps, y otros) y también para el proceso de desarrollo del software |
| f) | Definir prácticas de ingeniería que identifiquen actividades técnicas de desarrollo que serán realizadas durante el sprint                                                |
| g) | Esbozar modelos iniciales de: Contexto, de Datos y de Arquitectura                                                                                                        |
| h) | Definición de criterios de calidad                                                                                                                                        |
| i) | Generar el Product Backlog (artefacto) la siguiente plantilla:                                                                                                            |

## Plantilla — Product Backlog

| Id   | Nombre corto del requerimiento | Descripción del requerimiento funcional (usando \<como>...\<quiero>...\<para>)    | Prioridad |
| ---- | ------------------------------ | --------------------------------------------------------------------------------- | --------- |
| Pb-1 | ej: Registrar de eventos       | Como organizador, quiero registrar eventos para realizar el seguimiento y control | Alta      |
| Pb-2 | ej: Retirar dinero de cuenta   | Como cliente quiero retirar dinero de mi cuenta para proceder a realizar pagos    | Baja      |

Incluir también: Proyecto, Product Owner, Versión, Fecha, en el encabezado.

## ACTIVIDADES A REALIZAR EN CADA SPRINT

## 1) Evento  Tareas para realizar el Sprint Planning  (R-2)

a)  El Product Owner (PO) propone cómo el producto podría aumentar su valor y utilidad en el Sprint actual explicando las Historias de Usuario (HU) candidatas a desarrollar durante la ejecución del Sprint (usar las 3C Card, Conversation, Confirmation)\
&#x20;Comentario: Aquí acontece la actividad de análisis esencial para comprender los requerimientos, por lo que si se ve conveniente y útil generar/actualizar el modelo de contexto (puede ser el diagrama general de casos de uso) para tener una vista más abstracta de lo que proporciona las Historias de Usuario Ver ejemplo en la siguiente plantilla:

## Plantilla — Historia de Usuario (HU)

| Campo                          | Contenido                                                                            |
| ------------------------------ | ------------------------------------------------------------------------------------ |
| Id                             |                                                                                      |
| Nombre corto de HU             |                                                                                      |
| Prioridad                      |                                                                                      |
| PHU                            |                                                                                      |
| Estado                         |                                                                                      |
| Como:                          | (actor)                                                                              |
| Quiero:                        | (funcionalidad)                                                                      |
| Para:                          | (beneficio)                                                                          |
| Criterios de aceptación        | Lista de condiciones que deben cumplirse para que la historia se considere terminada |
| Conversación/Reglas (opcional) |                                                                                      |
| Prototipo/Mockup (opcional)    |                                                                                      |
| Desarrollador                  |                                                                                      |

Formato narrativo de la HU: *"Como [actor], quiero [funcionalidad], para [beneficio]."*

b)  El equipo Scrum define objetivo del Sprint c)  Los desarrolladores estiman los Puntos de Historia de Usuario para cada HU para saber con cuanto se pueden comprometer a completar en el Sprint (usar Planning Poker) d)  Los desarrolladores seleccionan las HU a desarrollar en el presente Sprint e)  Los desarrolladores si ven conveniente en este evento describen la solución desde el punto de vita del diseño de lasa H.U. seleccionadas en términos de:\
&#x20; Diseño de la arquitectura de software  Actualizar el diseño de datos Los desarrolladores también podrían dejar estas descripciones de diseño para ser completadas y/o detalladas para cada H.U. seleccionada durante el siguiente evento que es la ejecución del Sprint (R3). f)  Generar el Sprint Backlog en la siguiente plantilla:

## Plantilla — Sprint Backlog

Encabezado: Objetivo del Sprint, Sprint número, Tiempo programado, Fecha de inicio, Fecha de finalización.

| Id   | Tarea                               | Estimación | Responsable | Estado     |
| ---- | ----------------------------------- | ---------- | ----------- | ---------- |
| Sp-1 | ej: Instalar y configurar framework | 4hrs       | (nombre)    | En proceso |
| Sp-2 | ej: Diseñar formulario de registro  | 2hrs       | (nombre)    | Por hacer  |
| Sp-3 | ej: Implementar API de registro     | 5hrs       | (nombre)    | Por hacer  |

## 2) Evento  Actividades a realizar durante la ejecución del  Sprint (R-3)

El propósito de la ejecución del Sprint es que el equipo de desarrollo trabaje en las tareas del Sprint Backlog para cumplir con el objetivo del Sprint y entregar un incremento de software potencialmente entregable. Durante esta fase, el equipo se enfoca en consolidar el diseño de la solución, la implementación, pruebas y refinar las funcionalidades comprometidas, asegurando que se cumpla con los criterios de calidad y esté listo para ser revisado en el Sprint Review.

## 2.a) Cada desarrollador selecciona desde el Sprint Backlog que tareas realizará

Ejemplo de tareas para el desarrollo en la iteración del Sprint para generar un incremento

## Diseñar la Historia de Usuario seleccionada:

Los desarrolladores continúan incrementando los modelos de diseño que corresponda según la H.U. en proceso enfocándose en lo necesario para cumplir objetivos, estoy incluye: a) Definir/Actualizar el diseño de la arquitectura de software (si corresponde) Modelos resultados sugeridos:\
&#x20; Opción 1: Modelos en UML: Diagrama de paquetes y Diagrama de despliegue  Opción 2: Modelos en C4: Niveles 1, 2 y 3 b) Definir/Actualizar el proceso de diseño de datos (si corresponde) Modelo resultado:\
&#x20; Modelo conceptual: Diagrama de clases en UML c) Diseñar reglas de la lógica de negocio (opcional) Modelo opcional resultado:\
&#x20;o Realizar estos modelos solo si es necesario y conveniente: Diagrama de secuencia y/o Diagrama de estados y/o Diagrama de tiempo d) Diseñar las interfaces de usuario\
&#x20;o Definir y seguir un patrón de interfaces definidas/ajustar si fuera necesario

## Implementar la Historia de  Usuario seleccionada

Los desarrolladores continúan incrementando las funcionalidades del software con la respectiva implementación de la H.U. en proceso, estas tareas dependerán del proceso de implementación que se haya definido según las características del proyecto. Las siguiente solo son un ejemplo:

a) Implementar Back-end (servicios APIs RESTful o GraphQL, otros) b) Implementar Fronte-end (WEB/MOVIL)\
&#x20;c) Generar consultas SQL o adoptar ORM para interactuar con la BD, Scripts de migración para actualizar el esquema de la BD d) Implementar operaciones CRUD, sistemas de autenticación, roles, permisos y otros  Trabajar sobre ramas individuales para facilitar colaboración, versionamiento e integración para poner en producción, usar repositorios de código (GitHub)  Seguir estándares de codificación

## Testear la Historia de Usuario seleccionada

Los desarrolladores deben asegurar de que la funcionalidad implementada este testeas de forma individual como también testear al integrarla al resto de las funcionalidades\
&#x20;a) Aplicar pruebas de unidad , caja negra y otras técnicas de prueba de acuerdo a la aplicación\
&#x20;b) Revisar criterios de aceptación definidos para cada Historia de usuario c) Considerar usar herramientas como: JUnit, Postman, JMeter, OWASP ZAP, Firebase Test Lab y otras

## 2.b) Generación del incremento y despliegue

A la finalización de la ejecución del sprint se debe generar el incremento (artefacto) correspondiente al sprint, integrando el incremento resultante a la anterior para asegurarse que funcionan correctamente juntos, tomar en cuenta consideraciones siguientes:  El incremento debe cumplir con el criterio de “Definition of Done” (DoD  Asegurarse de que todas las ramas de código estén integradas en la rama principal (main o master).  Asegurarse de que el código siga las mejores prácticas de estilo y estándares del equipo.  Preparar/monitorear el entorno de producción  Considerar usar Contenedores (docker), automatizar el despliegue, uso de pipelines CI/CD (integración continua/despliegue continuo). Ejem.  GitHub Actions, Jenkins, GitLab

## 3) Evento   Scrum Diario (Daily Scrum)

Durante la ejecución del Sprint (evento R-3), el equipo debería reunirse durante unos 15 minutos para sincronizan sus actividades cada día y crean plan para las siguientes 24 horas  Intervención de cada integrante del equipo para coordinación en base a:

- ¿Qué hice ayer para contribuir al Sprint?
- ¿Qué voy a hacer hoy para contribuir al Sprint?
- ¿Veo algún impedimento que impida lograr el objetivo del Sprint?\
  &#x20; Otras actividades opcionales sugeridas
- Actualizar el tablero tipo Kanban
- Actualizar gráfico de trabajo pendiente (Burndown charts)

## 4) Evento  Revisión de Sprint (R-4)

El propósito de la revisión del Sprint es inspeccionar el resultado del Sprint y determinar futuras adaptaciones. El equipo de Scrum presenta los resultados de su trabajo a las partes interesadas clave y se discute el progreso hacia el Objetivo de Producto. (Validación)  El Dueño de Producto explica qué elementos del Product Backlog se han terminado en cumplimiento con el objetivo definido para el sprint  Los Desarrolladores presenta el incremento para facilitar la retroalimentación  Recoger feedback de todos los invitados a la revisión\
&#x20; Actualizar el Product Backlog marcando con “done” lo concluido y entre todos colaborar para determinar qué podría ser lo siguiente a desarrollar.  Revisión de cuál podría ser el valor en el siguiente incremento, según los cambios del mercado. Resultado: Al finalizar el Sprint Review, el equipo Scrum tendrá un Product Backlog revisado y actualizado para el siguiente Sprint. A continuación la plantilla:

## Plantilla — Sprint Review

- Nombre del proyecto y número de revisión
- Objetivo de la revisión
- Lugar, fecha, hora
- Participantes: Nombre / Rol
- Presentación del incremento: Función presentada (elemento de trabajo a presentar) / Retroalimentación (preguntas y comentarios)
- Tareas completadas: marcar como "Terminado" los elementos que cumplieron criterios de aceptación; los que necesitan más trabajo, determinar si pasan al siguiente sprint o vuelven al Product Backlog
- Para lo que viene: elementos de acción para actualizar el Product Backlog y futuros sprints en relación al entorno del negocio

## 5) Evento  Retrospectiva de Sprint (R-5)

El propósito de la retrospectiva Sprint es planificar formas de aumentar la calidad y la eficacia para ello el Equipo Scrum se inspecciona a sí mismo, reflexionan sobre forma de trabajo para crear plan de mejoras para siguiente Sprint, inspeccionar cómo fue el Sprint en cuanto a personas, interacciones, procesos, herramientas y su definición de “done” (Verificación) ¿Qué ha fallado y qué se puede mejorar?  Recolectar información: Construir una imagen de lo que ha sido el Sprint, resultando una imagen conjunta de equipo  Generación de ideas: Identificar acciones que ayuden a mejorar el rendimiento del equipo durante el siguiente Sprint  Decidir qué hacer: Se proponen acciones que el equipo pueda implementar en el próximo Sprint  Ejemplo, de formato de retrospectiva sprint en la siguiente plantilla:

## Plantilla — Sprint Retrospective

- Nombre del proyecto y número de retrospectiva
- Objetivos de la retrospectiva
- Lugar, Fecha y hora
- Participantes
- Discusión:&#x20;
  - ¿Qué salió bien?
  - ¿Qué no salió bien? (qué problemas se encontraron y cómo fueron o no resueltos)
  - ¿Qué debemos cambiar para mejorar? (acciones de mejora concretas)

## Diseño de Arquitectura — los 2 diagramas exigidos

- **Diagrama de despliegue** (software - grupal): nodos de servidor frontend, backend, base de datos, dispositivos, mostrando protocolo de comunicación entre ellos (ej. HTTP).
- **Diagrama de paquetes organizado en capas**: Capa Específica → Capa General → Capa Interna → Capa Inferior/de Sistema, con dependencias entre paquetes de cada capa señaladas con flechas.

## Planning Poker (estimación de esfuerzo de HU)

Ver el detalle del método en `paps.md` §5.3 — se aplica igual aquí para estimar PHU de cada Historia de Usuario y definir capacidad del equipo por Sprint.

## Checklist antes de entregar documentación de Scrum

- &#x20;Sprint 0 no se confunde con Sprint 1 (es preparatorio)
- &#x20;Cada HU sigue el formato Como/Quiero/Para + criterios de aceptación
- &#x20;Sprint Backlog tiene estimación, responsable y estado por tarea
- &#x20;Diseño de arquitectura del sprint incluye AMBOS diagramas (despliegue + paquetes en capas)
- &#x20;Sprint Review distingue historias terminadas de no terminadas
- &#x20;Sprint Retrospective cubre las 3 preguntas (bien / mal / mejorar)