<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class FichajePageController extends Controller
{
    public function __invoke(Request $request)
    {
        $empleado = $request->user();

        $registroAbierto = $empleado?->registrosHorario()
            ->whereNull('hora_salida')
            ->latest('hora_llegada')
            ->first();

        $registros = $empleado?->registrosHorario()
            ->with('pausas')
            ->latest('hora_llegada')
            ->take(10)
            ->get();

        return view('fichaje.index', compact('registroAbierto', 'registros'));
    }
}
