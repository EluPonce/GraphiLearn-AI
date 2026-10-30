Estoy construyendo GraphiLearn AI, un sistema de detección temprana de riesgo
grafomotor en niños de nivel inicial. Analiza fotos de ejercicios grafomotores
(líneas, círculos, espirales, zigzag) mediante un modelo de IA, y da seguimiento
cuantitativo del progreso de cada estudiante en el tiempo.

ARQUITECTURA (fija, no la cambies sin que yo lo pida):
- Backend principal: Laravel 11 (PHP), API REST, patrón MVC, autenticación con
  Laravel Sanctum.
- Microservicio de IA: Python + FastAPI, separado del backend principal, expone
  un único endpoint de inferencia (recibe imagen, devuelve clasificación de riesgo
  + características geométricas). Laravel lo consume vía HTTP interno.
- Base de datos: PostgreSQL.
- Frontend web: React (más adelante).
- App móvil: Flutter (más adelante).

ACTORES DEL SISTEMA:
- Docente (actor principal): captura ejercicios, ve resultados, historial y alertas.
- Padre/Madre de familia: captura ejercicios en casa, ve reporte de progreso de su hijo.
- Administrador/Director: gestiona usuarios, ve panel institucional agregado.

ENTIDADES PRINCIPALES DEL DOMINIO:
- Institution (unidad educativa)
- Course (curso, pertenece a una institución, tiene un docente)
- Student (estudiante, pertenece a un curso, puede tener un padre/tutor vinculado)
- Exercise (tipo de ejercicio grafomotor: línea, círculo, espiral, zigzag, etc.)
- Evaluation (una evaluación = una foto de un ejercicio de un estudiante, con su
  resultado de clasificación una vez procesada)
- Alert (alerta generada cuando un estudiante muestra estancamiento o retroceso)

REGLAS DE ARQUITECTURA QUE DEBES RESPETAR SIEMPRE:
1. Laravel: usa Controllers delgados, la lógica de negocio va en Service classes
   (app/Services), no en los controllers ni en los modelos.
2. Usa Form Requests para validar cada input, nunca valides dentro del controller.
3. Usa API Resources para dar forma a las respuestas JSON, nunca devuelvas modelos
   Eloquent directo.
4. Cada módulo (auth, students, evaluations, alerts) debe tener su propia carpeta
   de rutas y quedar agrupado bajo /api/v1/.
5. El microservicio Python (FastAPI) es independiente: no debe compartir base de
   datos con Laravel. Laravel le pasa la imagen, el microservicio responde JSON
   con el resultado, y Laravel es quien lo persiste.
6. Todo el código, comentarios y nombres de variables en español para el dominio
   (Student → puede quedar en inglés como es convención de Laravel, pero comentarios
   explicando reglas de negocio en español).
7. No implementes autenticación de padres/administradores con lógica distinta a la
   de docentes: es un único sistema de roles (campo `role` en users + Policies),
   no tablas separadas por tipo de usuario.

Este proyecto se está construyendo por etapas (te iré dando un prompt por cada
etapa). Cada etapa debe dejar el código funcionando y testeable antes de pasar
a la siguiente. No adelantes funcionalidad de etapas futuras a menos que te lo pida.