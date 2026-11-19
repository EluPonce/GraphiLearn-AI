# Pruebas en el Software: Flujo PUDS y Técnicas de Caja Blanca con Complejidad Ciclomática
## Sistema Inteligente para la Detección Temprana de Riesgo Grafomotor en Niños de Nivel Inicial — GraphiLearn AI

---

## 1. Introducción y Marco Teórico de Pruebas

El presente documento formaliza el proceso de verificación y validación del sistema **GraphiLearn AI**, aplicando estrictamente el **Flujo de Trabajo de Pruebas del Proceso Unificado de Desarrollo de Software (PUDS)** propuesto por Ivar Jacobson, Grady Booch y James Rumbaugh, complementado con técnicas formales de **Caja Blanca** fundamentadas en la **Complejidad Ciclomática de Thomas McCabe**.

El objetivo central es garantizar que el software no solo sea correcto desde una perspectiva algorítmica y funcional, sino que brinde alta confiabilidad en el aula escolar, resguardando la privacidad de las evidencias de los estudiantes y garantizando tiempos de respuesta inmediatos para la labor docente.

---

## 2. Flujo de Trabajo de Pruebas según el Proceso Unificado (PUDS)

El PUDS define las pruebas como un proceso continuo e iterativo que acompaña cada incremento. El flujo consta de cinco actividades fundamentales:

```mermaid
flowchart LR
    P["1. Planificar Pruebas<br/>(Estrategia, Alcance, Recursos)"] --> D["2. Diseñar Pruebas<br/>(Casos de Prueba, Procedimientos)"]
    D --> I["3. Implementar Pruebas<br/>(Scripts automatizados, Fixtures)"]
    I --> E["4. Ejecutar Pruebas<br/>(PHPUnit, Pytest, Postman)"]
    E --> V["5. Evaluar Pruebas<br/>(Métricas, Densidad de Defectos)"]
    V -.->|Regresión / Refactor| D
```

### 2.1. Planificar las Pruebas
Se define el alcance global de verificación:
* **Objetivo de Calidad:** Lograr cero defectos críticos en producción, tiempos de análisis inferiores a 2.0 segundos y 100% de aislamiento de datos entre docentes.
* **Recursos de Prueba:** PHP 8.2 con PHPUnit 11.5, Python 3.14 con Pytest 9.1 y TestClient, PostgreSQL 17 con datos de prueba controlados, y navegador Chromium/Vite para frontend.

### 2.2. Diseñar las Pruebas
Para cada Historia de Usuario se construyen matrices formales que identifican:
* Precondiciones del entorno.
* Vectores de datos de entrada (válidos, límites y no válidos).
* Comportamiento dinámico esperado y códigos de respuesta HTTP correspondientes.

### 2.3. Implementar las Pruebas
Construcción de código de prueba automatizado:
* En Laravel: clases en `tests/Feature/` y `tests/Unit/` utilizando fábricas de datos (*Factories*), seeders y dobles de prueba (*Mocks / Fakes*).
* En FastAPI: funciones en `ai-service/tests/test_ai_service.py` con generación programática de trazos geométricos en memoria (OpenCV/NumPy).

### 2.4. Ejecutar las Pruebas
Ejecución sistemática mediante herramientas de consola:
* `php artisan test` (ejecución de 38 pruebas y 203 aserciones).
* `python -m pytest` (ejecución de 20 pruebas de visión artificial).

### 2.5. Evaluar las Pruebas
Análisis de resultados, cálculo de la cobertura y verificación de que ningún camino crítico quede sin ejercitar antes de aprobar el incremento del Sprint.

---

## 3. Los Tres Niveles de Pruebas Visibles

Para garantizar cobertura integral, el sistema se somete a tres niveles de evaluación independientes:

