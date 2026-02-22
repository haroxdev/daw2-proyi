<?php

namespace App\Services;

use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class ReportingService
{
    public function resumenProductividad(): Collection
    {
        $tareasTotales = DB::table('tarea')->count();
        $tareasFinalizadas = DB::table('tarea')->where('estado', 'finalizada')->count();

        $segundosTareas = (int) DB::table('tiempo_tarea')
            ->selectRaw('COALESCE(SUM(TIMESTAMPDIFF(SECOND, inicio, COALESCE(fin, NOW()))), 0) as segundos')
            ->value('segundos');

        $segundosJornada = (int) DB::table('registro_horario')
            ->selectRaw('COALESCE(SUM(TIME_TO_SEC(tiempo_total)), 0) as segundos')
            ->value('segundos');

        return collect([
            'tareas_totales' => $tareasTotales,
            'tareas_finalizadas' => $tareasFinalizadas,
            'horas_en_tareas' => round($segundosTareas / 3600, 2),
            'horas_en_jornada' => round($segundosJornada / 3600, 2),
        ]);
    }

    public function horasPorProyecto(): Collection
    {
        return DB::table('tiempo_tarea')
            ->join('tarea', 'tiempo_tarea.id_tarea', '=', 'tarea.id_tarea')
            ->join('proyecto', 'tarea.id_proyecto', '=', 'proyecto.id_proyecto')
            ->select('proyecto.nombre', DB::raw('COALESCE(SUM(TIMESTAMPDIFF(SECOND, tiempo_tarea.inicio, COALESCE(tiempo_tarea.fin, NOW()))), 0) as segundos'))
            ->groupBy('proyecto.nombre')
            ->orderByDesc('segundos')
            ->get()
            ->map(function ($row) {
                return [
                    'proyecto' => $row->nombre,
                    'horas' => round($row->segundos / 3600, 2),
                ];
            });
    }
}
