<?php

namespace Tests\Feature\Api;

use App\Models\Empleado;
use App\Models\Notificacion;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NotificacionesTest extends TestCase
{
    use RefreshDatabase;

    public function test_empleado_puede_marcar_notificacion_como_leida(): void
    {
        $empleado = Empleado::create([
            'dni' => '90000002C',
            'nombre' => 'Usuario',
            'apellido1' => 'Notificacion',
            'email' => 'noti@test.local',
            'contrasena' => 'password123',
            'estado' => 'alta',
            'dias_vacaciones_restantes' => 0,
        ]);

        $notificacion = Notificacion::create([
            'id_empleado' => $empleado->id_empleado,
            'mensaje' => 'Prueba de notificacion',
            'tipo' => 'sistema',
            'leida' => false,
        ]);

        $this->actingAs($empleado);

        $response = $this->postJson("/notificaciones/{$notificacion->id_notificacion}/leer");

        $response->assertStatus(200);

        $this->assertDatabaseHas('notificacion', [
            'id_notificacion' => $notificacion->id_notificacion,
            'leida' => true,
        ]);
    }

    public function test_empleado_puede_marcar_todas_notificaciones_leidas(): void
    {
        $empleado = Empleado::create([
            'dni' => '90000003D',
            'nombre' => 'Usuario',
            'apellido1' => 'NotificacionM',
            'email' => 'noti_mult@test.local',
            'contrasena' => 'password123',
            'estado' => 'alta',
            'dias_vacaciones_restantes' => 0,
        ]);

        Notificacion::create(['id_empleado' => $empleado->id_empleado, 'mensaje' => 'N1', 'tipo' => 'sistema', 'leida' => false]);
        Notificacion::create(['id_empleado' => $empleado->id_empleado, 'mensaje' => 'N2', 'tipo' => 'sistema', 'leida' => false]);

        $this->actingAs($empleado);

        $response = $this->postJson('/notificaciones/leer-todas');
        $response->assertStatus(200);

        $this->assertEquals(0, Notificacion::where('id_empleado', $empleado->id_empleado)->where('leida', false)->count());
        $this->assertEquals(2, Notificacion::where('id_empleado', $empleado->id_empleado)->where('leida', true)->count());
    }
}
