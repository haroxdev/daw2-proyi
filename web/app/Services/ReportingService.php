<?php

namespace App\Services;

use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class ReportingService
{
    // resumen de productividad global con filtro opcional por rango de fechas
    public function resumenProductividad(?string $inicio = null, ?string $fin = null): Collection
    {
        // filtra tareas que tengan imputaciones en el rango
        $queryTareas = DB::table('tarea');
        $queryFinalizadas = DB::table('tarea')->where('estado', 'finalizada');

        if ($inicio || $fin) {
            // solo cuenta tareas con actividad en el periodo
            $filtroTiempo = function ($q) use ($inicio, $fin) {
                $q->select(DB::raw(1))
                    ->from('tiempo_tarea')
                    ->whereColumn('tiempo_tarea.id_tarea', 'tarea.id_tarea');
                if ($inicio) $q->where('tiempo_tarea.inicio', '>=', $inicio);
                if ($fin) $q->where('tiempo_tarea.inicio', '<=', $fin);
            };
            $queryTareas->whereExists($filtroTiempo);
            $queryFinalizadas->whereExists($filtroTiempo);
        }

        $tareasTotales = $queryTareas->count();
        $tareasFinalizadas = $queryFinalizadas->count();

        $querySegTareas = DB::table('tiempo_tarea')
            ->selectRaw('COALESCE(SUM(TIMESTAMPDIFF(SECOND, inicio, COALESCE(fin, NOW()))), 0) as segundos');
        if ($inicio) $querySegTareas->where('inicio', '>=', $inicio);
        if ($fin) $querySegTareas->where('inicio', '<=', $fin);
        $segundosTareas = (int) $querySegTareas->value('segundos');

        $querySegJornada = DB::table('registro_horario')
            ->selectRaw('COALESCE(SUM(TIME_TO_SEC(tiempo_total)), 0) as segundos');
        if ($inicio) $querySegJornada->where('hora_llegada', '>=', $inicio);
        if ($fin) $querySegJornada->where('hora_llegada', '<=', $fin);
        $segundosJornada = (int) $querySegJornada->value('segundos');

        // ausencias aprobadas en el periodo
        $queryAusencias = DB::table('solicitud')->where('estado', 'aprobada');
        if ($inicio) $queryAusencias->where('inicio', '>=', $inicio);
        if ($fin) $queryAusencias->where('fin', '<=', $fin);
        $ausenciasAprobadas = $queryAusencias->count();

        // empleados activos
        $empleadosActivos = DB::table('empleado')->where('estado', 'activo')->count();

        return collect([
            'tareas_totales' => $tareasTotales,
            'tareas_finalizadas' => $tareasFinalizadas,
            'horas_en_tareas' => round($segundosTareas / 3600, 2),
            'horas_en_jornada' => round($segundosJornada / 3600, 2),
            'ausencias_aprobadas' => $ausenciasAprobadas,
            'empleados_activos' => $empleadosActivos,
        ]);
    }

    // horas agrupadas por proyecto con filtro opcional
    public function horasPorProyecto(?string $inicio = null, ?string $fin = null): Collection
    {
        $query = DB::table('tiempo_tarea')
            ->join('tarea', 'tiempo_tarea.id_tarea', '=', 'tarea.id_tarea')
            ->join('proyecto', 'tarea.id_proyecto', '=', 'proyecto.id_proyecto')
            ->select('proyecto.nombre', DB::raw('COALESCE(SUM(TIMESTAMPDIFF(SECOND, tiempo_tarea.inicio, COALESCE(tiempo_tarea.fin, NOW()))), 0) as segundos'))
            ->groupBy('proyecto.nombre')
            ->orderByDesc('segundos');

        if ($inicio) $query->where('tiempo_tarea.inicio', '>=', $inicio);
        if ($fin) $query->where('tiempo_tarea.inicio', '<=', $fin);

        return $query->get()->map(fn ($row) => [
            'proyecto' => $row->nombre,
            'horas' => round($row->segundos / 3600, 2),
        ]);
    }

    // horas agrupadas por empleado con filtro opcional
    public function horasPorEmpleado(?string $inicio = null, ?string $fin = null): Collection
    {
        $query = DB::table('registro_horario')
            ->join('empleado', 'registro_horario.id_empleado', '=', 'empleado.id_empleado')
            ->select(
                'empleado.id_empleado',
                DB::raw("CONCAT(empleado.nombre, ' ', COALESCE(empleado.apellido1, '')) as empleado"),
                DB::raw('COALESCE(SUM(TIME_TO_SEC(registro_horario.tiempo_total)), 0) as segundos'),
                DB::raw('COUNT(registro_horario.id_registro) as fichajes')
            )
            ->groupBy('empleado.id_empleado', 'empleado.nombre', 'empleado.apellido1')
            ->orderByDesc('segundos');

        if ($inicio) $query->where('registro_horario.hora_llegada', '>=', $inicio);
        if ($fin) $query->where('registro_horario.hora_llegada', '<=', $fin);

        return $query->get()->map(fn ($row) => [
            'id_empleado' => $row->id_empleado,
            'empleado' => trim($row->empleado),
            'horas' => round($row->segundos / 3600, 2),
            'fichajes' => $row->fichajes,
        ]);
    }

    // ausencias agrupadas por tipo con filtro opcional
    public function ausenciasPorTipo(?string $inicio = null, ?string $fin = null): Collection
    {
        $query = DB::table('solicitud')
            ->join('tipo_ausencia', 'solicitud.id_tipo', '=', 'tipo_ausencia.id_tipo')
            ->select(
                'tipo_ausencia.nombre as tipo',
                DB::raw('COUNT(*) as total'),
                DB::raw("SUM(CASE WHEN solicitud.estado = 'aprobada' THEN 1 ELSE 0 END) as aprobadas"),
                DB::raw("SUM(CASE WHEN solicitud.estado = 'pendiente' THEN 1 ELSE 0 END) as pendientes"),
                DB::raw("SUM(CASE WHEN solicitud.estado = 'rechazada' THEN 1 ELSE 0 END) as rechazadas")
            )
            ->groupBy('tipo_ausencia.nombre')
            ->orderByDesc('total');

        if ($inicio) $query->where('solicitud.inicio', '>=', $inicio);
        if ($fin) $query->where('solicitud.fin', '<=', $fin);

        return $query->get()->map(fn ($row) => [
            'tipo' => $row->tipo,
            'total' => $row->total,
            'aprobadas' => $row->aprobadas,
            'pendientes' => $row->pendientes,
            'rechazadas' => $row->rechazadas,
        ]);
    }
}
