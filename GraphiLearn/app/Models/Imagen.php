<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Imagen extends Model
{
    use HasFactory;

    protected $table = 'imagenes';

    protected $fillable = [
        'id_actividad',
        'ruta',
        'formato',
        'fecha_carga',
    ];

    protected function casts(): array
    {
        return [
            'fecha_carga' => 'datetime',
        ];
    }

    /**
     * Actividad a la que pertenece esta imagen.
     */
    public function actividad(): BelongsTo
    {
        return $this->belongsTo(Actividad::class, 'id_actividad');
    }
}
