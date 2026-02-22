<?php

namespace App\Services;

use App\Models\Empleado;
use App\Models\Tarea;
use App\Models\TiempoTarea;
use Illuminate\Support\Facades\DB;

class TareasService
{
    public function crearTarea(array $data): Tarea
    {
        $empleadosIds = $data['empleados'] ?? [];
        unset($data['empleados']);

        $tarea = Tarea::create($data);

        // sincroniza asignación múltiple
        if (!empty($empleadosIds)) {
            $tarea->empleados()->sync($empleadosIds);
        } elseif (!empty($data['id_empleado'])) {
            $tarea->empleados()->sync([$data['id_empleado']]);
        }

        return $tarea;
    }

    public function actualizarTarea(Tarea $tarea, array $data): Tarea
    {
        $tarea->update($data);
        return $tarea->fresh();
    }

    public function eliminarTarea(Tarea $tarea): void
    {
        DB::transaction(function () use ($tarea) {
            $tarea->tiempos()->delete();
            $tarea->delete();
        });
    }

    // asigna uno o varios empleados a la tarea
    public function asignarEmpleados(Tarea $tarea, array $empleadosIds): Tarea
    {
        $tarea->empleados()->sync($empleadosIds);

        // mantiene id_empleado legacy con el primero o null
        $tarea->id_empleado = !empty($empleadosIds) ? $empleadosIds[0] : null;
        $tarea->save();

        return $tarea;
    }

    public function imputarTiempo(Tarea $tarea, Empleado $empleado, \DateTimeInterface $inicio, ?\DateTimeInterface $fin = null): TiempoTarea
    {
        return TiempoTarea::create([
            'id_tarea' => $tarea->id_tarea,
            'id_empleado' => $empleado->id_empleado,
            'inicio' => $inicio,
            'fin' => $fin,
        ]);
    }

    public function cerrarTimer(TiempoTarea $tiempo, \DateTimeInterface $fin): TiempoTarea
    {
        $tiempo->fin = $fin;
        $tiempo->save();
        return $tiempo;
    }
}
