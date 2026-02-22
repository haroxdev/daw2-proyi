<?php

namespace App\Http\Controllers;

use App\Http\Requests\TipoAusenciaStoreRequest;
use App\Http\Requests\TipoAusenciaUpdateRequest;
use App\Models\TipoAusencia;
use App\Services\AuditoriaService;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class TipoAusenciaController extends Controller
{
    public function __construct(private AuditoriaService $auditoria)
    {
    }

    public function crear(TipoAusenciaStoreRequest $request)
    {
        $tipo = TipoAusencia::create([
            'nombre' => $request->validated('nombre'),
            'remunerado' => (bool) $request->validated('remunerado', true),
        ]);

        $this->auditoria->registrar($request->user(), 'tipo_ausencia_creado', 'tipo_ausencia', $tipo->id_tipo);

        return back()->with('success', 'Tipo de ausencia creado');
    }

    public function actualizar(TipoAusenciaUpdateRequest $request, TipoAusencia $tipoAusencium)
    {
        $tipoAusencium->update([
            'nombre' => $request->validated('nombre'),
            'remunerado' => (bool) $request->validated('remunerado', true),
        ]);

        $this->auditoria->registrar($request->user(), 'tipo_ausencia_actualizado', 'tipo_ausencia', $tipoAusencium->id_tipo);

        return back()->with('success', 'Tipo de ausencia actualizado');
    }

    public function eliminar(TipoAusencia $tipoAusencium)
    {
        $tieneSolicitudes = DB::table('solicitud')->where('id_tipo', $tipoAusencium->id_tipo)->exists();
        if ($tieneSolicitudes) {
            throw ValidationException::withMessages([
                'tipo' => 'No se puede borrar con solicitudes asociadas',
            ]);
        }

        $tipoAusencium->delete();
        $this->auditoria->registrar(request()->user(), 'tipo_ausencia_eliminado', 'tipo_ausencia', $tipoAusencium->id_tipo);

        return back()->with('success', 'Tipo de ausencia eliminado');
    }
}
