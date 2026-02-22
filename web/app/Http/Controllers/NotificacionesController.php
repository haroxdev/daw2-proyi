<?php

namespace App\Http\Controllers;

use App\Models\Notificacion;
use App\Services\NotificacionesService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class NotificacionesController extends Controller
{
    public function __construct(private NotificacionesService $service)
    {
    }

    public function marcarLeida(Request $request, Notificacion $notificacion)
    {
        if ($request->user()?->id_empleado !== $notificacion->id_empleado) {
            abort(Response::HTTP_FORBIDDEN);
        }

        $this->service->marcarLeida($notificacion);

        if ($request->expectsJson()) {
            return response()->json($notificacion);
        }

        return back()->with('success', 'Notificacion marcada como leida');
    }

    public function marcarTodas(Request $request)
    {
        $empleado = $request->user();
        $this->service->marcarTodas($empleado);

        if ($request->expectsJson()) {
            return response()->json(['ok' => true]);
        }

        return back()->with('success', 'Notificaciones limpiadas');
    }
}
