<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TareaActualizarRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'id_proyecto' => ['sometimes', 'required', 'integer', 'exists:proyecto,id_proyecto'],
            'id_empleado' => ['nullable', 'integer', 'exists:empleado,id_empleado'],
            'titulo' => ['sometimes', 'required', 'string', 'max:100'],
            'descripcion' => ['nullable', 'string'],
            'prioridad' => ['nullable', 'in:baja,media,alta'],
            'estado' => ['nullable', 'in:pendiente,en_proceso,finalizada'],
        ];
    }
}
