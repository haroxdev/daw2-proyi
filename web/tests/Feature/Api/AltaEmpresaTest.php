<?php

namespace Tests\Feature\Api;

use App\Models\Empleado;
use App\Models\Empresa;
use App\Models\Rol;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AltaEmpresaTest extends TestCase
{
    use RefreshDatabase;

    public function test_alta_empresa_crea_espacio_trabajo(): void
    {
        $payload = [
            'empresa_nombre' => 'Empresa Prueba S.L.',
            'empresa_cif' => 'B12345678',
            'empresa_email' => 'admin@prueba.local',
            'admin_dni' => '12345678A',
            'admin_nombre' => 'Admin',
            'admin_apellido1' => 'Prueba',
            'admin_apellido2' => '',
            'admin_email' => 'admin@prueba.local',
            'admin_password' => 'secret123',
        ];

        $response = $this->post('/setup', $payload);

        $response->assertRedirect('/panel');

        $this->assertDatabaseHas('empresa', [
            'nombre' => $payload['empresa_nombre'],
            'cif' => $payload['empresa_cif'],
            'email_admin' => $payload['empresa_email'],
        ]);

        $this->assertDatabaseHas('departamento', [
            'nombre' => 'General',
        ]);

        $this->assertDatabaseHas('rol', [
            'nombre' => 'admin',
        ]);

        $this->assertDatabaseHas('empleado', [
            'email' => $payload['admin_email'],
        ]);

        $admin = Empleado::where('email', $payload['admin_email'])->first();
        $this->assertNotNull($admin);

        $rolAdmin = Rol::where('nombre', 'admin')->first();
        $this->assertNotNull($rolAdmin);

        $this->assertDatabaseHas('rol_usuario', [
            'id_empleado' => $admin->id_empleado,
            'id_rol' => $rolAdmin->id_rol,
        ]);
    }
}
