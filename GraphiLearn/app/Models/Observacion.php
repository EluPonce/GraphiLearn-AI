<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Observacion extends Model
{
    protected $table = 'observaciones';
    protected $fillable = ['id_estudiante', 'id_evaluacion', 'id_ejercicio', 'texto', 'autor'];
    public function estudiante(): BelongsTo { return $this->belongsTo(Student::class, 'id_estudiante'); }
    public function evaluacion(): BelongsTo { return $this->belongsTo(Evaluacion::class, 'id_evaluacion'); }
    public function ejercicio(): BelongsTo { return $this->belongsTo(Exercise::class, 'id_ejercicio'); }
    public function autorUsuario(): BelongsTo { return $this->belongsTo(User::class, 'autor'); }
}
