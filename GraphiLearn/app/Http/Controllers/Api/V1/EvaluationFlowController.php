<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Evaluacion\StoreEvaluacionRequest;
use App\Http\Requests\FotoEjercicio\StoreFotoEjercicioRequest;
use App\Models\Analisis;
use App\Models\Course;
use App\Models\Evaluacion;
use App\Models\Exercise;
use App\Models\FotoEjercicio;
use App\Models\Observacion;
use App\Models\Student;
use App\Services\FastApiClient;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\StreamedResponse;

class EvaluationFlowController extends Controller
{
    private const EXERCISES = ['linea' => 'linea', 'circulos' => 'circulo', 'zigzag' => 'zigzag', 'espiral' => 'espiral'];

    public function __construct(private readonly FastApiClient $ai) {}

    public function courses(Request $request): JsonResponse
    {
        $user = $request->user();
        abort_unless($user->esDocente(), 403);
        $courses = $user->cursosAccesibles()->withCount('estudiantes')->with(['evaluaciones' => fn ($q) => $q->orderByDesc('trimestre')])->get();
        $data = $courses->map(function (Course $course) {
            $current = $course->evaluaciones->first();
            $total = (int) $course->estudiantes_count;
            $complete = $current ? $current->fotos()->select('id_estudiante')->where('estado', 'valorado')
                ->groupBy('id_estudiante')->havingRaw('COUNT(DISTINCT id_ejercicio) = 4')->count() : 0;
            return [
                'id' => $course->id, 'nombre' => $course->nombre, 'trimestre_actual' => $current?->trimestre,
                'nivel' => $current?->nivel, 'estudiantes_completos' => $complete, 'total_estudiantes' => $total,
                'evaluacion_id' => $current?->id,
            ];
        });
        return response()->json(['data' => $data]);
    }

    public function create(StoreEvaluacionRequest $request): JsonResponse
    {
        $course = Course::findOrFail($request->integer('id_curso'));
        Gate::authorize('create', Evaluacion::class);
        abort_unless($course->active && $request->user()->puedeAccederAlCurso($course), 403);
        $exercises = $this->exerciseCatalog();

        try {
            $evaluation = DB::transaction(function () use ($request, $course, $exercises) {
                $evaluation = Evaluacion::create([
                    'id_curso' => $course->id,
                    'trimestre' => $request->integer('trimestre'),
                    'nivel' => $request->integer('nivel'),
                    'tamano_figura_mm' => $request->input('tamano_figura_mm'),
                    'fecha' => $request->input('fecha', now()->toDateString()),
                ]);
                $this->ensureSlots($evaluation, $exercises);
                return $evaluation;
            });
        } catch (QueryException $exception) {
            if (($exception->errorInfo[0] ?? null) === '23505' || str_contains(strtolower($exception->getMessage()), 'unique')) {
                return response()->json(['message' => 'Ya existe una Evaluación para ese curso y trimestre.'], 409);
            }
            throw $exception;
        }

        return response()->json(['data' => $evaluation->load('curso')], 201);
    }

    public function grid(Request $request, int $courseId, int $trimestre): JsonResponse
    {
        abort_unless(in_array($trimestre, [1, 2, 3], true), 404);
        $course = Course::findOrFail($courseId);
        Gate::authorize('view', $course);
        $evaluation = Evaluacion::where('id_curso', $course->id)->where('trimestre', $trimestre)->first();
        if (! $evaluation) return response()->json(['data' => ['evaluacion' => null, 'estudiantes' => []]]);

        $exercises = $this->exerciseCatalog();
        $this->ensureSlots($evaluation, $exercises);
        $students = Student::where('id_curso', $course->id)->orderBy('nombre')->get();
        $photos = $evaluation->fotos()->with('analisis')->get()->keyBy(fn ($photo) => $photo->id_estudiante.':'.$photo->id_ejercicio);
        $exerciseItems = collect(self::EXERCISES)->map(fn ($legacyType, $token) => [
            'ejercicio' => $token, 'id_ejercicio' => $exercises[$token]->id, 'nombre' => $exercises[$token]->nombre,
            'descripcion' => $exercises[$token]->descripcion,
        ])->values();
        $rows = $students->map(fn ($student) => [
            'id_estudiante' => $student->id,
            'nombre' => $student->nombre,
            'ejercicios' => $exerciseItems->map(function ($exercise) use ($student, $photos) {
                $photo = $photos->get($student->id.':'.$exercise['id_ejercicio']);
                unset($exercise['descripcion']);
                return $exercise + [
                    'id_foto' => $photo?->id, 'estado' => $photo?->estado ?? 'sin_foto',
                    'valoracion' => $photo?->valoracion, 'analisis_disponible' => $photo?->analisis !== null,
                    // Resumen para la pantalla de captura: indicadores crudos, sugerencia y aviso de FastAPI.
                    'analisis' => $photo?->analisis ? [
                        'indicadores' => $photo->analisis->indicadores,
                        'sugerencia' => $photo->analisis->sugerencia,
                        'aviso_pedagogico' => $photo->analisis->detalles_computacionales['aviso_pedagogico'] ?? null,
                    ] : null,
                ];
            })->values(),
        ]);
        return response()->json(['data' => ['evaluacion' => $evaluation, 'ejercicios' => $exerciseItems, 'estudiantes' => $rows]]);
    }

