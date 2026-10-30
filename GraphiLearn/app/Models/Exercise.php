<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Exercise extends Model
{
    use HasFactory;

    protected $table = 'exercises';

    protected $fillable = [
        'nombre',
        'tipo_trazo',
        'descripcion',
        'activo',
    ];

    protected function casts(): array
    {
        return [
            'activo' => 'boolean',
        ];
    }

    /**
     * Actividades asociadas a este ejercicio.
     * Nota: un ejercicio no puede eliminarse si tiene actividades asociadas
     * (enforced via restrictOnDelete en la migración de actividades).
     */
    public function actividades(): HasMany
    {
        return $this->hasMany(Actividad::class, 'id_ejercicio');
    }

    /**
     * Indica si el ejercicio tiene actividades registradas.
     */
    public function tieneActividades(): bool
    {
        return $this->actividades()->exists();
    }
}
