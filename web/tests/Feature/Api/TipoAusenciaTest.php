<?php

namespace Tests\Feature\Api;

use App\Models\Empleado;
use App\Models\Rol;
use App\Models\TipoAusencia;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TipoAusenciaTest extends TestCase
{
    use RefreshDatabase;

    protected function crearAdmin()
    {
        $admin = Empleado::create([
            'dni' => '80000000A',
            'nombre' => 'Admin',
            'apellido1' => 'Ausencias',
            'email' => 'admin_tipos@test.local',
            'contrasena' => 'password123',
            'estado' => 'alta',
            'dias_vacaciones_restantes' => 0,
        ]);
        $rol = Rol::create(['nombre' => 'admin', 'descripcion' => 'Administrador general']);
        $admin->roles()->attach($rol->id_rol);

        return $admin;
    }

    public function test_administrador_puede_gestionar_tipos_de_ausencia(): void
    {
        $admin = $this->crearAdmin();
        $this->actingAs($admin);

        // Crear tipo de ausencia
        $respCrear = $this->postJson('/tipos-ausencia', [
            'nombre' => 'Asuntos Propios Test',
            'remunerado' => true,
        ]);

        $respCrear->assertStatus(200); // Redirect back con 302 o 200 via json
        
        $this->assertDatabaseHas('tipo_ausencia', [
            'nombre' => 'Asuntos Propios Test',
            'remunerado' => true,
        ]);

        $tipo = TipoAusencia::where('nombre', 'Asuntos Propios Test')->first();

        // Actualizar tipo de ausencia
        $respUpdate = $this->putJson("/tipos-ausencia/{$tipo->id_tipo}", [
            'nombre' => 'Asuntos Propios Modificado',
            'remunerado' => false,
        ]);

        $respUpdate->assertStatus(200);

        $this->assertDatabaseHas('tipo_ausencia', [
            'id_tipo' => $tipo->id_tipo,
            'nombre' => 'Asuntos Propios Modificado',
            'remunerado' => false,
        ]);

        // Eliminar tipo de ausencia
        $respDelete = $this->deleteJson("/tipos-ausencia/{$tipo->id_tipo}");
        
        $respDelete->assertStatus(200);

        $this->assertDatabaseMissing('tipo_ausencia', [
            'id_tipo' => $tipo->id_tipo,
        ]);
    }
}