    public function upload(StoreFotoEjercicioRequest $request, int $evaluationId, int $studentId, string $exercise): JsonResponse
    {
        abort_unless(isset(self::EXERCISES[$exercise]), 404);
        $evaluation = Evaluacion::with('curso')->findOrFail($evaluationId);
        $student = Student::findOrFail($studentId);
        abort_unless((int) $student->id_curso === (int) $evaluation->id_curso, 404);
        $exerciseRecord = $this->exerciseCatalog()[$exercise];
        $photo = FotoEjercicio::where('id_evaluacion', $evaluation->id)->where('id_estudiante', $student->id)
            ->where('id_ejercicio', $exerciseRecord->id)->firstOrFail();
        Gate::authorize('update', $photo);
        abort_if($photo->estado === 'valorado', 409, 'La foto ya tiene una valoración; no se puede reemplazar.');

        $file = $request->file('foto');
        $mime = $file->getMimeType();
        abort_unless(in_array($mime, ['image/jpeg', 'image/png'], true), 422, 'La foto debe ser JPG o PNG.');
        $extension = $mime === 'image/png' ? 'png' : 'jpg';
        $path = sprintf('graphilearn/fotos/%d/%s.%s', $photo->id, Str::uuid(), $extension);
        $storedPath = $file->storeAs(dirname($path), basename($path), 'private');
        if (! $storedPath) return response()->json(['message' => 'No se pudo guardar la foto privada.'], 500);

        $oldPath = $photo->ruta_imagen;
        $photo->update(['ruta_imagen' => $storedPath, 'estado' => 'foto_lista', 'fecha' => now()->toDateString()]);
        if ($oldPath) Storage::disk('private')->delete($oldPath);

        $analysisAvailable = false;
        if ((bool) config('services.ai_service.analysis_enabled', false)) {
            try {
                $result = $this->ai->analizarImagen($storedPath, $exerciseRecord->tipo_trazo);
                $class = $result['clasificacion'] ?? [];
                Analisis::updateOrCreate(['id_foto' => $photo->id], [
                    'tipo_trazo' => $exerciseRecord->tipo_trazo,
                    'indicadores' => $result['indicadores_cuantitativos'] ?? null,
                    'caracteristicas' => $result['caracteristicas_geometricas'] ?? null,
                    'rutas_etapas' => $result['rutas_etapas'] ?? null,
                    'sugerencia' => in_array($class['sugerencia'] ?? null, ['S', 'ED', 'NA'], true) ? $class['sugerencia'] : null,
                    'id_modelo' => null,
                    'estado' => 'procesado',
                    'detalles_computacionales' => $result['detalles_computacionales'] ?? null,
                ]);
                $analysisAvailable = true;
            } catch (\Throwable $exception) {
                report($exception);
            }
        }

        return response()->json(['data' => [
            'id' => $photo->id, 'estado' => 'foto_lista', 'analisis_disponible' => $analysisAvailable,
            'mensaje_analisis' => $analysisAvailable ? null : 'Análisis no disponible por ahora.',
            'analisis' => $analysisAvailable ? $photo->fresh('analisis')->analisis : null,
        ]], 201);
    }

