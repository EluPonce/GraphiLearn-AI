<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class AnalysisResult extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'analysis_results';

    protected $fillable = [
        'actividad_id',
        'imagen_id',
        'tipo_trazo',
        'longitud_trazo',
        'alto',
        'ancho',
        'proporcion',
        'inclinacion',
        'curvatura',
        'separacion_componentes',
        'posicion_normalizada',
        'desviacion',
        'rugosidad',
        'continuidad',
        'regularidad',
        'risk_label',
        'risk_score',
        'model_version_id',
        'estado',
        'estado_revision',
        'error_message',
        'detalles_computacionales',
    ];

    protected function casts(): array
    {
        return [
            'posicion_normalizada'     => 'array',
            'detalles_computacionales' => 'array',
            'longitud_trazo'           => 'float',
            'alto'                     => 'integer',
            'ancho'                    => 'integer',
            'proporcion'               => 'float',
            'inclinacion'              => 'float',
            'curvatura'                => 'float',
            'separacion_componentes'   => 'float',
            'desviacion'               => 'float',
            'rugosidad'                => 'float',
            'continuidad'              => 'float',
            'regularidad'              => 'float',
            'risk_score'               => 'float',
        ];
    }

    /**
     * Actividad a la que pertenece este resultado.
     */
    public function actividad(): BelongsTo
    {
        return $this->belongsTo(Actividad::class, 'actividad_id');
    }

    /**
     * Imagen analizada.
     */
    public function imagen(): BelongsTo
    {
        return $this->belongsTo(Imagen::class, 'imagen_id');
    }

    /**
     * Versión del modelo de clasificación utilizada.
     */
    public function modelVersion(): BelongsTo
    {
        return $this->belongsTo(ModelVersion::class, 'model_version_id');
    }
}
