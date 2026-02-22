<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\TipoAusencia;
use Illuminate\Http\Request;

class AusenciasPageController extends Controller
{
    public function __invoke(Request $request)
    {
        $empleado = $request->user();
        $tipos = TipoAusencia::all();
        $solicitudes = $empleado?->solicitudes()->with('tipo')->latest('inicio')->get();

        return view('ausencias.crear', compact('tipos', 'solicitudes'));
    }
}
