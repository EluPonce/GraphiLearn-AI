# 02 · Roles y permisos

## 1. Roles existentes

| Rol (valor de `users.rol`) | Dónde se define | Usuarios en la base de desarrollo |
|---|---|---|
| `docente` | `app/Models/User.php` (`esDocente()`) | 5 |
| `direccion` | `app/Models/User.php` (`esDireccion()`); habilitado en BD por `2026_11_02_000001_allow_direccion_role.php` | 1 |
| `administrador` | `app/Models/User.php` (`esAdministrador()`) | 2 |

Conteo obtenido con:

```
      rol      | count
---------------+-------
 docente       |     5
 administrador |     2
 direccion     |     1
```

La columna `users.rol` es `varchar(50)` con valor por defecto `'docente'` y **no tiene CHECK**. La migración `allow_direccion_role` eliminó la restricción `users_rol_check`, así que la base acepta cualquier texto como rol.

## 2. Cómo se aplica la autorización (tres capas)

1. **Middleware de ruta `role:`.** Alias de `App\Http\Middleware\CheckRole` registrado en `bootstrap/app.php`. Responde 401 si no hay usuario, 403 si `active === false` y 403 si el rol no está en la lista.
2. **Policies** registradas en `app/Providers/AppServiceProvider.php` con `Gate::policy(...)`.
3. **Regla central de alcance** en `app/Models/User.php`:
   - `puedeAccederAlCurso()`: un usuario de `direccion` accede a los cursos de su `institution_id`. Un `docente` accede solo a los cursos donde `courses.id_docente = users.id`. El `administrador` no accede a ningún curso.
   - `cursosAccesibles()`: la misma regla como consulta; para `administrador` devuelve `whereRaw('1 = 0')`.
   - `puedeAccederAlEstudiante()`: delega en el curso del estudiante.

`App\Http\Middleware\RoleMiddleware` existe, pero no está registrado ni se usa.

## 3. Matriz rol × acción

V = ver, C = crear, E = editar, Val = valorar (S/ED/NA). "Propio" significa los cursos asignados al docente. "Institución" significa los cursos de la institución del usuario.

| Recurso / acción | docente | direccion | administrador | Regla y archivo |
|---|---|---|---|---|
| Iniciar sesión | Sí (si `active`) | Sí (si `active`) | Sí (si `active`) | `AuthController@login` rechaza `active === false` |
| Registro público | No (403 para todos) | No | No | `AuthController@register` siempre devuelve 403 |
| V lista "Mis cursos" con progreso (`GET /api/cursos`) | Sí, propios | **No (403)** | No | `routes/api/v1/evaluaciones.php` `role:docente` + `EvaluationFlowController@courses` `abort_unless(esDocente)` |
| V lista de cursos (`GET /api/v1/cursos`) | Sí, propios | Sí, institución | No | `routes/api/v1/courses.php` `role:docente,direccion`; `CoursePolicy::viewAny` |
| V detalle de curso (`/cursos/{course}`) | Sí, propio | Sí, institución | No | `CoursePolicy::view` → `puedeAccederAlCurso` |
| C/E/eliminar curso | No | No | No | `CoursePolicy::create/update/delete` = `false`; no existen rutas |
| V estudiantes (lista y detalle) | Sí, propios | Sí, institución | No | `StudentPolicy::viewAny/view`; `StudentController@index` filtra por `cursosAccesibles()` |
| C/E/eliminar/restaurar estudiante | No | No | No | `StudentPolicy` devuelve `false`; no existen rutas |
| V ejercicios | Sí, solo activos | Sí; en la lista ve también inactivos | No | `ExercisePolicy::viewAny/view`; `ExerciseController@index` filtra `activo` solo para docente |
| C/E/desactivar ejercicio | No | No | No | `ExercisePolicy::create/update/delete` = `false`; no existen rutas |
| C evaluación (curso + trimestre) | Sí, curso propio y activo | No (403 de ruta) | No (403) | Ruta `role:docente`; `StoreEvaluacionRequest::authorize` (docente); `EvaluacionPolicy::create`; `abort_unless($course->active && puedeAccederAlCurso)` en `EvaluationFlowController@create` |
| V cuadro de evaluación (`/cursos/{id}/evaluaciones/{t}`) | Sí, propio | Sí, institución | No | Ruta `role:docente,direccion`; `Gate::authorize('view', $course)` |
| Subir foto | Sí, curso propio y activo | No | No | Ruta `role:docente`; `StoreFotoEjercicioRequest::authorize`; `FotoEjercicioPolicy::update` |
| Val (guardar S/ED/NA + observación) | Sí, curso propio y activo, con foto subida | No (403) | No (403) | Ruta `role:docente`; `FotoEjercicioPolicy::update`; `abort_unless($photo->ruta_imagen, 422)` |
| Reemplazar foto ya valorada | No (409) | No | No | `EvaluationFlowController@upload`: `abort_if($photo->estado === 'valorado', 409)` |
| V ficha del estudiante (T1–T3) | Sí, propio | Sí, institución | No | Ruta `role:docente,direccion`; `StudentPolicy::view` |
| V informe del curso | Sí, propio | **No (403)** | No | `routes/api/v1/evaluaciones.php` `role:docente`; `CoursePolicy::view` |
| V resumen de cursos de Dirección (`/direccion/cursos`) | No | Sí, institución | No | Ruta `role:direccion`; `abort_unless(esDireccion)` |
| V etapas de procesamiento de una foto | Sí, propio | Sí, institución | No | `FotoEjercicioPolicy::view` |
| V/descargar foto (`/imagenes/{id}/download`) | Sí, propio | Sí, institución | No | `LegacyReadController@image` vía `visiblePhotos()` (filtra por `cursosAccesibles`) |
| V trabajos, resultado e historial (rutas legado `actividades*`) | Sí, propio | Sí, institución | No | `LegacyReadController` (`visiblePhotos()`) |
| V seguimiento del estudiante y del curso (legado) | Sí, propio | Sí, institución | No | `LegacyReadController@studentProgress` (`StudentPolicy::view`), `@courseProgress` (`puedeAccederAlCurso`) |
| V panel (`/dashboard`) | Sí | Sí | No | Ruta `role:docente,direccion` |
| V/C/activar/desactivar versiones del modelo | No | No | Sí | `routes/api/v1/model_versions.php` `role:administrador` |
| Editar observación existente | No existe | No existe | No existe | NO ENCONTRADO (no hay endpoint de edición de `observaciones`) |

