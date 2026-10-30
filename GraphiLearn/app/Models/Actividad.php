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
        'fecha',
        'estado',
        'fecha_procesado',
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

}
