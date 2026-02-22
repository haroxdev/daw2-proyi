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
        return Tarea::create($data);
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

    public function asignarEmpleado(Tarea $tarea, ?Empleado $empleado): Tarea
    {
        $tarea->id_empleado = $empleado?->id_empleado;
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
