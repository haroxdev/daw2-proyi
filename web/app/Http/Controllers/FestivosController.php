<?php

namespace App\Http\Controllers;

use App\Models\Festivo;
use App\Services\AuditoriaService;
use App\Services\FestivosService;
use Illuminate\Http\Request;

class FestivosController extends Controller
{
    public function __construct(
        private FestivosService $service,
        private AuditoriaService $auditoria,
    ) {
    }

    public function listar(Request $request)
    {
        $festivos = $this->service->listar();

        return response()->json(['festivos' => $festivos]);
    }

    public function crear(Request $request)
    {
        $data = $request->validate([
            'fecha' => ['required', 'date'],
            'nombre' => ['required', 'string', 'max:100'],
            'descripcion' => ['nullable', 'string', 'max:255'],
            'recurrente' => ['boolean'],
            'id_empresa' => ['nullable', 'integer', 'exists:empresa,id_empresa'],
        ]);

        $festivo = $this->service->crear($data);
        $this->auditoria->registrar($request->user(), 'festivo_creado', 'festivo', $festivo->id_festivo);

        if ($request->expectsJson()) {
            return response()->json($festivo, 201);
        }

        return back()->with('success', 'Festivo creado');
    }

    public function actualizar(Request $request, Festivo $festivo)
    {
        $data = $request->validate([
            'fecha' => ['required', 'date'],
            'nombre' => ['required', 'string', 'max:100'],
            'descripcion' => ['nullable', 'string', 'max:255'],
            'recurrente' => ['boolean'],
        ]);

        $festivo = $this->service->actualizar($festivo, $data);
        $this->auditoria->registrar($request->user(), 'festivo_actualizado', 'festivo', $festivo->id_festivo);

        if ($request->expectsJson()) {
            return response()->json($festivo);
        }

        return back()->with('success', 'Festivo actualizado');
    }

    public function eliminar(Festivo $festivo)
    {
        $idFestivo = $festivo->id_festivo;
        $this->service->eliminar($festivo);
        $this->auditoria->registrar(request()->user(), 'festivo_eliminado', 'festivo', $idFestivo);

        return response()->json(['message' => 'Festivo eliminado']);
    }
}
