# Sprint 3 — Revisión y Retrospectiva

## 3. Revisión de Sprint (Sprint Review)

### Ficha de Revisión del Sprint 3 — Plantilla Oficial Martínez Canedo

**Nombre del proyecto y número de revisión:** GraphiLearn AI — Sprint 3  
**Objetivo de la revisión:** Demostrar y validar el incremento funcional correspondiente a la gestión de actividades programadas multiejercicio, la captura y almacenamiento privado de fotografías, la integración segura con el microservicio de IA, la emisión de valoraciones pedagógicas manuales (S / ED / NA) con trazabilidad inmutable y las vistas de seguimiento y evolución temporal del estudiante.  
**Lugar, fecha y hora:** Sala de Grado / Entorno Virtual, 16 de noviembre de 2026.  
**Participantes:**  
* Ponce Yepez Elizabet Luzia — Product Owner / Scrum Master / Desarrollador  

---

### Presentación del Incremento

A continuación se resume la retroalimentación técnica y pedagógica obtenida tras la inspección de las funcionalidades presentadas:

| Función Presentada | Evidencia Comprobada en el Sistema | Retroalimentación y Conclusiones |
|---|---|---|
| **Programación Multiejercicio (HU-04)** | Migraciones en PostgreSQL (`scheduled_activities` y `scheduled_activity_exercises`). Creación de programaciones con lista ordenada de ejercicios. Prevención de duplicados mediante índice único. | **Aprobado.** Resuelve la necesidad real del aula, permitiendo evaluar varios ejercicios (línea, círculo, espiral, zigzag) en una misma fecha o trimestre sin colisiones en la base de datos. |
| **Aislamiento Estricto de Roles (Seguridad)** | Políticas de Laravel (`canAccessCourse`, `puedeAccederAlCurso`). Pruebas unitarias de denegación cruzada en `EvaluationApiTest`. | **Aprobado.** La administradora mantiene el control sobre usuarios y catálogo sin ver fotos íntimas de menores; la docente solo gestiona sus cursos asignados. |
| **Carga de Evidencia Fotográfica (HU-05 / HU-04)** | `ImageUploadService` y `ImageValidationService`. Almacenamiento seguro en `storage/app/private/` con nombres UUID. Validación de formatos JPG/PNG y resolución mínima de 640×480. | **Aprobado.** Se garantiza la privacidad de las fotografías de niños. Si el microservicio de IA no está disponible, la foto se guarda igualmente y la docente puede calificar manualmente sin interrupciones. |
| **Extracción de Métricas con IA (HU-12)** | Comunicación HTTP autenticada con token compartido (`X-Internal-Token`) hacia FastAPI. Cálculo de características geométricas y 4 indicadores heurísticos. | **Aprobado.** El microservicio procesa en memoria en menos de 0.2 segundos. Los resultados cuantitativos se almacenan en `analysis_results` acompañados de la advertencia no diagnóstica. |
| **Valoración Pedagógica Manual (HU-15)** | Endpoint `PUT /api/v1/actividades/{id}/evaluacion` que persiste notas cualitativas en la escala oficial de educación inicial: **S** (Superado), **ED** (En Desarrollo) y **NA** (No Alcanzado), más texto de observaciones. | **Aprobado.** Se respeta plenamente el principio *Human-in-the-Loop*. La calificación es una decisión exclusivamente humana de la docente y no una imposición algorítmica. |
| **Historial Inmutable de Auditoría (HU-15, HU-17)** | Tabla `activity_evaluation_history` y modelo `Observacion`. Cada edición guarda el snapshot del valor anterior, la fecha y el usuario que realizó el cambio. | **Aprobado.** Proporciona trazabilidad completa para auditoría pedagógica ante reclamos de padres o revisiones de dirección. |
| **Ficha de Seguimiento y Evolución (HU-13, HU-14)** | Vistas React `StudentProgressView.jsx` y `StudentReportsView.jsx`. Agrupación por tipo de ejercicio a lo largo de los trimestres. | **Aprobado.** Permite observar la evolución longitudinal de los trazos de cada niño de forma visual y cuantitativa. |

---

### Tareas Completadas en el Sprint 3

Se da por completado el conjunto de historias planificadas:
* **HU-04:** Registrar actividad y programación multiejercicio.
* **HU-12:** Consultar resultado del análisis computacional.
* **HU-13:** Consultar historial de actividades del estudiante.
* **HU-14:** Visualizar evolución del estudiante por periodos/trimestres.
* **HU-15:** Registrar observaciones y valoración pedagógica (S / ED / NA).
* **HU-17:** Consultar trazabilidad completa y auditoría de cambios.
* **Seguridad:** Aislamiento de instituciones, cursos y protección de tokens internos.

