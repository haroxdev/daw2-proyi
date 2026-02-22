<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class TimesheetPageController extends Controller
{
    public function __invoke(Request $request)
    {
        $empleado = $request->user();
        $timesheets = $empleado?->timesheets()->latest('inicio_periodo')->get();

        return view('timesheets.index', compact('timesheets'));
    }
}
