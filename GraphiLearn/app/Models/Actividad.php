<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Actividad extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'actividades';

    protected $fillable = [
        'id_estudiante',
        'id_ejercicio',
        'scheduled_activity_id',
        'fecha',
        'estado',
        'fecha_procesado',
        'evaluated_by',
        'pedagogical_rating',
        'pedagogical_observations',
        'period_reference',
    ];

    protected function casts(): array
    {
        return [
            'fecha' => 'date',
            'fecha_procesado' => 'datetime',
        ];
    }

    /**
     * Estudiante al que pertenece la actividad.
     */
    public function estudiante(): BelongsTo
    {
        return $this->belongsTo(Student::class, 'id_estudiante');
    }

    /**
     * Ejercicio grafomotor de la actividad.
     */
    public function ejercicio(): BelongsTo
    {
        return $this->belongsTo(Exercise::class, 'id_ejercicio');
    }

    /**
     * Imagen asociada a la actividad (0 o 1).
     */
    public function imagen(): HasOne
    {
        return $this->hasOne(Imagen::class, 'id_actividad');
    }

    /**
     * Indica si la actividad ya tiene imagen cargada.
     */
    public function tieneImagen(): bool
    {
        return $this->imagen()->exists();
    }
    /**
     * Resultado de análisis asociado a la actividad (uno a uno).
     */
    public function analysisResult(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(\App\Models\AnalysisResult::class, 'actividad_id');
    }

    public function scheduledActivity(): BelongsTo
    {
        return $this->belongsTo(ScheduledActivity::class, 'scheduled_activity_id');
    }

    public function evaluatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'evaluated_by');
    }

    public function evaluationHistory(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(ActivityEvaluationHistory::class, 'actividad_id');
    }

}
