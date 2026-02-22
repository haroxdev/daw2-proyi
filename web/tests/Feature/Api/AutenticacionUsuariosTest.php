<?php

namespace Tests\Feature\Api;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\Empleado;
use Illuminate\Support\Facades\Hash;

class AutenticacionUsuariosTest extends TestCase
{
    use RefreshDatabase;
 
    public function test_autenticar_usuarios_correcto(): void
    {
        $empleado = Empleado::create([
            'dni' => '12345678A',
            'nombre' => 'Juan',
            'apellido1' => 'Pérez',
            'apellido2' => 'García',
            'email' => 'juan.perez@ejemplo.com',
                'contrasena' => 'admin123',
            'estado' => 'alta',
            'dias_vacaciones_restantes' => 22,
        ]);

        $response = $this->postJson('/login', [
            'email' => 'juan.perez@ejemplo.com',
            'password' => 'admin123',
        ]);

        $response->assertStatus(200);
        $response->assertJsonPath('usuario.email', 'juan.perez@ejemplo.com');
        $response->assertJson(['message' => 'Login correcto']);
    }

    public function test_autenticar_usuarios_incorrecto(): void
    {
        Empleado::create([
            'dni' => '87654321B',
            'nombre' => 'Ana',
            'apellido1' => 'Lopez',
            'apellido2' => 'Martín',
            'email' => 'ana.lopez@ejemplo.com',
            'contrasena' => 'secret123',
            'estado' => 'alta',
            'dias_vacaciones_restantes' => 10,
        ]);

        $response = $this->postJson('/login', [
            'email' => 'ana.lopez@ejemplo.com',
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(422);
    }
}