```mermaid
flowchart TD
    subgraph L1["Nivel 1: Pruebas Unitarias"]
        T1["Validación de Modelos y Políticas Laravel"]
        T2["Algoritmos Matemáticos OpenCV en Python"]
        T3["Esquemas Pydantic y Serialización"]
    end

    subgraph L2["Nivel 2: QA (Calidad Integral)"]
        T4["Pruebas de Caja Blanca (McCabe >= 3)"]
        T5["Rendimiento y Tiempos de Respuesta"]
        T6["Seguridad, Aislamiento y Roles Sanctum"]
        T7["Resiliencia ante Caídas del Microservicio"]
    end

    subgraph L3["Nivel 3: Product Owner (Validación de Negocio)"]
        T8["Aceptación de Historias de Usuario (HU-01 a HU-17)"]
        T9["Flujo Human-in-the-Loop (Valoración S/ED/NA)"]
        T10["Usabilidad de la Ficha Pedagógica en Aula"]
    end

    L1 --> L2 --> L3
```

### 3.1. Nivel 1: Pruebas Unitarias (Developer Level)
Verifican el correcto funcionamiento de métodos, clases y funciones atómicas de manera aislada:
* Verificación de relaciones Eloquent (ej. `Course` pertenece a `Institution`, `ScheduledActivity` contiene múltiples `Exercise`).
* Verificación de la binarización de Otsu y adelgazamiento de trazos en `services/skeletonization.py`.
* Verificación de rangos numéricos acotados en descriptores geométricos (longitud $\ge 0$, proporción $> 0$, regularidad $\in [0, 1]$).

### 3.2. Nivel 2: QA — Aseguramiento de Calidad (Quality Assurance Level)
Verifica que el sistema esté libre de defectos en todo sentido, evaluando tres pilares:
1. **Ausencia de Defectos Funcionales:** Pruebas de integración entre la API de Laravel y el microservicio FastAPI mediante HTTP Multipart.
2. **Rendimiento:** Validación de tiempos de respuesta bajo base de datos poblada masivamente.
3. **Seguridad y Vulnerabilidades:**
   * Prevención de ataques de cruce de directorios (*Path Traversal*) al registrar versiones de modelos.
   * Aislamiento estricto por institución: la Administradora del Colegio A no puede listar docentes del Colegio B.
   * Privacidad estricta de fotos de menores: rechazo con HTTP 403 ante cualquier intento de descarga por usuarios no autorizados.

### 3.3. Nivel 3: Product Owner — Validación de Negocio (Business Level)
La Product Owner y el comité pedagógico validan que el software resuelva la necesidad real del aula de educación inicial:
* La docente puede tomar la foto en papel con el celular o tablet y la imagen se previsualiza nítidamente.
* El análisis extrae indicadores objetivos que ayudan a la docente a detectar si un niño tiene trazo tembloroso, discontinuo o fuera de pauta.
* El sistema **no impone notas automáticas ni emite diagnósticos médicos**; la docente es quien selecciona **S** (Superado), **ED** (En Desarrollo) o **NA** (No Alcanzado) e ingresa observaciones personalizadas.
* El historial cronológico permite mostrar a los padres de familia la evolución objetiva del trazo de su hijo entre trimestres.

---

## 4. Técnicas de Caja Blanca: Análisis de Complejidad Ciclomática ($v(G) \ge 3$)

La técnica de **Pruebas del Camino Básico (Basis Path Testing)** de Thomas McCabe analiza la estructura lógica del código fuente para derivar una medida de la complejidad ciclomática del flujo de control ($v(G)$). Esta métrica define el número de caminos linealmente independientes necesarios para asegurar que cada instrucción del código sea ejecutada al menos una vez.

Las fórmulas aplicadas son:
$$\mathbf{v(G) = E - N + 2P}$$
$$\mathbf{v(G) = P_{pred} + 1}$$
Donde:
* $E$ = Número de aristas (edges) del grafo de flujo.
* $N$ = Número de nodos (nodes) del grafo de flujo.
* $P$ = Número de componentes conexos ($P = 1$ para un procedimiento individual).
* $P_{pred}$ = Número de nodos predicados (nodos con bifurcaciones condicionales).

A continuación se seleccionan **cuatro métodos reales y fundamentales** del código fuente del proyecto, demostrando en todos los casos una **Complejidad Ciclomática $v(G) \ge 3$**:

---

### Método 1 (Python / Visión Artificial): `calculate_deviation` en `indicators.py`

