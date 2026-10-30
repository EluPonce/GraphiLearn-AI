<?php

namespace App\Http\Requests\Actividad;

use Illuminate\Foundation\Http\FormRequest;

class StoreActividadRequest extends FormRequest
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
            'id_estudiante' => ['required', 'integer', 'exists:students,id'],
            'id_ejercicio'  => ['required', 'integer', 'exists:exercises,id'],
            'fecha'         => ['required', 'date', 'before_or_equal:today'],
        ];
    }

    public function messages(): array
    {
        return [
            'id_estudiante.required' => 'Debe seleccionar un estudiante.',
            'id_estudiante.exists'   => 'El estudiante seleccionado no existe.',
            'id_ejercicio.required'  => 'Debe seleccionar un ejercicio.',
            'id_ejercicio.exists'    => 'El ejercicio seleccionado no existe.',
            'fecha.required'         => 'La fecha de la actividad es obligatoria.',
            'fecha.date'             => 'La fecha debe tener un formato válido.',
            'fecha.before_or_equal'  => 'La fecha no puede ser futura.',
        ];
    }
}
