<?php

namespace App\Http\Controllers;

use App\Http\Requests\EmpleadoStoreRequest;
use App\Http\Requests\EmpleadoUpdateRequest;
use App\Models\Empleado;
use App\Services\AuditoriaService;
use Illuminate\Support\Facades\DB;

class EmpleadosController extends Controller
{
    public function __construct(private AuditoriaService $auditoria)
    {
    }

    public function crear(EmpleadoStoreRequest $request)
    {
        $data = $request->validated();
        $roles = $data['roles'] ?? [];
        unset($data['roles']);

        $empleado = DB::transaction(function () use ($data, $roles) {
            $empleado = Empleado::create($data);
            if ($roles) {
                $empleado->roles()->sync($roles);
            }
            return $empleado;
        });

        $this->auditoria->registrar($request->user(), 'empleado_creado', 'empleado', $empleado->id_empleado);

        return back()->with('success', 'Empleado creado');
    }

    public function actualizar(EmpleadoUpdateRequest $request, Empleado $empleado)
    {
        $data = $request->validated();
        $roles = $data['roles'] ?? [];
        unset($data['roles']);

        if (empty($data['contrasena'])) {
            unset($data['contrasena']);
        }

        DB::transaction(function () use ($empleado, $data, $roles) {
            $empleado->update($data);
            $empleado->roles()->sync($roles);
        });

        $this->auditoria->registrar($request->user(), 'empleado_actualizado', 'empleado', $empleado->id_empleado);

        return back()->with('success', 'Empleado actualizado');
    }

    // desactiva un empleado cambiando su estado a baja
    public function desactivar(Empleado $empleado)
    {
        if ($empleado->id_empleado === request()->user()->id_empleado) {
            return response()->json(['error' => 'No puedes desactivarte a ti mismo'], 422);
        }

        $empleado->update(['estado' => 'baja']);
        $this->auditoria->registrar(request()->user(), 'empleado_desactivado', 'empleado', $empleado->id_empleado);

        return response()->json(['message' => 'Empleado desactivado']);
    }
}
