<?php

namespace App\Http\Requests\Evaluacion;

use Illuminate\Foundation\Http\FormRequest;

class StoreEvaluacionRequest extends FormRequest
{
    public function authorize(): bool { return $this->user()?->esDocente() ?? false; }
    public function rules(): array
    {
        return [
            'id_curso' => ['required', 'integer', 'exists:courses,id'],
            'trimestre' => ['required', 'integer', 'between:1,3'],
            'nivel' => ['required', 'integer', 'between:1,3'],
            'tamano_figura_mm' => ['required', 'numeric', 'gt:0', 'max:500'],
            'fecha' => ['sometimes', 'date'],
        ];
    }
}
