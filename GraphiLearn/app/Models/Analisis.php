<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Analisis extends Model
{
    protected $table = 'analisis';
    protected $fillable = ['id_foto', 'tipo_trazo', 'indicadores', 'caracteristicas', 'rutas_etapas', 'sugerencia', 'id_modelo', 'estado', 'error_message', 'detalles_computacionales'];
    protected function casts(): array { return ['indicadores' => 'array', 'caracteristicas' => 'array', 'rutas_etapas' => 'array', 'detalles_computacionales' => 'array']; }
    public function foto(): BelongsTo { return $this->belongsTo(FotoEjercicio::class, 'id_foto'); }
    public function modelo(): BelongsTo { return $this->belongsTo(ModelVersion::class, 'id_modelo'); }
}
