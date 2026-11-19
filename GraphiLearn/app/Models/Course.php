<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Course extends Model
{
    use HasFactory;

    protected $table = 'courses';

    protected $fillable = [
        'institution_id',
        'id_docente',
        'nombre',
        'nivel',
        'gestion',
        'active',
    ];

    protected function casts(): array
    {
        return ['active' => 'boolean'];
    }

    /**
     * Institución a la que pertenece el curso.
     */
    public function institucion(): BelongsTo
    {
        return $this->belongsTo(Institution::class, 'institution_id');
    }

    /**
     * Docente asignado al curso.
     */
    public function docente(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_docente');
    }

    /**
     * Estudiantes inscritos en el curso.
     */
    public function estudiantes(): HasMany
    {
        return $this->hasMany(Student::class, 'id_curso');
    }

    public function scheduledActivities(): HasMany
    {
        return $this->hasMany(ScheduledActivity::class, 'course_id');
    }

    public function evaluaciones(): HasMany
    {
        return $this->hasMany(Evaluacion::class, 'id_curso');
    }
}