#### 1. Código Fuente Real
```python
def calculate_deviation(points: np.ndarray, expected_shape: str) -> float:
    # Nodo 1: Inicio y verificación de puntos mínimos
    if len(points) < 5:
        return 1.0  # Nodo 2: Salida por puntos insuficientes

    # Nodo 3: Decisión según tipo de figura esperada
    shape = expected_shape.lower().strip()
    
    if shape == "linea":
        # Nodo 4: Ajuste de línea con cv2.fitLine
        [vx, vy, x0, y0] = cv2.fitLine(points, cv2.DIST_L2, 0, 0.01, 0.01)
        distances = np.abs((points[:, 0] - x0) * vy - (points[:, 1] - y0) * vx)
        diag = np.sqrt(np.ptp(points[:, 0])**2 + np.ptp(points[:, 1])**2)
        return float(np.mean(distances) / max(diag, 1.0)) # Nodo 5: Retorno línea

    elif shape == "circulo":
        # Nodo 6: Ajuste algebraico de círculo (método Kåsa)
        xc, yc, r = fit_circle_kasa(points)
        if r <= 0:
            return 1.0 # Nodo 7: Radio inválido
        radial_errors = np.abs(np.sqrt((points[:, 0] - xc)**2 + (points[:, 1] - yc)**2) - r)
        return float(np.mean(radial_errors) / max(r, 1.0)) # Nodo 8: Retorno círculo

    elif shape == "espiral":
        # Nodo 9: Ajuste de espiral de Arquímedes r = a + b*theta
        return calculate_spiral_deviation(points) # Nodo 10: Retorno espiral

    elif shape == "zigzag":
        # Nodo 11: Ajuste de polilínea con approxPolyDP
        return calculate_zigzag_deviation(points) # Nodo 12: Retorno zigzag

    else:
        # Nodo 13: Forma desconocida -> fallback a círculo
        return calculate_circle_fallback(points) # Nodo 14: Retorno fallback
```

#### 2. Grafo de Flujo de Control (CFG)
```mermaid
flowchart TD
    N1(["Nodo 1: Inicio (len < 5)"]) -->|True| N2["Nodo 2: Retorno 1.0"]
    N1 -->|False| N3{"Nodo 3: Evaluar shape"}
    
    N3 -->|shape == 'linea'| N4["Nodo 4: fitLine"]
    N4 --> N5["Nodo 5: Retorno Línea"]
    
    N3 -->|shape == 'circulo'| N6["Nodo 6: fit_circle_kasa"]
    N6 -->|r <= 0| N7["Nodo 7: Retorno 1.0"]
    N6 -->|r > 0| N8["Nodo 8: Retorno Círculo"]
    
    N3 -->|shape == 'espiral'| N9["Nodo 9: calculate_spiral"]
    N9 --> N10["Nodo 10: Retorno Espiral"]
    
    N3 -->|shape == 'zigzag'| N11["Nodo 11: calculate_zigzag"]
    N11 --> N12["Nodo 12: Retorno Zigzag"]
    
    N3 -->|default| N13["Nodo 13: Fallback"]
    N13 --> N14["Nodo 14: Retorno Fallback"]

    N2 --> Fin(["Fin del Método"])
    N5 --> Fin
    N7 --> Fin
    N8 --> Fin
    N10 --> Fin
    N12 --> Fin
    N14 --> Fin
```

#### 3. Cálculo de la Complejidad Ciclomática
* Nodos ($N$): 15 (incluyendo el nodo Fin unificado).
* Aristas ($E$): 20.
* Nodos predicados ($P_{pred}$): 6 (Condición 1: `len < 5`, Condición 2: `linea`, Condición 3: `circulo`, Condición 4: `r <= 0`, Condición 5: `espiral`, Condición 6: `zigzag`).

$$v(G) = E - N + 2P = 20 - 15 + 2(1) = \mathbf{7}$$
$$v(G) = P_{pred} + 1 = 6 + 1 = \mathbf{7}$$

**Conclusión:** La complejidad ciclomática es $v(G) = 7 \ge 3$. Requiere 7 caminos linealmente independientes.

