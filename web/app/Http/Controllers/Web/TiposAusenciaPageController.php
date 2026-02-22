<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\TipoAusencia;

class TiposAusenciaPageController extends Controller
{
    public function __invoke()
    {
        $tipos = TipoAusencia::orderBy('nombre')->get();

        return view('tipos_ausencia.index', compact('tipos'));
    }
}
