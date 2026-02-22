<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AusenciaCrearRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'id_tipo' => ['required', 'integer', 'exists:tipo_ausencia,id_tipo'],
            'inicio' => ['required', 'date'],
            'fin' => ['required', 'date', 'after_or_equal:inicio'],
            'comentario' => ['nullable', 'string'],
        ];
    }
}