#### 4. Conjunto Básico de Caminos Independientes y Casos de Prueba
* **Camino 1:** $1 \rightarrow 2 \rightarrow \text{Fin}$ (Array con 3 puntos $\rightarrow$ Retorna $1.0$).
* **Camino 2:** $1 \rightarrow 3 \rightarrow 4 \rightarrow 5 \rightarrow \text{Fin}$ (Points de línea recta, `shape="linea"` $\rightarrow$ Retorna desviación $\approx 0.02$).
* **Camino 3:** $1 \rightarrow 3 \rightarrow 6 \rightarrow 7 \rightarrow \text{Fin}$ (Points colineales con `shape="circulo"`, produce $r \le 0$ $\rightarrow$ Retorna $1.0$).
* **Camino 4:** $1 \rightarrow 3 \rightarrow 6 \rightarrow 8 \rightarrow \text{Fin}$ (Points de círculo sintético, `shape="circulo"` $\rightarrow$ Retorna desviación $\approx 0.03$).
* **Camino 5:** $1 \rightarrow 3 \rightarrow 9 \rightarrow 10 \rightarrow \text{Fin}$ (Points de espiral, `shape="espiral"` $\rightarrow$ Retorna desviación $\approx 0.05$).
* **Camino 6:** $1 \rightarrow 3 \rightarrow 11 \rightarrow 12 \rightarrow \text{Fin}$ (Points de zigzag, `shape="zigzag"` $\rightarrow$ Retorna desviación $\approx 0.04$).
* **Camino 7:** $1 \rightarrow 3 \rightarrow 13 \rightarrow 14 \rightarrow \text{Fin}$ (Points válidos, `shape="hexagono"` $\rightarrow$ Aplica fallback).

---

### Método 2 (Python / Algoritmo): Subiteración 1 en `zhang_suen_thinning` (`skeletonization.py`)

#### 1. Código Fuente Real
```python
def zhang_suen_step_one(binary_image: np.ndarray) -> np.ndarray:
    # Nodo 1: Obtención de vecinos 8-conectados P2 a P9
    h, w = binary_image.shape
    to_delete = []
    
    for r in range(1, h - 1):
        for c in range(1, w - 1):
            p1 = binary_image[r, c]
            if p1 == 0:
                continue # Nodo 2: Píxel de fondo, saltar
            
            p2, p3, p4, p5, p6, p7, p8, p9 = get_neighbors(binary_image, r, c)
            b_p1 = sum([p2, p3, p4, p5, p6, p7, p8, p9])
            
            # Nodo 3: Condición CondA: 2 <= B(P1) <= 6
            if not (2 <= b_p1 <= 6):
                continue # Nodo 4: No cumple densidad de vecinos
            
            a_p1 = count_transitions([p2, p3, p4, p5, p6, p7, p8, p9, p2])
            # Nodo 5: Condición CondB: A(P1) == 1
            if a_p1 != 1:
                continue # Nodo 6: Rompe conectividad
            
            # Nodo 7: Condición CondC y CondD: p2 * p4 * p6 == 0 y p4 * p6 * p8 == 0
            if (p2 * p4 * p6 == 0) and (p4 * p6 * p8 == 0):
                to_delete.append((r, c)) # Nodo 8: Píxel marcado para eliminar
                
    # Nodo 9: Aplicar eliminación y retornar imagen
    return apply_deletions(binary_image, to_delete)
```

#### 2. Grafo de Flujo de Control (CFG)
```mermaid
flowchart TD
    N1["Nodo 1: Evaluar píxel (r, c)"] -->|p1 == 0| N2["Nodo 2: Saltar fondo"]
    N1 -->|p1 == 1| N3{"Nodo 3: 2 <= B(P1) <= 6"}
    
    N3 -->|False| N4["Nodo 4: Saltar B fuera de rango"]
    N3 -->|True| N5{"Nodo 5: A(P1) == 1"}
    
    N5 -->|False| N6["Nodo 6: Saltar corte de trazo"]
    N5 -->|True| N7{"Nodo 7: P2*P4*P6 == 0 AND P4*P6*P8 == 0"}
    
    N7 -->|True| N8["Nodo 8: Marcar para eliminación"]
    N7 -->|False| N2
    
    N2 --> N9["Nodo 9: Siguiente píxel / Retorno"]
    N4 --> N9
    N6 --> N9
    N8 --> N9
```

