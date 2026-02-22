<?php

namespace App\Http\Controllers;

use App\Http\Requests\AbrirPausaRequest;
use App\Http\Requests\CerrarPausaRequest;
use App\Http\Requests\FichajeEntradaRequest;
use App\Http\Requests\FichajeSalidaRequest;
use App\Http\Requests\ResolverCorreccionRequest;
use App\Http\Requests\SolicitarCorreccionRequest;
use App\Models\CorreccionFichaje;
use App\Models\Empleado;
use App\Models\Pausa;
use App\Models\RegistroHorario;
use App\Services\AuditoriaService;
use App\Services\FichajeService;
use App\Services\NotificacionesService;
use Carbon\Carbon;

class FichajeController extends Controller
{
    public function __construct(private FichajeService $service, private AuditoriaService $auditoria, private NotificacionesService $notificaciones)
    {
    }

    public function entrada(FichajeEntradaRequest $request)
    {
        /** @var Empleado $empleado */
        $empleado = $request->user();

        $registro = $this->service->ficharEntrada($empleado, Carbon::parse($request->validated('hora')));
        $this->auditoria->registrar($empleado, 'fichaje_entrada', 'registro_horario', $registro->id_registro);

        if ($request->expectsJson()) {
            return response()->json($registro);
        }

        return back()->with('success', 'Entrada registrada');
    }

    public function salida(FichajeSalidaRequest $request)
    {
        /** @var Empleado $empleado */
        $empleado = $request->user();

        $registro = $this->service->ficharSalida($empleado, Carbon::parse($request->validated('hora')));
        $this->auditoria->registrar($empleado, 'fichaje_salida', 'registro_horario', $registro->id_registro);

        if ($request->expectsJson()) {
            return response()->json($registro);
        }

        return back()->with('success', 'Salida registrada');
    }

    public function abrirPausa(AbrirPausaRequest $request, RegistroHorario $registro)
    {
        $pausa = $this->service->abrirPausa($registro, Carbon::parse($request->validated('inicio')));
        $this->auditoria->registrar($registro->empleado, 'pausa_inicio', 'pausa', $pausa->id_pausa);

        if ($request->expectsJson()) {
            return response()->json($pausa);
        }

        return back()->with('success', 'Pausa iniciada');
    }

    public function cerrarPausa(CerrarPausaRequest $request, Pausa $pausa)
    {
        $pausa = $this->service->cerrarPausa($pausa, Carbon::parse($request->validated('fin')));
        $this->auditoria->registrar($pausa->registro?->empleado, 'pausa_fin', 'pausa', $pausa->id_pausa);

        if ($request->expectsJson()) {
            return response()->json($pausa);
        }

        return back()->with('success', 'Pausa cerrada');
    }

    public function solicitarCorreccion(SolicitarCorreccionRequest $request, RegistroHorario $registro)
    {
        /** @var Empleado $empleado */
        $empleado = $request->user();

        $correccion = $this->service->solicitarCorreccion($registro, $empleado, $request->validated());
        $this->auditoria->registrar($empleado, 'correccion_solicitada', 'correccion_fichaje', $correccion->id_correccion);

        if ($request->expectsJson()) {
            return response()->json($correccion);
        }

        return back()->with('success', 'Corrección solicitada');
    }

    public function resolverCorreccion(ResolverCorreccionRequest $request, CorreccionFichaje $correccion)
    {
        /** @var Empleado $empleado */
        $empleado = $request->user();

        $correccion = $this->service->resolverCorreccion($correccion, $empleado, $request->validated('estado'));
        $this->auditoria->registrar($empleado, 'correccion_resuelta', 'correccion_fichaje', $correccion->id_correccion);
        if ($correccion->solicitante) {
            $mensaje = 'Tu correccion ha sido '.$correccion->estado;
            $this->notificaciones->enviar($correccion->solicitante, $mensaje, 'correccion');
        }

        if ($request->expectsJson()) {
            return response()->json($correccion);
        }

        return back()->with('success', 'Corrección actualizada');
    }
}
