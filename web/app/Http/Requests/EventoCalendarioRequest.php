<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class EventoCalendarioRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();
        $tipo = $this->input('tipo', 'personal');
        if (in_array($tipo, ['equipo', 'compania'], true)) {
            return $user && $user->hasRole(['admin', 'responsable']);
        }

        return $user !== null;
    }

    public function rules(): array
    {
        return [
            'titulo' => ['required', 'string', 'max:100'],
            'descripcion' => ['nullable', 'string'],
            'inicio' => ['required', 'date'],
            'fin' => ['nullable', 'date', 'after_or_equal:inicio'],
            'tipo' => ['nullable', 'in:personal,equipo,compania'],
            'ubicacion' => ['nullable', 'string', 'max:150'],
            'todo_dia' => ['nullable', 'boolean'],
        ];
    }
}
