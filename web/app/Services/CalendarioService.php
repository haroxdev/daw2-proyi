<?php

namespace App\Services;

use App\Models\Empleado;
use App\Models\EventoCalendario;
use App\Models\Solicitud;
use Illuminate\Support\Collection;

class CalendarioService
{
    public function eventosPersona(Empleado $empleado): Collection
    {
        return EventoCalendario::where('id_empleado', $empleado->id_empleado)
            ->get();
    }

    public function eventosEquipo(): Collection
    {
        // eventos de equipo registrados en tabla
        return EventoCalendario::where('tipo', 'equipo')->get();
    }

    public function eventosCompania(): Collection
    {
        return EventoCalendario::where('tipo', 'compania')->get();
    }

    public function crearEvento(Empleado $empleado, array $data): EventoCalendario
    {
        $tipo = $data['tipo'] ?? 'personal';
        $idEmpleado = $tipo === 'personal' ? $empleado->id_empleado : null;

        return EventoCalendario::create([
            'id_empleado' => $idEmpleado,
            'titulo' => $data['titulo'],
            'descripcion' => $data['descripcion'] ?? null,
            'inicio' => $data['inicio'],
            'fin' => $data['fin'] ?? null,
            'tipo' => $tipo,
            'ubicacion' => $data['ubicacion'] ?? null,
            'todo_dia' => (bool) ($data['todo_dia'] ?? false),
        ]);
    }

    public function ausenciasComoEventos(int $empleadoId): Collection
    {
        return Solicitud::where('id_empleado', $empleadoId)
            ->where('estado', 'aprobada')
            ->get()
            ->map(function (Solicitud $solicitud) {
                return [
                    'title' => 'Ausencia',
                    'start' => $solicitud->inicio,
                    'end' => $solicitud->fin,
                    'allDay' => true,
                ];
            });
    }
}