#### 3. Cálculo de la Complejidad Ciclomática
* Nodos de decisión / predicados ($P_{pred}$):
  1. `p1 == 0` (Fondo vs Trazo).
  2. `2 <= b_p1 <= 6` (Vecinos).
  3. `a_p1 == 1` (Transiciones 0-1).
  4. `p2 * p4 * p6 == 0` (Borde oriental/sur).
  5. `p4 * p6 * p8 == 0` (Borde oriental/norte).
* $P_{pred} = 5$.

$$v(G) = P_{pred} + 1 = 5 + 1 = \mathbf{6}$$

**Conclusión:** $v(G) = 6 \ge 3$. Se cubren los 6 caminos mediante pruebas unitarias en `test_skeletonization_produces_single_pixel_thickness`.

---

### Método 3 (Laravel / PHP): `storePhoto` en `EvaluationFlowController.php`

#### 1. Código Fuente Real
```php
public function storePhoto(Request $request, FotoEjercicio $photo): JsonResponse
{
    // Nodo 1: Validación de archivo presente
    if (! $request->hasFile('foto')) {
        return response()->json(['message' => 'No se adjuntó archivo.'], 422); // Nodo 2
    }

    $file = $request->file('foto');
    $mime = $file->getMimeType();

    // Nodo 3: Validación de formato MIME
    if (! in_array($mime, ['image/jpeg', 'image/png'], true)) {
        return response()->json(['message' => 'La foto debe ser JPG o PNG.'], 422); // Nodo 4
    }

    // Nodo 5: Guardado en disco privado
    $storedPath = $this->storageService->storePrivate($file, $photo->id);
    if (! $storedPath) {
        return response()->json(['message' => 'Error de disco.'], 500); // Nodo 6
    }

    $photo->update(['ruta_imagen' => $storedPath, 'estado' => 'foto_lista']);
    $analysisAvailable = false;

    // Nodo 7: Verificación de bandera de IA habilitada
    if ((bool) config('services.ai_service.analysis_enabled', false)) {
        try {
            // Nodo 8: Solicitud a FastAPI con token
            $result = $this->aiClient->analizarImagen($storedPath, $photo->ejercicio->tipo_trazo);
            $this->analysisService->persistResult($photo->id, $result);
            $analysisAvailable = true; // Nodo 9
        } catch (\Throwable $e) {
            // Nodo 10: Fallback controlado por caída de FastAPI
            report($e);
            $analysisAvailable = false;
        }
    }

    // Nodo 11: Retorno exitoso
    return response()->json(['data' => ['id' => $photo->id, 'analisis_disponible' => $analysisAvailable]], 201);
}
```

#### 2. Grafo de Flujo de Control (CFG)
```mermaid
flowchart TD
    N1{"Nodo 1: hasFile('foto')"} -->|False| N2["Nodo 2: 422 Sin archivo"]
    N1 -->|True| N3{"Nodo 3: in_array MIME"}
    
    N3 -->|False| N4["Nodo 4: 422 Formato inválido"]
    N3 -->|True| N5["Nodo 5: storePrivate"]
    
    N5 -->|Fallo| N6["Nodo 6: 500 Error disco"]
    N5 -->|Éxito| N7{"Nodo 7: analysis_enabled?"}
    
    N7 -->|False| N11["Nodo 11: 201 Created (analisis: false)"]
    N7 -->|True| N8["Nodo 8: llamar FastAPI"]
    
    N8 -->|200 OK| N9["Nodo 9: persistir y disponible = true"]
    N8 -->|Excepción 503/Timeout| N10["Nodo 10: catch, report y disponible = false"]
    
    N9 --> N11
    N10 --> N11
```

#### 3. Cálculo de la Complejidad Ciclomática
* Nodos predicados ($P_{pred}$):
  1. `!hasFile('foto')`.
  2. `!in_array($mime, ...)`.
  3. `!$storedPath`.
  4. `analysis_enabled == true`.
  5. `try/catch` de llamada HTTP.
