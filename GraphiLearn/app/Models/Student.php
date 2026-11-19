<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Student extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'students';

    protected $fillable = [
        'id_curso',
        'nombre',
        'fecha_nacimiento',
    ];

    protected function casts(): array
    {
        return [
            'fecha_nacimiento' => 'date',
        ];
    }

    /**
     * Curso al que pertenece el estudiante.
     */
    public function curso(): BelongsTo
    {
        return $this->belongsTo(Course::class, 'id_curso');
    }

    /**
     * Actividades grafomotoras del estudiante.
     */
    public function actividades(): HasMany
    {
        return $this->hasMany(FotoEjercicio::class, 'id_estudiante');
    }

    public function fotosEjercicio(): HasMany
    {
        return $this->hasMany(FotoEjercicio::class, 'id_estudiante');
    }

    public function observaciones(): HasMany
    {
        return $this->hasMany(Observacion::class, 'id_estudiante');
    }
}
