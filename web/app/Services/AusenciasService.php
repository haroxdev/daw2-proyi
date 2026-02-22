<?php

namespace App\Services;

use App\Models\Empleado;
use App\Models\Solicitud;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AusenciasService
{
    public function crearSolicitud(Empleado $empleado, array $data): Solicitud
    {
        $this->validarSolape($empleado, $data['inicio'], $data['fin']);

        return Solicitud::create([
            'id_empleado' => $empleado->id_empleado,
            'id_tipo' => $data['id_tipo'],
            'inicio' => $data['inicio'],
            'fin' => $data['fin'],
            'comentario' => $data['comentario'] ?? null,
            'estado' => 'pendiente',
        ]);
    }

    public function resolver(Solicitud $solicitud, Empleado $aprobador, string $decision): Solicitud
    {
        if (! in_array($decision, ['aprobada', 'rechazada'], true)) {
            throw ValidationException::withMessages([
                'estado' => 'Decision invalida',
            ]);
        }

        DB::transaction(function () use ($solicitud, $aprobador, $decision) {
            $solicitud->update([
                'estado' => $decision,
                'id_aprobador' => $aprobador->id_empleado,
                'fecha_resolucion' => now(),
            ]);
        });

        return $solicitud->fresh();
    }

    private function validarSolape(Empleado $empleado, string $inicio, string $fin): void
    {
        $haySolape = Solicitud::where('id_empleado', $empleado->id_empleado)
            ->whereIn('estado', ['pendiente', 'aprobada'])
            ->where(function ($q) use ($inicio, $fin) {
                $q->whereBetween('inicio', [$inicio, $fin])
                    ->orWhereBetween('fin', [$inicio, $fin])
                    ->orWhere(function ($q2) use ($inicio, $fin) {
                        $q2->where('inicio', '<=', $inicio)
                            ->where('fin', '>=', $fin);
                    });
            })
            ->exists();

        if ($haySolape) {
            throw ValidationException::withMessages([
                'solicitud' => 'Existe solape de fechas',
            ]);
        }
    }
}