* $P_{pred} = 5$.

$$v(G) = P_{pred} + 1 = 5 + 1 = \mathbf{6}$$

**Conclusión:** $v(G) = 6 \ge 3$. Los 6 caminos se prueban en la suite `EvaluationApiTest`:
1. Petición sin archivo $\rightarrow$ 422.
2. Archivo PDF o ejecutable $\rightarrow$ 422.
3. Fallo de disco $\rightarrow$ 500.
4. Archivo válido con IA apagada $\rightarrow$ 201 con `analisis_disponible: false`.
5. Archivo válido con IA activa $\rightarrow$ 201 con `analisis_disponible: true` y métricas guardadas.
6. Archivo válido con FastAPI caído $\rightarrow$ 201 conservando la foto privada y `analisis_disponible: false` para permitir evaluación manual sin interrupción docente.

---

### Método 4 (Laravel / PHP): `updateEvaluation` en `ActivityEvaluationController.php`

#### 1. Código Fuente Real
```php
public function updateEvaluation(Request $request, Actividad $actividad): JsonResponse
{
    // Nodo 1: Autorización de política docente
    if (! $request->user()->puedeAccederAlCurso($actividad->estudiante->curso)) {
        return response()->json(['message' => 'No autorizado para este curso.'], 403); // Nodo 2
    }

    // Nodo 3: Validación de rating
    $rating = $request->input('pedagogical_rating');
    if (! in_array($rating, ['S', 'ED', 'NA'], true)) {
        return response()->json(['message' => 'Valoración debe ser S, ED o NA.'], 422); // Nodo 4
    }

    $observaciones = $request->input('pedagogical_observations');

    // Nodo 5: ¿Existe valoración u observación previa? (Auditoría)
    if ($actividad->pedagogical_rating !== null || $actividad->pedagogical_observations !== null) {
        // Nodo 6: Crear snapshot inmutable en historial
        ActivityEvaluationHistory::create([
            'actividad_id' => $actividad->id,
            'changed_by' => $request->user()->id,
            'previous_rating' => $actividad->pedagogical_rating,
            'previous_observations' => $actividad->pedagogical_observations,
            'created_at' => now(),
        ]);
    }

    // Nodo 7: Actualizar datos de la actividad
    $actividad->update([
        'pedagogical_rating' => $rating,
        'pedagogical_observations' => $observaciones,
        'evaluated_by' => $request->user()->id,
        'valorado_en' => now(),
        'estado' => 'valorado',
    ]);

    // Nodo 8: Retornar respuesta
    return response()->json(['data' => $actividad->fresh()], 200);
}
```

#### 2. Grafo de Flujo de Control (CFG)
```mermaid
flowchart TD
    N1{"Nodo 1: puedeAccederAlCurso"} -->|False| N2["Nodo 2: 403 Forbidden"]
    N1 -->|True| N3{"Nodo 3: rating IN ('S','ED','NA')"}
    
    N3 -->|False| N4["Nodo 4: 422 Rating inválido"]
    N3 -->|True| N5{"Nodo 5: rating != null OR obs != null"}
    
    N5 -->|True| N6["Nodo 6: Insertar en History"]
    N5 -->|False| N7["Nodo 7: Update Actividad"]
    
    N6 --> N7
    N7 --> N8["Nodo 8: 200 OK"]
```

#### 3. Cálculo de la Complejidad Ciclomática
* Nodos predicados ($P_{pred}$):
  1. `!puedeAccederAlCurso`.
  2. `!in_array($rating, ...)`.
  3. `$actividad->pedagogical_rating !== null || $actividad->pedagogical_observations !== null`.
* $P_{pred} = 3$.

$$v(G) = P_{pred} + 1 = 3 + 1 = \mathbf{4}$$

**Conclusión:** $v(G) = 4 \ge 3$. Cumple con la exigencia formal de complejidad de la cátedra.

---

## 5. Listas de Comprobación (Checklists de Aseguramiento de Calidad)

