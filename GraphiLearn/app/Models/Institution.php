<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Institution extends Model
{
    use HasFactory;

    protected $table = 'institutions';

    protected $fillable = [
        'nombre',
    ];

    /**
     * Usuarios (docentes y administradores) de esta institución.
     */
    public function usuarios(): HasMany
    {
        return $this->hasMany(User::class, 'institution_id');
    }

    /**
     * Cursos de esta institución.
     */
    public function cursos(): HasMany
    {
        return $this->hasMany(Course::class, 'institution_id');
    }
}
