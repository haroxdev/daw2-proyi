<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Notificacion;
use Illuminate\Http\Request;

class NotificacionesPageController extends Controller
{
    public function __invoke(Request $request)
    {
        $empleado = $request->user();
        $notificaciones = Notificacion::where('id_empleado', $empleado->id_empleado)
            ->latest('fecha')
            ->get();

        return view('notificaciones.index', compact('notificaciones'));
    }
}
