<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Empresa;

class EmpresaPageController extends Controller
{
    public function __invoke()
    {
        $empresa = Empresa::first() ?: new Empresa(['id_empresa' => 1]);

        return view('empresa.index', compact('empresa'));
    }
}
