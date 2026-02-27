<?php

namespace Tests\Feature\Api;

use App\Models\Empleado;
use App\Models\Proyecto;
use App\Models\Rol;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProyectosTest extends TestCase
{
    use RefreshDatabase;

    protected function crearAdmin()
    {
        $admin = Empleado::create([
            'dni' => '50000000A',
            'nombre' => 'Admin',
            'apellido1' => 'Proyectos',
            'email' => 'admin_proy@test.local',
            'contrasena' => 'password123',
            'estado' => 'alta',
            'dias_vacaciones_restantes' => 0,
        ]);
        $rol = Rol::create(['nombre' => 'admin', 'descripcion' => 'Administrador']);
        $admin->roles()->attach($rol->id_rol);

        return $admin;
    }

    public function test_administrador_puede_crear_proyecto(): void
    {
        $admin = $this->crearAdmin();
        $this->actingAs($admin);

        $response = $this->postJson('/proyectos', [
            'nombre' => 'Nuevo Proyecto Test',
            'descripcion' => 'Descripción del proyecto',
            'fecha_inicio' => '2025-05-01',
            'estado' => 'activo',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure(['id_proyecto', 'nombre', 'estado']);

        $this->assertDatabaseHas('proyecto', [
            'nombre' => 'Nuevo Proyecto Test',
            'estado' => 'activo',
        ]);
    }

    public function test_administrador_puede_editar_y_cambiar_estado_proyecto(): void
    {
        $admin = $this->crearAdmin();
        $this->actingAs($admin);

        $proyecto = Proyecto::create([
            'nombre' => 'Proyecto Existente',
            'estado' => 'activo',
            'fecha_inicio' => '2025-01-01',
        ]);

        // Editar detalles
        $this->putJson("/proyectos/{$proyecto->id_proyecto}", [
            'nombre' => 'Proyecto Modificado',
            'estado' => 'activo',
            'fecha_inicio' => '2025-01-01',
        ])->assertStatus(200);

        $this->assertDatabaseHas('proyecto', [
            'id_proyecto' => $proyecto->id_proyecto,
            'nombre' => 'Proyecto Modificado',
        ]);

        // Cambiar estado a inactivo
        $this->postJson("/proyectos/{$proyecto->id_proyecto}/estado", [
            'estado' => 'inactivo',
        ])->assertStatus(200);

        $this->assertEquals('inactivo', $proyecto->fresh()->estado);
    }
}
