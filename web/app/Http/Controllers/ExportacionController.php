<?php

namespace App\Http\Controllers;

use App\Models\RegistroHorario;
use App\Models\Solicitud;
use App\Models\TiempoTarea;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

// controlador para exportar informes en formato csv
class ExportacionController extends Controller
{
    // exporta fichajes filtrados por periodo y/o empleado
    public function fichajes(Request $request): StreamedResponse
    {
        $request->validate([
            'inicio' => ['nullable', 'date'],
            'fin' => ['nullable', 'date'],
            'id_empleado' => ['nullable', 'integer', 'exists:empleado,id_empleado'],
        ]);

        $query = RegistroHorario::with('empleado')
            ->orderBy('hora_llegada', 'desc');

        if ($request->filled('inicio')) {
            $query->where('hora_llegada', '>=', $request->input('inicio'));
        }

        if ($request->filled('fin')) {
            $query->where('hora_llegada', '<=', $request->input('fin'));
        }

        if ($request->filled('id_empleado')) {
            $query->where('id_empleado', $request->input('id_empleado'));
        }

        $registros = $query->get();

        return $this->generarCsv(
            'fichajes.csv',
            ['Empleado', 'Fecha', 'Hora entrada', 'Hora salida', 'Tiempo total'],
            $registros->map(fn ($r) => [
                $r->empleado?->nombre . ' ' . ($r->empleado?->apellido1 ?? ''),
                $r->hora_llegada?->format('Y-m-d'),
                $r->hora_llegada?->format('H:i:s'),
                $r->hora_salida?->format('H:i:s') ?? '',
                $r->tiempo_total ?? '',
            ])->toArray()
        );
    }

    // exporta horas por proyecto con desglose de tareas
    public function proyectos(Request $request): StreamedResponse
    {
        $request->validate([
            'inicio' => ['nullable', 'date'],
            'fin' => ['nullable', 'date'],
            'id_proyecto' => ['nullable', 'integer', 'exists:proyecto,id_proyecto'],
        ]);

        $query = TiempoTarea::with(['tarea.proyecto', 'empleado'])
            ->whereNotNull('fin')
            ->orderBy('inicio', 'desc');

        if ($request->filled('inicio')) {
            $query->where('inicio', '>=', $request->input('inicio'));
        }

        if ($request->filled('fin')) {
            $query->where('inicio', '<=', $request->input('fin'));
        }

        if ($request->filled('id_proyecto')) {
            $query->whereHas('tarea', function ($q) use ($request) {
                $q->where('id_proyecto', $request->input('id_proyecto'));
            });
        }

        $tiempos = $query->get();

        return $this->generarCsv(
            'proyectos.csv',
            ['Proyecto', 'Tarea', 'Empleado', 'Fecha', 'Inicio', 'Fin', 'Horas'],
            $tiempos->map(function ($t) {
                $horas = $t->inicio && $t->fin
                    ? round($t->inicio->diffInMinutes($t->fin) / 60, 2)
                    : 0;

                return [
                    $t->tarea?->proyecto?->nombre ?? '',
                    $t->tarea?->titulo ?? '',
                    $t->empleado?->nombre . ' ' . ($t->empleado?->apellido1 ?? ''),
                    $t->inicio?->format('Y-m-d'),
                    $t->inicio?->format('H:i:s'),
                    $t->fin?->format('H:i:s'),
                    $horas,
                ];
            })->toArray()
        );
    }

    // exporta solicitudes de ausencia filtradas por periodo, tipo o empleado
    public function ausencias(Request $request): StreamedResponse
    {
        $request->validate([
            'inicio' => ['nullable', 'date'],
            'fin' => ['nullable', 'date'],
            'id_empleado' => ['nullable', 'integer', 'exists:empleado,id_empleado'],
            'id_tipo' => ['nullable', 'integer', 'exists:tipo_ausencia,id_tipo'],
        ]);

        $query = Solicitud::with(['empleado', 'tipo', 'aprobador'])
            ->orderBy('inicio', 'desc');

        if ($request->filled('inicio')) {
            $query->where('inicio', '>=', $request->input('inicio'));
        }

        if ($request->filled('fin')) {
            $query->where('fin', '<=', $request->input('fin'));
        }

        if ($request->filled('id_empleado')) {
            $query->where('id_empleado', $request->input('id_empleado'));
        }

        if ($request->filled('id_tipo')) {
            $query->where('id_tipo', $request->input('id_tipo'));
        }

        $solicitudes = $query->get();

        return $this->generarCsv(
            'ausencias.csv',
            ['Empleado', 'Tipo', 'Inicio', 'Fin', 'Estado', 'Comentario', 'Aprobador'],
            $solicitudes->map(fn ($s) => [
                $s->empleado?->nombre . ' ' . ($s->empleado?->apellido1 ?? ''),
                $s->tipo?->nombre ?? '',
                $s->inicio,
                $s->fin,
                $s->estado,
                $s->comentario ?? '',
                $s->aprobador ? $s->aprobador->nombre . ' ' . ($s->aprobador->apellido1 ?? '') : '',
            ])->toArray()
        );
    }

    // genera una respuesta csv a partir de cabeceras y filas
    private function generarCsv(string $nombre, array $cabeceras, array $filas): StreamedResponse
    {
        return response()->streamDownload(function () use ($cabeceras, $filas) {
            $handle = fopen('php://output', 'w');

            // bom utf-8 para compatibilidad con excel
            fwrite($handle, "\xEF\xBB\xBF");

            fputcsv($handle, $cabeceras, ';');

            foreach ($filas as $fila) {
                fputcsv($handle, $fila, ';');
            }

            fclose($handle);
        }, $nombre, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }
}