    public function rate(Request $request, int $evaluationId, int $studentId, string $exercise): JsonResponse
    {
        abort_unless(isset(self::EXERCISES[$exercise]), 404);
        $data = $request->validate(['valoracion' => ['required', 'in:S,ED,NA'], 'observacion' => ['nullable', 'string', 'max:5000']]);
        $evaluation = Evaluacion::with('curso')->findOrFail($evaluationId);
        $student = Student::findOrFail($studentId);
        abort_unless((int) $student->id_curso === (int) $evaluation->id_curso, 404);
        $exerciseRecord = $this->exerciseCatalog()[$exercise];
        $photo = FotoEjercicio::where('id_evaluacion', $evaluation->id)->where('id_estudiante', $student->id)->where('id_ejercicio', $exerciseRecord->id)->firstOrFail();
        Gate::authorize('update', $photo);
        abort_unless($photo->ruta_imagen, 422, 'Sube una foto antes de guardar la valoración.');

        DB::transaction(function () use ($photo, $data, $request, $evaluation, $student, $exerciseRecord) {
            $photo->update(['valoracion' => $data['valoracion'], 'valorado_por' => $request->user()->id, 'valorado_en' => now(), 'estado' => 'valorado']);
            if (filled($data['observacion'] ?? null)) {
                Observacion::create([
                    'id_estudiante' => $student->id, 'id_evaluacion' => $evaluation->id, 'id_ejercicio' => $exerciseRecord->id,
                    'texto' => $data['observacion'], 'autor' => $request->user()->id,
                ]);
            }
        });

        // Solo id y nombre de quien valora: no exponer correo ni otros datos de la cuenta.
        return response()->json(['data' => $photo->fresh(['analisis', 'valoradoPor:id,nombre'])]);
    }

    public function studentSheet(Request $request, int $studentId): JsonResponse
    {
        $student = Student::with('curso')->findOrFail($studentId);
        Gate::authorize('view', $student);
        $evaluations = Evaluacion::where('id_curso', $student->id_curso)->get()->keyBy('trimestre');
        $exerciseCatalog = $this->exerciseCatalog();
        $tokenById = collect($exerciseCatalog)->mapWithKeys(fn ($exercise, $token) => [$exercise->id => $token]);
        $termByEvaluation = $evaluations->mapWithKeys(fn ($evaluation) => [$evaluation->id => $evaluation->trimestre]);
        $photos = FotoEjercicio::whereIn('id_evaluacion', $evaluations->pluck('id'))->where('id_estudiante', $student->id)->get()->keyBy(fn ($item) => $item->id_evaluacion.':'.$item->id_ejercicio);
        $observations = Observacion::where('id_estudiante', $student->id)->whereIn('id_evaluacion', $evaluations->pluck('id'))
            ->with('autorUsuario:id,nombre')->orderByDesc('created_at')->orderByDesc('id')->get();
        // Última observación de cada celda (Evaluación × Ejercicio).
        $lastByCell = $observations->whereNotNull('id_ejercicio')->unique(fn ($item) => $item->id_evaluacion.':'.$item->id_ejercicio)
            ->keyBy(fn ($item) => $item->id_evaluacion.':'.$item->id_ejercicio);
        $rows = collect(self::EXERCISES)->map(function ($legacyType, $token) use ($evaluations, $exerciseCatalog, $photos, $lastByCell) {
            $byTerm = [];
            foreach ([1, 2, 3] as $term) {
                $evaluation = $evaluations->get($term);
                $key = $evaluation ? $evaluation->id.':'.$exerciseCatalog[$token]->id : null;
                $photo = $key ? $photos->get($key) : null;
                $byTerm['T'.$term] = [
                    'estado' => $photo?->estado, 'valoracion' => $photo?->valoracion, 'id_foto' => $photo?->id,
                    'observacion' => $key ? $lastByCell->get($key)?->texto : null,
                ];
            }
            return ['ejercicio' => $token, 'nombre' => $exerciseCatalog[$token]->nombre, 'T1' => $byTerm['T1'], 'T2' => $byTerm['T2'], 'T3' => $byTerm['T3']];
        })->values();
        $terms = collect([1, 2, 3])->mapWithKeys(fn ($term) => ['T'.$term => $evaluations->has($term)
            ? ['id_evaluacion' => $evaluations[$term]->id, 'nivel' => $evaluations[$term]->nivel] : null]);
        return response()->json(['data' => [
            'estudiante' => ['id' => $student->id, 'nombre' => $student->nombre, 'curso' => $student->curso ? ['id' => $student->curso->id, 'nombre' => $student->curso->nombre] : null],
            'trimestres' => $terms,
            'ejercicios' => $rows,
            'observaciones' => $observations->map(fn ($item) => [
                'id' => $item->id, 'texto' => $item->texto, 'trimestre' => $termByEvaluation[$item->id_evaluacion] ?? null,
                'ejercicio' => $item->id_ejercicio ? ($tokenById[$item->id_ejercicio] ?? null) : null,
                'autor' => $item->autorUsuario ? ['id' => $item->autorUsuario->id, 'nombre' => $item->autorUsuario->nombre] : null,
                'fecha' => $item->created_at?->toIso8601String(),
            ])->values(),
        ]]);
    }

