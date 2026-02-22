<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AusenciaResolverRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'decision' => ['required', 'in:aprobada,rechazada'],
        ];
    }
}
