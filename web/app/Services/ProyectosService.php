<?php

namespace App\Services;

use App\Models\Empleado;
use App\Models\Proyecto;
use App\Models\ProyectoEmpleado;
use Illuminate\Support\Facades\DB;

class ProyectosService
{
    public function crearProyecto(array $data): Proyecto
    {
        return Proyecto::create($data);
    }

    public function actualizarProyecto(Proyecto $proyecto, array $data): Proyecto
    {
        $proyecto->update($data);
        return $proyecto->fresh();
    }

    public function eliminarProyecto(Proyecto $proyecto): void
    {
        DB::transaction(function () use ($proyecto) {
            // elimina tareas, tiempos y asignaciones asociadas
            $proyecto->tareas()->each(function ($tarea) {
                $tarea->tiempos()->delete();
                $tarea->delete();
            });
            $proyecto->proyectoEmpleados()->delete();
            $proyecto->delete();
        });
    }

    public function asignarEmpleado(Proyecto $proyecto, Empleado $empleado): ProyectoEmpleado
    {
        return ProyectoEmpleado::firstOrCreate([
            'id_proyecto' => $proyecto->id_proyecto,
            'id_empleado' => $empleado->id_empleado,
        ]);
    }

    public function desasignarEmpleado(Proyecto $proyecto, Empleado $empleado): void
    {
        ProyectoEmpleado::where('id_proyecto', $proyecto->id_proyecto)
            ->where('id_empleado', $empleado->id_empleado)
            ->delete();
    }

    public function cambiarEstado(Proyecto $proyecto, string $estado): Proyecto
    {
        $proyecto->estado = $estado;
        $proyecto->save();
        return $proyecto;
    }
}