    public function report(Request $request, int $courseId): JsonResponse
    {
        $term = $request->integer('trimestre');
        abort_unless(in_array($term, [1, 2, 3], true), 422, 'El trimestre debe ser 1, 2 o 3.');
        $course = Course::findOrFail($courseId);
        Gate::authorize('view', $course);
        $evaluation = Evaluacion::where('id_curso', $course->id)->where('trimestre', $term)->first();
        $counts = [];
        $needsObservation = [];
        $completion = ['estudiantes_completos' => 0, 'total_estudiantes' => $course->estudiantes()->count()];
        if ($evaluation) {
            $exercises = $this->exerciseCatalog();
            foreach (self::EXERCISES as $token => $legacyType) {
                $exercise = $exercises[$token];
                $counts[$token] = collect(['S', 'ED', 'NA'])->mapWithKeys(fn ($rating) => [$rating => $evaluation->fotos()->where('id_ejercicio', $exercise->id)->where('valoracion', $rating)->count()]);
            }
            foreach ($course->estudiantes()->get() as $student) {
                $rated = $evaluation->fotos()->where('id_estudiante', $student->id)->where('estado', 'valorado')->count();
                if ($rated === 4) $completion['estudiantes_completos']++;
                $na = $evaluation->fotos()->where('id_estudiante', $student->id)->where('valoracion', 'NA')->count();
                if ($na >= 2) $needsObservation[] = ['id' => $student->id, 'nombre' => $student->nombre, 'cantidad_NA' => $na];
            }
        }
        return response()->json(['data' => ['curso_id' => $course->id, 'trimestre' => $term, 'conteos' => $counts, 'completitud' => $completion, 'requieren_observacion' => $needsObservation]]);
    }

    public function directionCourses(Request $request): JsonResponse
    {
        abort_unless($request->user()->esDireccion(), 403);
        $courses = $request->user()->cursosAccesibles()->with('docente:id,nombre')->withCount('estudiantes')->get();
        $data = $courses->map(function (Course $course) {
            $evaluation = $course->evaluaciones()->orderByDesc('trimestre')->first();
            $total = $course->estudiantes_count;
            $rated = $evaluation ? $evaluation->fotos()->where('estado', 'valorado')->count() : 0;
            $allSlots = max(1, $total * 4);
            $complete = $evaluation ? $evaluation->fotos()->select('id_estudiante')->where('estado', 'valorado')
                ->groupBy('id_estudiante')->havingRaw('COUNT(DISTINCT id_ejercicio) = 4')->count() : 0;
            return ['estudiantes_completos' => $complete, 'total_estudiantes' => $total, 'nivel' => $evaluation?->nivel, 'id' => $course->id, 'curso' => $course->nombre, 'docente' => $course->docente?->nombre, 'evaluacion_completa' => $total > 0 && $rated === $total * 4, 'valoraciones' => ['S' => $evaluation?->fotos()->where('valoracion', 'S')->count() ?? 0, 'ED' => $evaluation?->fotos()->where('valoracion', 'ED')->count() ?? 0, 'NA' => $evaluation?->fotos()->where('valoracion', 'NA')->count() ?? 0], 'completitud' => round(100 * $rated / $allSlots, 1), 'trimestre' => $evaluation?->trimestre];
        });
        return response()->json(['data' => $data]);
    }

    public function stages(Request $request, int $photoId): JsonResponse
    {
        $photo = FotoEjercicio::with('analisis')->findOrFail($photoId);
        Gate::authorize('view', $photo);
        $routes = $photo->analisis?->rutas_etapas ?? [];
        $stages = [];
        foreach (['original', 'grises', 'trazo', 'esqueleto'] as $key) {
            $path = $routes[$key] ?? null;
            $stages[$key] = $path && Storage::disk('private')->exists($path)
                ? 'data:image/png;base64,'.base64_encode(Storage::disk('private')->get($path)) : null;
        }
        return response()->json(['data' => $stages]);
    }

    private function exerciseCatalog(): array
    {
        $catalog = [];
        foreach (self::EXERCISES as $token => $type) {
            $matches = Exercise::where('tipo_trazo', $type)->where('activo', true)->orderBy('id')->get();
            abort_if($matches->count() !== 1, 503, "El catálogo debe contener exactamente un ejercicio activo de tipo {$type}.");
            $catalog[$token] = $matches->first();
        }
        return $catalog;
    }

    private function ensureSlots(Evaluacion $evaluation, array $exercises): void
    {
        $students = Student::where('id_curso', $evaluation->id_curso)->get(['id']);
        foreach ($students as $student) {
            foreach ($exercises as $exercise) {
                FotoEjercicio::firstOrCreate([
                    'id_evaluacion' => $evaluation->id,
                    'id_estudiante' => $student->id,
                    'id_ejercicio' => $exercise->id,
                ], ['fecha' => $evaluation->fecha, 'estado' => 'sin_foto']);
            }
        }
    }
}
