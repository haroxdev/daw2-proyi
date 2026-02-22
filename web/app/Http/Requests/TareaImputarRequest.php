<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TareaImputarRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'inicio' => ['required', 'date'],
            'fin' => ['nullable', 'date'],
        ];
    }
}
