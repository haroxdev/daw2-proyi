<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TimesheetCrearRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'inicio_periodo' => ['required', 'date'],
            'fin_periodo' => ['required', 'date', 'after_or_equal:inicio_periodo'],
        ];
    }
}
