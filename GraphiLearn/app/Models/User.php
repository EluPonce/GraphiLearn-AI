<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * Atributos asignables en masa.
     *
     * @var list<string>
     */
    protected $fillable = [
        'institution_id',
        'nombre',
        'correo',
        'password',
        'rol',
        'active',
    ];

    /**
     * Atributos ocultos para serialización.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Casts de atributos.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password'          => 'hashed',
            'active'            => 'boolean',
        ];
    }

    /**
     * Sanctum y los guards de Laravel usan 'email' como identificador.
     * Mapeamos 'correo' como email para compatibilidad total.
     */
    public function getEmailAttribute(): string
    {
        return $this->correo ?? '';
    }

    public function getEmailForPasswordReset(): string
    {
        return $this->correo;
    }

    /**
     * Institución a la que pertenece el usuario.
     */
    public function institucion(): BelongsTo
    {
        return $this->belongsTo(Institution::class, 'institution_id');
    }

    /**
     * Cursos donde el usuario es docente asignado.
     */
    public function cursos(): HasMany
    {
        return $this->hasMany(Course::class, 'id_docente');
    }

    // -------------------------------------------------------------------------
    // Helpers de rol
    // -------------------------------------------------------------------------

    public function esAdministrador(): bool
    {
        return $this->rol === 'administrador';
    }

    public function esDocente(): bool
    {
        return $this->rol === 'docente';
    }

    public function esDireccion(): bool
    {
        return $this->rol === 'direccion';
    }

    /**
     * Central access rule for courses in the user's institution or assignment.
     */
    public function puedeAccederAlCurso(?Course $course): bool
    {
        if (! $course) {
            return false;
        }

        if ($this->esDireccion()) {
            return $this->institution_id !== null
                && (int) $course->institution_id === (int) $this->institution_id;
        }

        // Historical course records remain readable after deactivation.
        return $this->esDocente() && (int) $course->id_docente === (int) $this->id;
    }

    public function cursosAccesibles(): Builder
    {
        $query = Course::query();

        if ($this->esDireccion()) {
            return $query->where('institution_id', $this->institution_id);
        }

        if ($this->esDocente()) {
            return $query->where('id_docente', $this->id);
        }

        return $query->whereRaw('1 = 0');
    }

    public function puedeAccederAlEstudiante(Student $student): bool
    {
        $student->loadMissing('curso');

        return $this->puedeAccederAlCurso($student->curso);
    }
}
