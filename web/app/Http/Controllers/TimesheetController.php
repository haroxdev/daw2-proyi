<?php

namespace App\Http\Controllers;

use App\Http\Requests\TimesheetCrearRequest;
use App\Http\Requests\TimesheetRevisarRequest;
use App\Models\Empleado;
use App\Models\Timesheet;
use App\Services\AuditoriaService;
use App\Services\NotificacionesService;
use App\Services\TimesheetService;
use Illuminate\Http\Request;

class TimesheetController extends Controller
{
    public function __construct(private TimesheetService $service, private AuditoriaService $auditoria, private NotificacionesService $notificaciones)
    {
    }

    public function crear(TimesheetCrearRequest $request)
    {
        /** @var Empleado $empleado */
        $empleado = $request->user();

        $timesheet = $this->service->crearBorrador($empleado, $request->validated());
        $this->auditoria->registrar($empleado, 'timesheet_creado', 'timesheet', $timesheet->id_timesheet);

        if ($request->expectsJson()) {
            return response()->json($timesheet);
        }

        return back()->with('success', 'Timesheet creado');
    }

    public function enviar(Request $request, Timesheet $timesheet)
    {
        $timesheet = $this->service->enviar($timesheet);
        $this->auditoria->registrar($request->user(), 'timesheet_enviado', 'timesheet', $timesheet->id_timesheet);

        if ($request->expectsJson()) {
            return response()->json($timesheet);
        }

        return back()->with('success', 'Timesheet enviado');
    }

    public function revisar(TimesheetRevisarRequest $request, Timesheet $timesheet)
    {
        /** @var Empleado $empleado */
        $empleado = $request->user();

        $timesheet = $this->service->revisar($timesheet, $empleado, $request->validated('decision'), $request->validated('comentario'));
        $this->auditoria->registrar($empleado, 'timesheet_revisado', 'timesheet', $timesheet->id_timesheet);
        if ($timesheet->empleado) {
            $mensaje = 'Tu timesheet ha sido '.$timesheet->estado;
            $this->notificaciones->enviar($timesheet->empleado, $mensaje, 'timesheet');
        }

        if ($request->expectsJson()) {
            return response()->json($timesheet);
        }

        return back()->with('success', 'Timesheet actualizado');
    }
}
