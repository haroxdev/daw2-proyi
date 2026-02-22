<?php

namespace App\Http\Controllers;

use App\Http\Requests\DepartamentoStoreRequest;
use App\Http\Requests\DepartamentoUpdateRequest;
use App\Models\Departamento;
use App\Services\AuditoriaService;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class DepartamentosController extends Controller
{
    public function __construct(private AuditoriaService $auditoria)
    {
    }

    public function crear(DepartamentoStoreRequest $request)
    {
        $departamento = Departamento::create($request->validated());
        $this->auditoria->registrar($request->user(), 'departamento_creado', 'departamento', $departamento->id_departamento);

        return back()->with('success', 'Departamento creado');
    }

    public function actualizar(DepartamentoUpdateRequest $request, Departamento $departamento)
    {
        $departamento->update($request->validated());
        $this->auditoria->registrar($request->user(), 'departamento_actualizado', 'departamento', $departamento->id_departamento);

        return back()->with('success', 'Departamento actualizado');
    }

    public function eliminar(Departamento $departamento)
    {
        $tieneEmpleados = DB::table('empleado')->where('id_departamento', $departamento->id_departamento)->exists();
        if ($tieneEmpleados) {
            throw ValidationException::withMessages([
                'departamento' => 'No se puede borrar con empleados asignados',
            ]);
        }

        $departamento->delete();
        $this->auditoria->registrar(request()->user(), 'departamento_eliminado', 'departamento', $departamento->id_departamento);

        return back()->with('success', 'Departamento eliminado');
    }
}
