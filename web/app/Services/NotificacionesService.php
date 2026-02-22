<?php

namespace App\Services;

use App\Models\Empleado;
use App\Models\Notificacion;

class NotificacionesService
{
    public function enviar(Empleado $empleado, string $mensaje, ?string $tipo = null): Notificacion
    {
        return Notificacion::create([
            'id_empleado' => $empleado->id_empleado,
            'tipo' => $tipo,
            'mensaje' => $mensaje,
            'leida' => false,
            'fecha' => now(),
        ]);
    }

    public function marcarLeida(Notificacion $notificacion): Notificacion
    {
        $notificacion->leida = true;
        $notificacion->save();

        return $notificacion;
    }

    public function marcarTodas(Empleado $empleado): int
    {
        return Notificacion::where('id_empleado', $empleado->id_empleado)
            ->where('leida', false)
            ->update(['leida' => true]);
    }
}
