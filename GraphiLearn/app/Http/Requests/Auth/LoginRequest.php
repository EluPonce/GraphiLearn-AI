<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class LoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'correo'   => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'correo.required'   => 'El correo electrónico es obligatorio.',
            'correo.email'      => 'Debe ingresar un correo electrónico válido.',
            'password.required' => 'La contraseña es obligatoria.',
        ];
    }
}
