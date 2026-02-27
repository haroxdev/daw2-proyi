<?php

namespace Tests\Feature\Api;

use App\Models\Empleado;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PerfilTest extends TestCase
{
    use RefreshDatabase;

    public function test_empleado_puede_ver_su_perfil_y_datos_operativos(): void
    {
        $empleado = Empleado::create([
            'dni' => '40000000A',
            'nombre' => 'Test',
            'apellido1' => 'Perfil',
            'apellido2' => '',
            'email' => 'perfil@test.local',
            'contrasena' => 'password123',
            'estado' => 'alta',
            'dias_vacaciones_restantes' => 15,
        ]);

        $this->actingAs($empleado);

        $response = $this->getJson('/api/datos/perfil');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'perfil' => ['id_empleado', 'dni', 'nombre', 'apellido1', 'email', 'dias_vacaciones_restantes', 'departamento', 'roles', 'proyectos'],
                'solicitudes'
            ])
            ->assertJsonPath('perfil.email', 'perfil@test.local')
            ->assertJsonPath('perfil.nombre', 'Test');
    }

    public function test_empleado_puede_actualizar_su_perfil(): void
    {
        $empleado = Empleado::create([
            'dni' => '40000001B',
            'nombre' => 'Original',
            'apellido1' => 'Usuario',
            'apellido2' => '',
            'email' => 'original@test.local',
            'contrasena' => 'password123',
            'estado' => 'alta',
            'dias_vacaciones_restantes' => 0,
        ]);

        $this->actingAs($empleado);

        $response = $this->putJson('/perfil', [
            'nombre' => 'Editado',
            'apellido1' => 'Usuario',
            'apellido2' => '',
            'email' => 'editado@test.local',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('message', 'Perfil actualizado correctamente')
            ->assertJsonPath('perfil.nombre', 'Editado')
            ->assertJsonPath('perfil.email', 'editado@test.local');

        $this->assertDatabaseHas('empleado', [
            'id_empleado' => $empleado->id_empleado,
            'nombre' => 'Editado',
            'email' => 'editado@test.local',
        ]);
    }
}
