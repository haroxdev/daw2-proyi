<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Services\CalendarioService;
use Illuminate\Http\Request;

class CalendarioPageController extends Controller
{
    public function __construct(private CalendarioService $service)
    {
    }

    public function __invoke(Request $request)
    {
        $empleado = $request->user();
        $eventos = $this->service->eventosPersona($empleado);
        $ausencias = $this->service->ausenciasComoEventos($empleado->id_empleado);
        $equipo = $this->service->eventosEquipo();
        $compania = $this->service->eventosCompania();

        return view('calendario.index', compact('eventos', 'ausencias', 'equipo', 'compania'));
    }
}
