<?php

namespace Tests\Feature\Api;

use App\Models\Empleado;
use App\Services\AuditoriaService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuditoriaTest extends TestCase
{
    use RefreshDatabase;

    public function test_servicio_auditoria_registra_acciones_correctamente(): void
    {
        $empleado = Empleado::create([
            'dni' => '90000001B',
            'nombre' => 'Usuario',
            'apellido1' => 'Auditoria',
            'email' => 'auditoria@test.local',
            'contrasena' => 'password123',
            'estado' => 'alta',
            'dias_vacaciones_restantes' => 0,
        ]);

        $servicio = new AuditoriaService();
        
        $auditoria = $servicio->registrar($empleado, 'accion_de_prueba', 'entidad_prueba', 999);

        $this->assertDatabaseHas('auditoria', [
            'id_auditoria' => $auditoria->id_auditoria,
            'id_empleado' => $empleado->id_empleado,
            'accion' => 'accion_de_prueba',
            'entidad' => 'entidad_prueba',
            'entidad_id' => 999,
        ]);
    }
}
