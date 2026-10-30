<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ModelVersion extends Model
{
    use HasFactory;

    protected $table = 'model_versions';

    protected $fillable = [
        'name',
        'version',
        'algorithm',
        'description',
        'file_path',
        'metrics',
        'active',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'active' => 'boolean',
            'metrics' => 'array',
        ];
    }

    public function analysisResults(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(AnalysisResult::class, 'model_version_id');
    }

    public function creator(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function scopeActive($query)
    {
        return $query->where('active', true);
    }
}