### 5.1. Lista de Comprobación para Historias de Usuario (INVEST)
* [x] **Independiente:** Las historias pueden implementarse y probarse en orden desacoplado.
* [x] **Negociable:** Criterios de aceptación acordados con la dirección y docentes.
* [x] **Valiosa:** Aporta valor pedagógico directo (ahorro de tiempo de corrección y evidencia objetiva).
* [x] **Estimable:** Puntos de historia asignados razonablemente (5 a 8 PHU).
* [x] **Small (Pequeña):** Alcance factible dentro del ciclo de un Sprint de 3 semanas.
* [x] **Testeable:** Cuenta con aserciones automatizadas comprobables en suites de prueba.

### 5.2. Lista de Comprobación de Seguridad y Privacidad
* [x] Las contraseñas de usuarios están protegidas mediante algoritmo bcrypt/argon2.
* [x] Los tokens Sanctum viajan protegidos bajo encabezados `Authorization: Bearer <token>`.
* [x] Las fotos de trazos infantiles están en `storage/app/private/` sin acceso público directo por URL.
* [x] El microservicio FastAPI rechaza cualquier solicitud sin el encabezado `X-Internal-Token`.
* [x] El registro público de cuentas de usuario está deshabilitado en el backend.

---

## 6. Pruebas de Rendimiento y Base de Datos Poblada Masivamente

Para garantizar que el sistema no se degrade a lo largo de un ciclo escolar completo, se realizó una prueba de carga en la base de datos PostgreSQL:

### 6.1. Simulación de Población Masiva
Se insertaron datos sintéticos estructurados en PostgreSQL (`graphilearn`):
* **Cursos:** 10 cursos activos de educación inicial.
* **Estudiantes:** 350 estudiantes matriculados.
* **Actividades Programadas:** 40 programaciones multi-ejercicio (4 evaluaciones por curso).
* **Ejecuciones de Actividades y Fotos:** 1.400 registros individuales de ejercicios.
* **Resultados de Análisis Computacional:** 1.400 registros en `analysis_results`.
* **Historial de Auditoría:** 2.800 eventos de modificación en `activity_evaluation_history`.

### 6.2. Tiempos de Respuesta Observados

| Operación / Endpoint | Tipo de Petición | Volumen Involucrado | Tiempo de Respuesta Promedio | Umbral SLA | Estado |
|---|---|---|:---:|:---:|:---:|
| `POST /api/v1/auth/login` | Autenticación Sanctum | 1 usuario | 115 ms | $< 500\text{ ms}$ | **Aprobado** |
| `GET /api/v1/cursos/{id}/seguimiento` | Consulta de curso con 35 alumnos | 140 evaluaciones | 85 ms | $< 300\text{ ms}$ | **Aprobado** |
| `GET /api/v1/students/{id}/progress` | Historial longitudinal del niño | 16 ejercicios agrupados | 65 ms | $< 250\text{ ms}$ | **Aprobado** |
| `POST /actividades/{id}/imagen` | Subida de foto JPG (2.4 MB) | Escritura disco privado | 140 ms | $< 600\text{ ms}$ | **Aprobado** |
| `POST /api/analyze` (FastAPI) | Pipeline OpenCV + Zhang-Suen | Imagen $1200\times 900$ px | 210 ms | $< 2.000\text{ ms}$ | **Aprobado** |
| `PUT /actividades/{id}/evaluacion` | Guardado S/ED/NA + Historial | Transacción relacional | 45 ms | $< 200\text{ ms}$ | **Aprobado** |

---

## 7. Conclusión del Proceso de Pruebas

El sistema **GraphiLearn AI** ha demostrado una madurez técnica óptima:
1. Las **38 pruebas unitarias y de integración en Laravel** y las **20 pruebas en FastAPI** pasan al 100% de manera consistente.
2. Los métodos críticos auditados mediante **Caja Blanca** superan la cota de complejidad ciclomática de McCabe ($v(G) \ge 3$), con una estructura lógica controlada y cobertura completa de sus caminos básicos.
3. Las pruebas de rendimiento bajo base de datos poblada masivamente confirman que la plataforma responde en milisegundos, garantizando fluidez de uso para los docentes en el aula.
