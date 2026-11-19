<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class FotoEjercicio extends Model
{
    protected $table = 'fotos_ejercicio';
    protected $fillable = ['id_evaluacion', 'id_estudiante', 'id_ejercicio', 'fecha', 'ruta_imagen', 'estado', 'valoracion', 'valorado_por', 'valorado_en', 'scheduled_activity_id', 'fecha_procesado'];
    protected function casts(): array { return ['fecha' => 'date', 'valorado_en' => 'datetime', 'fecha_procesado' => 'datetime']; }
    public function evaluacion(): BelongsTo { return $this->belongsTo(Evaluacion::class, 'id_evaluacion'); }
    public function estudiante(): BelongsTo { return $this->belongsTo(Student::class, 'id_estudiante'); }
    public function ejercicio(): BelongsTo { return $this->belongsTo(Exercise::class, 'id_ejercicio'); }
    public function valoradoPor(): BelongsTo { return $this->belongsTo(User::class, 'valorado_por'); }
    public function analisis(): HasOne { return $this->hasOne(Analisis::class, 'id_foto'); }
}
