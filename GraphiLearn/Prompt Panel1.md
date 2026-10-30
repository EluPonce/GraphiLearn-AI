Usando el contexto del proyecto GraphiLearn AI ya definido, quiero que generes
el ESQUELETO INICIAL del backend. Esta etapa NO incluye lógica de negocio de
captura de imágenes ni clasificación — solo la base estructural.

ALCANCE DE ESTA ETAPA (no hagas más que esto):

1. Proyecto Laravel 11 nuevo, configurado para API REST (sin vistas Blade),
   con Laravel Sanctum instalado para autenticación por token.

2. Migraciones de base de datos (PostgreSQL) para estas tablas:

   - users
     id, name, email (unique), password, role (enum: 'docente','padre','administrador'),
     timestamps

   - institutions
     id, name, address (nullable), timestamps

   - courses
     id, institution_id (FK), name, teacher_id (FK a users, nullable),
     timestamps

   - students
     id, course_id (FK), guardian_id (FK a users, nullable — el padre vinculado),
     full_name, birth_date, timestamps

   - exercises
     id, name (ej. "Línea recta", "Círculo", "Espiral"), type (enum: 'linea',
     'circulo','espiral','zigzag','otro'), reference_image_path (nullable),
     timestamps

   - evaluations
     id, student_id (FK), exercise_id (FK), captured_by (FK a users),
     image_path, status (enum: 'pendiente','procesado','error'),
     risk_label (enum: 'bajo_riesgo','riesgo_potencial', nullable hasta que se
     procese), risk_score (decimal, nullable), geometric_features (json, nullable),
     timestamps

   - alerts
     id, student_id (FK), evaluation_id (FK), status (enum: 'pendiente','revisada'),
     message (text), timestamps

3. Modelos Eloquent para cada tabla, con sus relaciones correctamente definidas
   (hasMany / belongsTo según corresponda). No agregues lógica de negocio a los
   modelos, solo relaciones, fillable/casts, y scopes básicos si aplica.

4. Autenticación con Sanctum:
   - POST /api/v1/auth/register (solo para docentes y administradores; los padres
     se crean vinculados a un estudiante, no se auto-registran — déjalo como TODO
     con un comentario, no lo implementes aún)
   - POST /api/v1/auth/login
   - POST /api/v1/auth/logout
   - GET /api/v1/auth/me

5. Roles y permisos: implementa un Middleware simple `role:docente`,
   `role:administrador`, etc. basado en el campo `role` del usuario, y aplícalo
   de ejemplo en una ruta protegida GET /api/v1/students que solo el docente y
   el administrador puedan ver.

6. Seeders con datos de prueba: 1 institución, 1 curso, 1 docente, 3 estudiantes,
   los 4 tipos de ejercicio (línea, círculo, espiral, zigzag).

7. Estructura de carpetas esperada:
   app/
     Http/Controllers/Api/V1/
     Http/Requests/
     Http/Resources/
     Models/
     Services/        (vacía por ahora, solo con un .gitkeep — la usaremos en
                        la siguiente etapa)
   routes/api.php agrupando todo bajo prefix('v1')

8. Además, crea un proyecto FastAPI separado en una carpeta /ai-service en la
   raíz del repo (fuera de Laravel), con:
   - main.py con un único endpoint POST /predict que reciba una imagen y devuelva
     un JSON de ejemplo hardcodeado: {"risk_label": "bajo_riesgo", "risk_score": 0.12,
     "features": {"deviation": 0.0, "length": 0.0}} — sin modelo real todavía,
     es solo el contrato de API que usaremos en la siguiente etapa.
   - requirements.txt con fastapi, uvicorn, python-multipart.
   - README corto explicando cómo correrlo (uvicorn main:app --reload).

No implementes todavía: captura real de imágenes desde el cliente, llamada de
Laravel al microservicio de IA, ni lógica de alertas. Eso va en el Panel 2.

Al terminar, dame un resumen de los endpoints creados y cómo correr el proyecto
localmente (Laravel + PostgreSQL + FastAPI).