<?php

namespace App\Services;

use App\Models\Festivo;
use Illuminate\Support\Collection;
use Illuminate\Validation\ValidationException;

class FestivosService
{
    // obtiene todos los festivos de una empresa o globales
    public function listar(?int $idEmpresa = null): Collection
    {
        return Festivo::where('id_empresa', $idEmpresa)
            ->orWhereNull('id_empresa')
            ->orderBy('fecha')
            ->get();
    }

    // obtiene festivos dentro de un rango de fechas
    public function listarPorPeriodo(string $inicio, string $fin, ?int $idEmpresa = null): Collection
    {
        return Festivo::where(function ($q) use ($idEmpresa) {
                $q->where('id_empresa', $idEmpresa)
                  ->orWhereNull('id_empresa');
            })
            ->whereBetween('fecha', [$inicio, $fin])
            ->orderBy('fecha')
            ->get();
    }

    public function crear(array $data): Festivo
    {
        $this->validarDuplicado($data['fecha'], $data['id_empresa'] ?? null);

        return Festivo::create($data);
    }

    public function actualizar(Festivo $festivo, array $data): Festivo
    {
        $festivo->update($data);
        return $festivo->fresh();
    }

    public function eliminar(Festivo $festivo): void
    {
        $festivo->delete();
    }

    // verifica que sea día laborable (no festivo)
    public function esDiaLaborable(string $fecha, ?int $idEmpresa = null): bool
    {
        return !Festivo::where('fecha', $fecha)
            ->where(function ($q) use ($idEmpresa) {
                $q->where('id_empresa', $idEmpresa)
                  ->orWhereNull('id_empresa');
            })
            ->exists();
    }

    private function validarDuplicado(string $fecha, ?int $idEmpresa): void
    {
        $existe = Festivo::where('fecha', $fecha)
            ->where(function ($q) use ($idEmpresa) {
                $q->where('id_empresa', $idEmpresa)
                  ->orWhereNull('id_empresa');
            })
            ->exists();

        if ($existe) {
            throw ValidationException::withMessages([
                'fecha' => 'Ya existe un festivo en esa fecha',
            ]);
        }
    }
}
