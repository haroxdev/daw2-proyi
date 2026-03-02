<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class EmpleadoUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        $usuario = $this->user();
        if (!$usuario) return false;

        // admin puede editar a cualquiera
        if ($usuario->hasRole('admin')) return true;

        // responsable solo puede editar empleados sin rol admin/responsable
        if ($usuario->hasRole('responsable')) {
            $objetivo = $this->route('empleado');
            return !$objetivo->hasRole(['admin', 'responsable']);
        }

        return false;
    }

    public function rules(): array
    {
        $empleado = $this->route('empleado');

        return [
            'dni' => ['required', 'string', 'max:15', Rule::unique('empleado', 'dni')->ignore($empleado->id_empleado, 'id_empleado')],
            'nombre' => ['required', 'string', 'max:50'],
            'apellido1' => ['required', 'string', 'max:50'],
            'apellido2' => ['nullable', 'string', 'max:50'],
            'email' => ['required', 'email', 'max:100', Rule::unique('empleado', 'email')->ignore($empleado->id_empleado, 'id_empleado')],
            'contrasena' => ['nullable', 'string', 'min:8'],
            'estado' => ['nullable', Rule::in(['alta', 'baja', 'baja_temporal'])],
            'dias_vacaciones_restantes' => ['nullable', 'integer', 'min:0'],
            'id_departamento' => ['nullable', 'integer', 'exists:departamento,id_departamento'],
            'roles' => ['nullable', 'array'],
            'roles.*' => ['integer', 'exists:rol,id_rol'],
        ];
    }
}
