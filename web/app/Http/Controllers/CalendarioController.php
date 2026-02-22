<?php

namespace App\Http\Controllers;

use App\Services\CalendarioService;
use App\Services\AuditoriaService;
use App\Http\Requests\EventoCalendarioRequest;
use Illuminate\Http\Request;

class CalendarioController extends Controller
{
    public function __construct(private CalendarioService $service, private AuditoriaService $auditoria)
    {
    }

    public function misEventos(Request $request)
    {
        $empleado = $request->user();
        $eventos = $this->service->eventosPersona($empleado);
        return response()->json($eventos);
    }

    public function misAusencias(Request $request)
    {
        $empleado = $request->user();
        $eventos = $this->service->ausenciasComoEventos($empleado->id_empleado);
        return response()->json($eventos);
    }

    public function crear(EventoCalendarioRequest $request)
    {
        $empleado = $request->user();
        $evento = $this->service->crearEvento($empleado, $request->validated());
        $this->auditoria->registrar($empleado, 'evento_creado', 'evento_calendario', $evento->id_evento);

        if ($request->expectsJson()) {
            return response()->json($evento);
        }

        return back()->with('success', 'Evento creado');
    }
}
