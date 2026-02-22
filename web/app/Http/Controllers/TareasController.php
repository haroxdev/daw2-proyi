<?php

namespace App\Http\Controllers;

use App\Http\Requests\TareaActualizarRequest;
use App\Http\Requests\TareaAsignarRequest;
use App\Http\Requests\TareaCrearRequest;
use App\Http\Requests\TareaImputarRequest;
use App\Http\Requests\TiempoCerrarRequest;
use App\Models\Empleado;
use App\Models\Tarea;
use App\Models\TiempoTarea;
use App\Services\AuditoriaService;
use App\Services\NotificacionesService;
use App\Services\TareasService;
use Carbon\Carbon;

class TareasController extends Controller
{
    public function __construct(private TareasService $service, private AuditoriaService $auditoria, private NotificacionesService $notificaciones)
    {
    }

    public function crear(TareaCrearRequest $request)
    {
        $tarea = $this->service->crearTarea($request->validated());
        $this->auditoria->registrar($request->user(), 'tarea_creada', 'tarea', $tarea->id_tarea);

        if ($request->expectsJson()) {
            return response()->json($tarea->load(['proyecto', 'empleado']));
        }

        return back()->with('success', 'Tarea creada');
    }

    public function actualizar(TareaActualizarRequest $request, Tarea $tarea)
    {
        $tarea = $this->service->actualizarTarea($tarea, $request->validated());
        $this->auditoria->registrar($request->user(), 'tarea_actualizada', 'tarea', $tarea->id_tarea);

        if ($request->expectsJson()) {
            return response()->json($tarea->load(['proyecto', 'empleado']));
        }

        return back()->with('success', 'Tarea actualizada');
    }

    public function eliminar(Tarea $tarea)
    {
        $idTarea = $tarea->id_tarea;
        $this->service->eliminarTarea($tarea);
        $this->auditoria->registrar(request()->user(), 'tarea_eliminada', 'tarea', $idTarea);

        return response()->json(['message' => 'Tarea eliminada']);
    }

    public function asignar(TareaAsignarRequest $request, Tarea $tarea)
    {
        // soporta multi-asignación (array) o asignación simple (id_empleado)
        $empleadosIds = $request->validated('empleados')
            ?? ($request->validated('id_empleado') ? [$request->validated('id_empleado')] : []);

        $tarea = $this->service->asignarEmpleados($tarea, $empleadosIds);
        $this->auditoria->registrar($request->user(), 'tarea_asignada', 'tarea', $tarea->id_tarea);

        // notifica a cada empleado asignado
        foreach ($empleadosIds as $empId) {
            $emp = Empleado::find($empId);
            if ($emp) {
                $this->notificaciones->enviar($emp, 'Tienes una tarea: '.$tarea->titulo, 'tarea');
            }
        }

        if ($request->expectsJson()) {
            return response()->json($tarea->load('empleados'));
        }

        return back()->with('success', 'Asignacion actualizada');
    }

    public function imputarTiempo(TareaImputarRequest $request, Tarea $tarea)
    {
        /** @var Empleado $empleado */
        $empleado = $request->user();

        $tiempo = $this->service->imputarTiempo(
            $tarea,
            $empleado,
            Carbon::parse($request->validated('inicio')),
            $request->validated('fin') ? Carbon::parse($request->validated('fin')) : null
        );

        $this->auditoria->registrar($empleado, 'tarea_imputar', 'tiempo_tarea', $tiempo->id_tiempo);

        return response()->json($tiempo);
    }

    public function cerrarTimer(TiempoCerrarRequest $request, TiempoTarea $tiempo)
    {
        $tiempo = $this->service->cerrarTimer($tiempo, Carbon::parse($request->validated('fin')));

        $this->auditoria->registrar($request->user(), 'tarea_timer_cerrar', 'tiempo_tarea', $tiempo->id_tiempo);

        return response()->json($tiempo);
    }
}