---

### Para lo que viene (Hacia la Defensa Final)

1. Consolidar el documento final empastado integrando el Perfil (Capítulo I), Marco Teórico y Tecnológico (Capítulo II) y el proceso de software Scrum con los Sprints 0, 1, 2 y 3 (Capítulo III).
2. Ensayar el guion de demostración en vivo (5 minutos de recorrido: Administradora $\rightarrow$ Docente $\rightarrow$ Foto de trazo $\rightarrow$ Métricas OpenCV $\rightarrow$ Valoración S/ED/NA $\rightarrow$ Historial).
3. Mantener el blindaje conceptual ante el tribunal respecto a que el sistema es una herramienta de apoyo pedagógico (*Human-in-the-Loop*) y no un software de diagnóstico clínico autónomo.

---

## 4. Retrospectiva de Sprint (Sprint Retrospective)

### Ficha de Retrospectiva del Sprint 3 — Plantilla Oficial Martínez Canedo

**Nombre del proyecto y número de retrospectiva:** GraphiLearn AI — Sprint 3  
**Objetivos de la retrospectiva:** Evaluar la efectividad del trabajo en equipo, la gestión del tiempo, los impedimentos técnicos encontrados durante la integración de microservicios y definir acuerdos de mejora para la fase final del proyecto.  
**Lugar, fecha y hora:** Entorno de Desarrollo, 16 de noviembre de 2026.  
**Participantes:**  
* Ponce Yepez Elizabet Luzia — Desarrollador / Scrum Master / Product Owner  

---

### Discusión Retrospectiva

| Pregunta Guía | Análisis y Evidencia Observable | Conclusiones y Acuerdos |
|---|---|---|
| **¿Qué salió bien?** | - Se logró la integración completa entre Laravel 12, React 19, FastAPI y PostgreSQL 17.<br/>- La suite de pruebas de Laravel alcanzó **38/38 pruebas pasadas (203 aserciones)** y FastAPI **20/20 pruebas pasadas**.<br/>- Se resolvió la estructuración pedagógica de las actividades permitiendo múltiples ejercicios por evaluación.<br/>- Se implementó un esquema de seguridad robusto que aísla los roles y protege las fotos de menores.<br/>- La compilación con Vite (`npm run build`) procesó 1.970 módulos sin ningún error. | La arquitectura desacoplada demostró ser acertada y permitió desarrollar y probar el servicio de visión por computadora independientemente del backend relacional. |
| **¿Qué no salió bien? ¿Qué problemas se encontraron y cómo fueron resueltos?** | - Se presentó un desfase en la comunicación local entre Laravel y FastAPI debido a que el middleware de seguridad requería un token (`GRAPHILEARN_INTERNAL_TOKEN`) que no estaba sincronizado en los archivos `.env`.<br/>- Existía una migración pendiente en PostgreSQL (`add_exercise_to_observaciones`) que requería aplicarse para asociar observaciones por ejercicio.<br/>- La tentación inicial de intentar automatizar el diagnóstico mediante el modelo de ML representaba un riesgo ético y académico. | - **Solución técnica:** Se estandarizó el token secreto compartido en ambos entornos (`.env`) y se aplicó la migración pendiente, logrando respuesta HTTP 200 inmediata.<br/>- **Solución metodológica:** Se delimitó formalmente el rol de la IA a la extracción de descriptores objetivos, manteniendo la calificación cualitativa (S/ED/NA) bajo control humano docente. |
| **¿Qué debemos cambiar para mejorar?** | - Mantener siempre alineados los archivos de configuración (`.env.example` y `.env`) para evitar problemas de conexión al desplegar.<br/>- Unificar toda la documentación dispersa de los Sprints en un único documento maestro para la entrega final de Taller de Grado.<br/>- Practicar una demo fluida sin depender de conexiones a internet externas, apoyándose en la base de datos PostgreSQL local. | - Configurar scripts de arranque sencillos para la demo final.<br/>- Completar la redacción formal de los tres capítulos de acuerdo con las normas de formato y carátula de la UAGRM. |

---

### Conclusión General del Sprint 3

El Sprint 3 concluye con éxito, entregando un incremento de software plenamente funcional, seguro y testeado. El sistema GraphiLearn AI se encuentra listo tanto en código como en base de datos para su presentación en el panel de defensa de Taller de Grado.
