<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ScheduledActivity extends Model
{
    use SoftDeletes;

    protected $fillable = ['course_id', 'exercise_id', 'created_by', 'name', 'instructions', 'period_reference', 'scheduled_for', 'active'];

    protected function casts(): array
    {
        return ['scheduled_for' => 'date', 'active' => 'boolean'];
    }

    public function course(): BelongsTo { return $this->belongsTo(Course::class); }
    public function exercise(): BelongsTo { return $this->belongsTo(Exercise::class); }
    public function exercises(): BelongsToMany
    {
        return $this->belongsToMany(Exercise::class, 'scheduled_activity_exercises')
            ->withPivot(['id', 'position'])
            ->withTimestamps()
            ->orderByPivot('position');
    }
    public function creator(): BelongsTo { return $this->belongsTo(User::class, 'created_by'); }
    public function executions(): HasMany { return $this->hasMany(FotoEjercicio::class, 'scheduled_activity_id'); }
}
