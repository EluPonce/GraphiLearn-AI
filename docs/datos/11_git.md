# 11 · Historial de git

Consultado el 2026-11-14 en la rama `feature/crud-roles-evaluacion`.

## 1. `git log --date=short --pretty=format:"%h %ad %s"` (completo)

```
f911e3e 2026-10-29 chore: estructura inicial GraphiLearn AI
```

El historial completo tiene **un solo commit**. Todas las ramas, locales y remotas, apuntan a él:

```
main f911e3e
feature/fase-2-integracion f911e3e
feature/crud-roles-evaluacion f911e3e
origin/main f911e3e
origin/feature/fase-2-integracion f911e3e
```

Ese commit agregó 179 archivos (`179 files changed, 24290 insertions(+)`).

## 2. Commits por día

```
      1 2026-10-29
```

## 3. Archivos más modificados

Con un único commit, cada archivo versionado aparece modificado exactamente **1 vez** en el historial, así que el ranking por número de commits no aporta información:

```
$ git log --pretty=format: --name-only | sort | uniq -c | sort -rn | head
      1 docs/sprint-2/revision-pipeline.md
      1 docs/sprint-2/review-y-retrospectiva.md
      1 docs/sprint-2/pruebas.md
      1 docs/sprint-2/planning-y-backlog.md
      1 docs/sprint-2/pendientes.md
      ...
```

Como dato complementario, estos son los archivos con más líneas cambiadas **sin commit** respecto a `f911e3e` (`git diff --numstat`, columnas: total, agregadas, eliminadas, archivo):

```
757 204 553 GraphiLearn/resources/js/views/ActivityDetailView.jsx
398 12 386 GraphiLearn/tests/Feature/GraphiLearnSprint2BackendTest.php
314 142 172 GraphiLearn/resources/js/views/NewActivityView.jsx
249 117 132 GraphiLearn/resources/js/App.jsx
235 50 185 GraphiLearn/resources/js/views/DashboardView.jsx
220 220 0 GraphiLearn/resources/css/app.css
167 129 38 GraphiLearn/resources/js/views/CoursesView.jsx
151 52 99 GraphiLearn/resources/js/components/Sidebar.jsx
128 62 66 GraphiLearn/resources/js/views/StudentsView.jsx
106 74 32 ai-service/routers/models.py
105 28 77 GraphiLearn/tests/Feature/PhaseOneSecurityTest.php
85 75 10 ai-service/tests/test_ai_service.py
60 28 32 GraphiLearn/resources/js/views/ExercisesView.jsx
53 32 21 GraphiLearn/resources/js/views/ActivitiesView.jsx
49 33 16 ai-service/README.md
```

Resumen sin commit: `64 files changed, 1696 insertions(+), 2057 deletions(-)` en archivos versionados, más **39 entradas sin seguimiento** (`??`) antes de crear `docs/datos/`. Entre ellas está todo el flujo nuevo:

- `EvaluationFlowController`, `LegacyReadController`
- los modelos `Evaluacion`, `FotoEjercicio`, `Analisis`, `Observacion`
- las 5 migraciones de octubre y noviembre
- `routes/api/v1/evaluaciones.php`
- `tests/Feature/EvaluationApiTest.php`
- `docker-compose.yml`, `ai-service/Dockerfile`, `ai-service/models/manifest.json`
- `docs/sprint-3/`

**Implicación:** el trabajo de los sprints 2 y 3 (rediseño a evaluaciones, rol Dirección, seguridad de FastAPI) **no está en el historial de git ni en el remoto**. Si se perdiera la carpeta local, se perdería ese trabajo, y el historial no sirve como evidencia del avance por sprint.
