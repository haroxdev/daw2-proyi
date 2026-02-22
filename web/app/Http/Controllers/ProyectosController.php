<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProyectoActualizarRequest;
use App\Http\Requests\ProyectoAsignarRequest;
use App\Http\Requests\ProyectoCrearRequest;
use App\Http\Requests\ProyectoEstadoRequest;
use App\Models\Empleado;
use App\Models\Proyecto;
use App\Services\AuditoriaService;
use App\Services\NotificacionesService;
use App\Services\ProyectosService;

class ProyectosController extends Controller
{
    public function __construct(private ProyectosService $service, private AuditoriaService $auditoria, private NotificacionesService $notificaciones)
    {
    }

    public function crear(ProyectoCrearRequest $request)
    {
        $proyecto = $this->service->crearProyecto($request->validated());
        $this->auditoria->registrar($request->user(), 'proyecto_creado', 'proyecto', $proyecto->id_proyecto);

        if ($request->expectsJson()) {
            return response()->json($proyecto);
        }

        return back()->with('success', 'Proyecto creado');
    }

    public function actualizar(ProyectoActualizarRequest $request, Proyecto $proyecto)
    {
        $proyecto = $this->service->actualizarProyecto($proyecto, $request->validated());
        $this->auditoria->registrar($request->user(), 'proyecto_actualizado', 'proyecto', $proyecto->id_proyecto);

        if ($request->expectsJson()) {
            return response()->json($proyecto);
        }

        return back()->with('success', 'Proyecto actualizado');
    }

    public function eliminar(Proyecto $proyecto)
    {
        $idProyecto = $proyecto->id_proyecto;
        $this->service->eliminarProyecto($proyecto);
        $this->auditoria->registrar(request()->user(), 'proyecto_eliminado', 'proyecto', $idProyecto);

        return response()->json(['message' => 'Proyecto eliminado']);
    }

    public function asignar(ProyectoAsignarRequest $request, Proyecto $proyecto)
    {
        $empleado = Empleado::findOrFail($request->validated('id_empleado'));

        $pivot = $this->service->asignarEmpleado($proyecto, $empleado);
        $this->auditoria->registrar($request->user(), 'proyecto_asignado', 'proyecto', $proyecto->id_proyecto);
        $this->notificaciones->enviar($empleado, 'Te asignaron al proyecto '.$proyecto->nombre, 'proyecto');

        if ($request->expectsJson()) {
            return response()->json($pivot);
        }

        return back()->with('success', 'Empleado asignado');
    }

    public function desasignar(ProyectoAsignarRequest $request, Proyecto $proyecto)
    {
        $empleado = Empleado::findOrFail($request->validated('id_empleado'));
        $this->service->desasignarEmpleado($proyecto, $empleado);
        $this->auditoria->registrar($request->user(), 'proyecto_desasignado', 'proyecto', $proyecto->id_proyecto);

        return response()->json(['message' => 'Empleado desasignado']);
    }

    public function estado(ProyectoEstadoRequest $request, Proyecto $proyecto)
    {
        $proyecto = $this->service->cambiarEstado($proyecto, $request->validated('estado'));
        $this->auditoria->registrar($request->user(), 'proyecto_estado', 'proyecto', $proyecto->id_proyecto);

        if ($request->expectsJson()) {
            return response()->json($proyecto);
        }

        return back()->with('success', 'Estado actualizado');
    }
}
