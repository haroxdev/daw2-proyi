<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ChatEnviarRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'id_destinatario' => ['required', 'integer', 'exists:empleado,id_empleado'],
            'mensaje' => ['required', 'string', 'max:1000'],
        ];
    }
}
