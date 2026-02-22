<?php

namespace Tests\Feature\Api;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\Empleado;
use App\Models\Rol;

class GestionUsuariosTest extends TestCase
{
    use RefreshDatabase;

    protected function crearAdmin(): Empleado
    {
        $rol = Rol::create(['nombre' => 'admin', 'descripcion' => 'Administrador']);

        $admin = Empleado::create([
            'dni' => '11111111A',
            'nombre' => 'Admin',
            'apellido1' => 'Sistema',
            'apellido2' => 'Test',
            'email' => 'admin@test.local',
            'contrasena' => 'password123',
            'estado' => 'alta',
            'dias_vacaciones_restantes' => 0,
        ]);

        $admin->roles()->attach($rol->id_rol, ['id_departamento' => null]);

        return $admin;
    }

    public function test_alta_empleado(): void
    {
        $admin = $this->crearAdmin();

        $this->actingAs($admin);

        $data = [
            'dni' => '22222222B',
            'nombre' => 'Nuevo',
            'apellido1' => 'Usuario',
            'apellido2' => 'Prueba',
            'email' => 'nuevo@ejemplo.local',
            'contrasena' => 'nuevapass123',
            'estado' => 'alta',
            'dias_vacaciones_restantes' => 5,
        ];

        $response = $this->post('/equipo', $data);

        $response->assertStatus(302);
        $this->assertDatabaseHas('empleado', ['email' => 'nuevo@ejemplo.local', 'dni' => '22222222B']);
    }

    public function test_editar_empleado(): void
    {
        $admin = $this->crearAdmin();
        $this->actingAs($admin);

        $empleado = Empleado::create([
            'dni' => '33333333C',
            'nombre' => 'Antes',
            'apellido1' => 'Cambio',
            'apellido2' => '',
            'email' => 'editar@ejemplo.local',
            'contrasena' => 'ini12345',
            'estado' => 'alta',
            'dias_vacaciones_restantes' => 0,
        ]);

        $update = [
            'dni' => '33333333C',
            'nombre' => 'Después',
            'apellido1' => 'Cambio',
            'apellido2' => '',
            'email' => 'editar@ejemplo.local',
            'contrasena' => '',
            'estado' => 'alta',
            'dias_vacaciones_restantes' => 2,
        ];

        $response = $this->put('/equipo/' . $empleado->id_empleado, $update);

        $response->assertStatus(302);
        $this->assertDatabaseHas('empleado', ['id_empleado' => $empleado->id_empleado, 'nombre' => 'Después']);
    }

    public function test_baja_empleado(): void
    {
        $admin = $this->crearAdmin();
        $this->actingAs($admin);

        $empleado = Empleado::create([
            'dni' => '44444444D',
            'nombre' => 'Para',
            'apellido1' => 'Baja',
            'apellido2' => '',
            'email' => 'baja@ejemplo.local',
            'contrasena' => 'ini12345',
            'estado' => 'alta',
            'dias_vacaciones_restantes' => 0,
        ]);

        $response = $this->put('/equipo/' . $empleado->id_empleado, [
            'dni' => $empleado->dni,
            'nombre' => $empleado->nombre,
            'apellido1' => $empleado->apellido1,
            'apellido2' => $empleado->apellido2,
            'email' => $empleado->email,
            'contrasena' => '',
            'estado' => 'baja',
            'dias_vacaciones_restantes' => $empleado->dias_vacaciones_restantes,
        ]);

        $response->assertStatus(302);
        $this->assertDatabaseHas('empleado', ['id_empleado' => $empleado->id_empleado, 'estado' => 'baja']);
    }

    public function test_invitacion_empleado(): void
    {
        $admin = $this->crearAdmin();
        $this->actingAs($admin);

        // Simular invitación creando el empleado y pasando un flag opcional
        $data = [
            'dni' => '55555555E',
            'nombre' => 'Invitado',
            'apellido1' => 'Correo',
            'apellido2' => '',
            'email' => 'invitado@ejemplo.local',
            'contrasena' => 'invitar123',
            'estado' => 'alta',
            'dias_vacaciones_restantes' => 0,
            'send_invite' => true,
        ];

        $response = $this->post('/equipo', $data);

        $response->assertStatus(302);
        $this->assertDatabaseHas('empleado', ['email' => 'invitado@ejemplo.local']);
    }
}

