<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SolicitarCorreccionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nuevo_inicio' => ['nullable', 'date'],
            'nuevo_fin' => ['nullable', 'date'],
            'motivo' => ['nullable', 'string'],
        ];
    }
}
