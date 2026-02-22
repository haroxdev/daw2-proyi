<?php

namespace App\Http\Controllers;

use App\Http\Requests\EmpresaUpdateRequest;
use App\Models\Empresa;
use App\Services\AuditoriaService;

class EmpresaController extends Controller
{
    public function __construct(private AuditoriaService $auditoria)
    {
    }

    public function actualizar(EmpresaUpdateRequest $request)
    {
        $data = $request->validated();
        $empresa = Empresa::firstOrCreate(['id_empresa' => 1]);
        $empresa->update($data);

        $this->auditoria->registrar($request->user(), 'empresa_actualizada', 'empresa', $empresa->id_empresa);

        return back()->with('success', 'Datos de empresa actualizados');
    }
}
