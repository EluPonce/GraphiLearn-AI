<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ActivityEvaluationHistory extends Model
{
    public $timestamps = false;
    protected $table = 'activity_evaluation_history';
    protected $fillable = ['actividad_id', 'changed_by', 'pedagogical_rating', 'pedagogical_observations'];

    public function changedBy(): BelongsTo { return $this->belongsTo(User::class, 'changed_by'); }
}
