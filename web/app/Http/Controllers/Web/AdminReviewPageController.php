<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\CorreccionFichaje;
use App\Models\Solicitud;
use App\Models\Timesheet;
use Illuminate\Http\Request;

class AdminReviewPageController extends Controller
{
    public function __invoke(Request $request)
    {
        $correcciones = CorreccionFichaje::with(['registro.empleado', 'solicitante'])
            ->where('estado', 'pendiente')
            ->latest('id_correccion')
            ->get();

        $solicitudes = Solicitud::with(['empleado', 'tipo'])
            ->where('estado', 'pendiente')
            ->latest('inicio')
            ->get();

        $timesheets = Timesheet::with('empleado')
            ->where('estado', 'enviado')
            ->latest('inicio_periodo')
            ->get();

        return view('admin.revisiones', compact('correcciones', 'solicitudes', 'timesheets'));
    }
}
