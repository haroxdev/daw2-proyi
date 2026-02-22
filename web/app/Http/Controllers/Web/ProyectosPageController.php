<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Empleado;
use App\Models\Proyecto;
use Illuminate\Http\Request;

class ProyectosPageController extends Controller
{
    public function __invoke(Request $request)
    {
        $proyectos = Proyecto::with(['empleados', 'tareas'])->orderBy('fecha_inicio')->get();
        $empleados = Empleado::orderBy('nombre')->get();

        return view('proyectos.index', compact('proyectos', 'empleados'));
    }
}
