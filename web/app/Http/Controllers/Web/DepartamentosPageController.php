<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Departamento;

class DepartamentosPageController extends Controller
{
    public function __invoke()
    {
        $departamentos = Departamento::orderBy('nombre')->get();

        return view('departamentos.index', compact('departamentos'));
    }
}
