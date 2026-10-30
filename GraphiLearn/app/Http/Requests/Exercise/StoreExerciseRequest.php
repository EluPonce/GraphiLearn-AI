<?php

namespace App\Http\Requests\Exercise;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreExerciseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Autorización por Policy en el controller
    }

    /**
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'nombre'      => ['required', 'string', 'max:255'],
            'tipo_trazo'  => ['required', Rule::in(['linea', 'circulo', 'espiral', 'zigzag'])],
            'descripcion' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'nombre.required'     => 'El nombre del ejercicio es obligatorio.',
            'nombre.max'          => 'El nombre no puede superar los 255 caracteres.',
            'tipo_trazo.required' => 'El tipo de trazo es obligatorio.',
            'tipo_trazo.in'       => 'El tipo de trazo debe ser uno de: línea, círculo, espiral, zigzag.',
            'descripcion.max'     => 'La descripción no puede superar los 1000 caracteres.',
        ];
    }
}
