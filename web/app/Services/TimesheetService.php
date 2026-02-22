<?php

namespace App\Services;

use App\Models\Empleado;
use App\Models\Timesheet;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class TimesheetService
{
    public function crearBorrador(Empleado $empleado, array $periodo): Timesheet
    {
        return Timesheet::create([
            'id_empleado' => $empleado->id_empleado,
            'inicio_periodo' => $periodo['inicio_periodo'],
            'fin_periodo' => $periodo['fin_periodo'],
            'estado' => 'borrador',
        ]);
    }

    public function enviar(Timesheet $timesheet): Timesheet
    {
        if ($timesheet->estado !== 'borrador') {
            throw ValidationException::withMessages([
                'estado' => 'Solo borrador puede enviarse',
            ]);
        }

        $timesheet->estado = 'enviado';
        $timesheet->save();
        return $timesheet;
    }

    public function revisar(Timesheet $timesheet, Empleado $aprobador, string $decision, ?string $comentario = null): Timesheet
    {
        if (! in_array($decision, ['aprobado', 'rechazado'], true)) {
            throw ValidationException::withMessages([
                'estado' => 'Decision invalida',
            ]);
        }

        DB::transaction(function () use ($timesheet, $aprobador, $decision, $comentario) {
            $timesheet->update([
                'estado' => $decision,
                'id_aprobador' => $aprobador->id_empleado,
                'comentario' => $comentario,
            ]);
        });

        return $timesheet->fresh();
    }
}
