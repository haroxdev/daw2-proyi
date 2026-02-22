<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class FichajeSalidaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'hora' => ['required', 'date'],
        ];
    }
}
