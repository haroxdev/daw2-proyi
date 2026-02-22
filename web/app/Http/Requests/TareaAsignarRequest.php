<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TareaAsignarRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'id_empleado' => ['nullable', 'integer', 'exists:empleado,id_empleado'],
        ];
    }
}
