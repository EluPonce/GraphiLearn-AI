<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Evaluacion extends Model
{
    protected $table = 'evaluaciones';
    protected $fillable = ['id_curso', 'trimestre', 'nivel', 'tamano_figura_mm', 'fecha'];
    protected function casts(): array { return ['trimestre' => 'integer', 'nivel' => 'integer', 'tamano_figura_mm' => 'float', 'fecha' => 'date']; }
    public function curso(): BelongsTo { return $this->belongsTo(Course::class, 'id_curso'); }
    public function fotos(): HasMany { return $this->hasMany(FotoEjercicio::class, 'id_evaluacion'); }
    public function observaciones(): HasMany { return $this->hasMany(Observacion::class, 'id_evaluacion'); }
}
