<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Empleado;
use App\Models\Proyecto;
use App\Models\Tarea;
use Illuminate\Http\Request;

class TareasPageController extends Controller
{
    public function __invoke(Request $request)
    {
        $tareas = Tarea::with(['proyecto', 'empleado', 'tiempos'])->latest('id_tarea')->get();
        $proyectos = Proyecto::orderBy('nombre')->get();
        $empleados = Empleado::orderBy('nombre')->get();

        return view('tareas.index', compact('tareas', 'proyectos', 'empleados'));
    }
}
