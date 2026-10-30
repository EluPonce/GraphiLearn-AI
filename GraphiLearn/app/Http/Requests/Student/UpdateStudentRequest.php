<?php

namespace App\Http\Requests\Student;

use Illuminate\Foundation\Http\FormRequest;

class UpdateStudentRequest extends FormRequest
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
            'nombre'           => ['sometimes', 'required', 'string', 'max:255'],
            'fecha_nacimiento' => ['sometimes', 'required', 'date', 'before:today'],
            'id_curso'         => ['sometimes', 'required', 'integer', 'exists:courses,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'nombre.required'           => 'El nombre del estudiante es obligatorio.',
            'nombre.max'                => 'El nombre no puede superar los 255 caracteres.',
            'fecha_nacimiento.required' => 'La fecha de nacimiento es obligatoria.',
            'fecha_nacimiento.date'     => 'La fecha de nacimiento debe ser una fecha válida.',
            'fecha_nacimiento.before'   => 'La fecha de nacimiento debe ser anterior a hoy.',
            'id_curso.required'         => 'Debe seleccionar un curso.',
            'id_curso.exists'           => 'El curso seleccionado no existe.',
        ];
    }
}
