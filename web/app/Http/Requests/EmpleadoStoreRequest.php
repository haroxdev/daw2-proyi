<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class EmpleadoStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole(['admin', 'responsable']) ?? false;
    }

    public function rules(): array
    {
        return [
            'dni' => ['required', 'string', 'max:15', 'unique:empleado,dni'],
            'nombre' => ['required', 'string', 'max:50'],
            'apellido1' => ['required', 'string', 'max:50'],
            'apellido2' => ['nullable', 'string', 'max:50'],
            'email' => ['required', 'email', 'max:100', 'unique:empleado,email'],
            'contrasena' => ['required', 'string', 'min:8'],
            'estado' => ['nullable', Rule::in(['alta', 'baja', 'baja_temporal'])],
            'dias_vacaciones_restantes' => ['nullable', 'integer', 'min:0'],
            'id_departamento' => ['nullable', 'integer', 'exists:departamento,id_departamento'],
            'roles' => ['nullable', 'array'],
            'roles.*' => ['integer', 'exists:rol,id_rol'],
        ];
    }
}
