<?php

namespace Tests\Feature\Api;

use App\Models\Empleado;
use App\Models\RegistroHorario;
use App\Models\Rol;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExportacionTest extends TestCase
{
    use RefreshDatabase;

    protected function crearAdmin()
    {
        $admin = Empleado::create([
            'dni' => '90000000A',
            'nombre' => 'Admin',
            'apellido1' => 'Exportaciones',
            'email' => 'admin_exp@test.local',
            'contrasena' => 'password123',
            'estado' => 'alta',
            'dias_vacaciones_restantes' => 0,
        ]);
        $rol = Rol::create(['nombre' => 'admin', 'descripcion' => 'Administrador']);
        $admin->roles()->attach($rol->id_rol);

        return $admin;
    }

    public function test_administrador_puede_exportar_fichajes_csv(): void
    {
        $admin = $this->crearAdmin();
        $this->actingAs($admin);

        RegistroHorario::create([
            'id_empleado' => $admin->id_empleado,
            'hora_llegada' => '2025-05-10 09:00:00',
            'hora_salida' => '2025-05-10 17:00:00',
            'tiempo_total' => '08:00:00',
        ]);

        $response = $this->get('/exportar/fichajes');

        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'text/csv; charset=UTF-8');
        
        $content = $response->streamedContent();
        
        $this->assertStringContainsString('Empleado;Fecha;"Hora entrada";"Hora salida";"Tiempo total"', $content);
        $this->assertStringContainsString('Admin Exportaciones;2025-05-10;09:00:00;17:00:00;08:00:00', $content);
    }
}
