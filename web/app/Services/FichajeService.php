<?php

namespace App\Services;

use App\Models\CorreccionFichaje;
use App\Models\Empleado;
use App\Models\Pausa;
use App\Models\RegistroHorario;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class FichajeService
{
    // abre un registro de jornada si no hay uno abierto
    public function ficharEntrada(Empleado $empleado, \DateTimeInterface $hora): RegistroHorario
    {
        if ($this->tieneRegistroAbierto($empleado)) {
            throw ValidationException::withMessages([
                'registro' => 'Ya existe un registro abierto',
            ]);
        }

        return RegistroHorario::create([
            'id_empleado' => $empleado->id_empleado,
            'hora_llegada' => $hora,
        ]);
    }

    // marca salida y calcula tiempo total si aplica
    public function ficharSalida(Empleado $empleado, \DateTimeInterface $hora): RegistroHorario
    {
        $registro = $this->registroAbierto($empleado);
        if (! $registro) {
            throw ValidationException::withMessages([
                'registro' => 'No hay registro abierto',
            ]);
        }

        $registro->hora_salida = $hora;
        // carga pausas para descontarlas del tiempo total
        $registro->load('pausas');
        $registro->tiempo_total = $this->calcularTiempoTotal($registro);
        $registro->save();

        return $registro;
    }

    // abre una pausa si no hay otra abierta en el mismo registro
    public function abrirPausa(RegistroHorario $registro, \DateTimeInterface $inicio): Pausa
    {
        if ($registro->pausas()->whereNull('fin')->exists()) {
            throw ValidationException::withMessages([
                'pausa' => 'Ya hay una pausa abierta',
            ]);
        }

        return $registro->pausas()->create([
            'inicio' => $inicio,
        ]);
    }

    public function cerrarPausa(Pausa $pausa, \DateTimeInterface $fin): Pausa
    {
        $pausa->fin = $fin;
        $pausa->save();
        return $pausa;
    }

    public function solicitarCorreccion(RegistroHorario $registro, Empleado $solicitante, array $data): CorreccionFichaje
    {
        return CorreccionFichaje::create([
            'id_registro' => $registro->id_registro,
            'id_solicitante' => $solicitante->id_empleado,
            'nuevo_inicio' => $data['nuevo_inicio'] ?? null,
            'nuevo_fin' => $data['nuevo_fin'] ?? null,
            'motivo' => $data['motivo'] ?? null,
            'estado' => 'pendiente',
        ]);
    }

    public function resolverCorreccion(CorreccionFichaje $correccion, Empleado $aprobador, string $estado): CorreccionFichaje
    {
        if (! in_array($estado, ['aprobada', 'rechazada'], true)) {
            throw ValidationException::withMessages([
                'estado' => 'Estado invalido',
            ]);
        }

        DB::transaction(function () use ($correccion, $aprobador, $estado) {
            $correccion->update([
                'estado' => $estado,
                'id_aprobador' => $aprobador->id_empleado,
                'fecha_resolucion' => now(),
            ]);

            if ($estado === 'aprobada') {
                $registro = $correccion->registro;
                if ($correccion->nuevo_inicio) {
                    $registro->hora_llegada = $correccion->nuevo_inicio;
                }
                if ($correccion->nuevo_fin) {
                    $registro->hora_salida = $correccion->nuevo_fin;
                }
                $registro->tiempo_total = $this->calcularTiempoTotal($registro);
                $registro->save();
            }
        });

        return $correccion->fresh();
    }

    public function registroAbierto(Empleado $empleado): ?RegistroHorario
    {
        return RegistroHorario::where('id_empleado', $empleado->id_empleado)
            ->whereNull('hora_salida')
            ->latest('hora_llegada')
            ->first();
    }

    public function tieneRegistroAbierto(Empleado $empleado): bool
    {
        return $this->registroAbierto($empleado) !== null;
    }

    // calcula tiempo total descontando pausas completadas
    private function calcularTiempoTotal(RegistroHorario $registro): ?string
    {
        if (! $registro->hora_llegada || ! $registro->hora_salida) {
            return null;
        }

        $inicio = strtotime($registro->hora_llegada);
        $fin = strtotime($registro->hora_salida);
        if ($fin <= $inicio) {
            return null;
        }

        $segundosBrutos = $fin - $inicio;

        // resta segundos de cada pausa cerrada
        $segundosPausa = 0;
        foreach ($registro->pausas as $pausa) {
            if ($pausa->inicio && $pausa->fin) {
                $segundosPausa += strtotime($pausa->fin) - strtotime($pausa->inicio);
            }
        }

        $seconds = max(0, $segundosBrutos - $segundosPausa);
        $hours = floor($seconds / 3600);
        $minutes = floor(($seconds % 3600) / 60);
        $seconds = $seconds % 60;

        return sprintf('%02d:%02d:%02d', $hours, $minutes, $seconds);
    }
}
