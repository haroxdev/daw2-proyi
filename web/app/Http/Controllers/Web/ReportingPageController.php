<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Services\ReportingService;
use Illuminate\Http\Request;

class ReportingPageController extends Controller
{
    public function __construct(private ReportingService $reporting)
    {
    }

    public function __invoke(Request $request)
    {
        $resumen = $this->reporting->resumenProductividad();
        $horasPorProyecto = $this->reporting->horasPorProyecto();

        return view('reporting.index', compact('resumen', 'horasPorProyecto'));
    }
}
