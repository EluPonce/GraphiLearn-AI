<?php

namespace App\Http\Requests\FotoEjercicio;

use Illuminate\Foundation\Http\FormRequest;

class StoreFotoEjercicioRequest extends FormRequest
{
    public function authorize(): bool { return $this->user()?->esDocente() ?? false; }
    public function rules(): array
    {
        return [
            'foto' => ['required', 'file', 'mimes:jpg,jpeg,png', 'max:5120'],
        ];
    }
    public function messages(): array
    {
        return [
            'foto.mimes' => 'La foto debe estar en formato JPG o PNG.',
            'foto.max' => 'La foto no puede superar los 5 MB.',
        ];
    }
}
