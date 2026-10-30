<?php

namespace App\Http\Requests\Imagen;

use Illuminate\Foundation\Http\FormRequest;

/**
 * UploadImagenRequest
 *
 * Validación de Form Request para la carga de imagen de una actividad.
 *
 * NOTA: Esta request valida los campos básicos del formulario multipart.
 * La validación profunda (MIME real, dimensiones, tamaño) la realiza
 * ImageValidationService, que trabaja sobre el archivo ya parseado.
 *
 * Sprint 2 agregará: validación de nitidez y contraste vía OpenCV en ai-service.
 */
class UploadImagenRequest extends FormRequest
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
            'imagen' => [
                'required',
                'file',
                'mimes:jpg,jpeg,png',        // Validación por extensión (primera barrera)
                'max:5120',                   // 5 MB en KB
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'imagen.required' => 'Debe adjuntar una imagen.',
            'imagen.file'     => 'El campo debe ser un archivo.',
            'imagen.mimes'    => 'Solo se permiten imágenes JPG, JPEG o PNG.',
            'imagen.max'      => 'La imagen no puede superar los 5 MB.',
        ];
    }
}
