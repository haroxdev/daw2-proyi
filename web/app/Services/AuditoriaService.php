<?php

namespace App\Services;

use App\Models\Auditoria;
use App\Models\Empleado;

class AuditoriaService
{
    public function registrar(?Empleado $empleado, string $accion, string $entidad, int $entidadId): Auditoria
    {
        return Auditoria::create([
            'id_empleado' => $empleado?->id_empleado,
            'accion' => $accion,
            'entidad' => $entidad,
            'entidad_id' => $entidadId,
            'fecha' => now(),
        ]);
    }
}
