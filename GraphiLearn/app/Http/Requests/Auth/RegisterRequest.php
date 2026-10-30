<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nombre' => ['required', 'string', 'max:255'],
            'correo' => ['required', 'string', 'email', 'max:255', 'unique:users,correo'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'rol' => ['required', 'string', Rule::in(['docente'])],
        ];
    }

    public function messages(): array
    {
        return [
            'nombre.required' => 'El nombre completo es obligatorio.',
            'correo.required' => 'El correo electrónico es obligatorio.',
            'correo.email' => 'El correo electrónico debe ser una dirección válida.',
            'correo.unique' => 'Este correo electrónico ya se encuentra registrado.',
            'password.required' => 'La contraseña es obligatoria.',
            'password.min' => 'La contraseña debe tener al menos 8 caracteres.',
            'password.confirmed' => 'La confirmación de la contraseña no coincide.',
            'rol.required' => 'El rol es obligatorio.',
            'rol.in' => 'El auto-registro solo está disponible para docentes.',
        ];
    }
}