Verificado con peticiones reales en SQLite en memoria (ver `03_api.md`): Dirección recibe 200 en el cuadro y la ficha, y 403 en el informe, en `PUT .../valoracion` y en `GET /api/cursos`.

## 4. Policies (archivo y regla)

| Policy | Archivo | Métodos y regla |
|---|---|---|
| `CoursePolicy` | `app/Policies/CoursePolicy.php` | `viewAny`: docente o dirección. `view`: `puedeAccederAlCurso`. `create/update/delete`: `false` |
| `StudentPolicy` | `app/Policies/StudentPolicy.php` | `viewAny`: docente o dirección. `view`: `puedeAccederAlEstudiante`. `create/update/delete/restore`: `false` |
| `ExercisePolicy` | `app/Policies/ExercisePolicy.php` | `viewAny`: docente o dirección. `view`: docente o dirección y ejercicio activo. `create/update/delete`: `false` |
| `EvaluacionPolicy` | `app/Policies/EvaluacionPolicy.php` | `viewAny`: docente o dirección. `view`: acceso al curso. `create`: docente. `update`: docente, curso activo y acceso al curso. (El controlador usa `create`; `view` y `update` no se invocan) |
| `FotoEjercicioPolicy` | `app/Policies/FotoEjercicioPolicy.php` | `view`: acceso al curso de la evaluación. `update`: docente, curso activo y acceso al curso |
| `ActividadPolicy` | `app/Policies/ActividadPolicy.php` | Regla del diseño anterior; el modelo `Actividad` apunta a la tabla `actividades`, que ya no existe |
| `ImagenPolicy` | `app/Policies/ImagenPolicy.php` | Regla del diseño anterior; la tabla `imagenes` fue eliminada |

## 5. Observaciones

- **Dirección y "Mis cursos":** `routes/api/v1/courses.php` y `routes/api/v1/evaluaciones.php` registran `GET cursos` en el grupo sin prefijo `/api`. La segunda definición (`role:docente`) sobrescribe a la primera, así que en `/api/cursos` Dirección recibe 403. En `/api/v1/cursos` (que usa `CourseController@index`) sí tiene acceso.
- **Informes para Dirección:** el informe del curso está restringido a `docente` por la ruta, aunque `CoursePolicy::view` sí permitiría a Dirección.
- **Administrador:** con `cursosAccesibles()` vacío y `role:` excluyente, solo puede gestionar versiones del modelo. No hay pantalla ni endpoint para administrar usuarios, cursos, estudiantes ni ejercicios.
