<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Empleado;
use App\Models\Departamento;
use App\Models\Rol;
use Illuminate\Http\Request;

class EmpleadosPageController extends Controller
{
    public function __invoke(Request $request)
    {
        $empleados = Empleado::with(['departamento', 'roles'])->orderBy('nombre')->get();
        $departamentos = Departamento::orderBy('nombre')->get();
        $roles = Rol::orderBy('nombre')->get();

        return view('empleados.index', compact('empleados', 'departamentos', 'roles'));
    }
}
