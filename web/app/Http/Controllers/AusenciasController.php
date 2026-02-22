<?php

namespace App\Http\Controllers;

use App\Http\Requests\AusenciaCrearRequest;
use App\Http\Requests\AusenciaResolverRequest;
use App\Models\Empleado;
use App\Models\Solicitud;
use App\Services\AusenciasService;
use App\Services\AuditoriaService;
use App\Services\NotificacionesService;

class AusenciasController extends Controller
{
    public function __construct(private AusenciasService $service, private AuditoriaService $auditoria, private NotificacionesService $notificaciones)
    {
    }

    public function crear(AusenciaCrearRequest $request)
    {
        /** @var Empleado $empleado */
        $empleado = $request->user();

        $solicitud = $this->service->crearSolicitud($empleado, $request->validated());
        $this->auditoria->registrar($empleado, 'ausencia_creada', 'solicitud', $solicitud->id_solicitud);

        if ($request->expectsJson()) {
            return response()->json($solicitud);
        }

        return back()->with('success', 'Solicitud enviada');
    }

    public function resolver(AusenciaResolverRequest $request, Solicitud $solicitud)
    {
        /** @var Empleado $empleado */
        $empleado = $request->user();

        $solicitud = $this->service->resolver($solicitud, $empleado, $request->validated('decision'));
        $this->auditoria->registrar($empleado, 'ausencia_resuelta', 'solicitud', $solicitud->id_solicitud);
        if ($solicitud->empleado) {
            $mensaje = 'Tu solicitud ha sido '.$solicitud->estado;
            $this->notificaciones->enviar($solicitud->empleado, $mensaje, 'ausencia');
        }

        if ($request->expectsJson()) {
            return response()->json($solicitud);
        }

        return back()->with('success', 'Solicitud actualizada');
    }
}
