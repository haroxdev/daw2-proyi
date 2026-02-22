<?php

namespace Tests\Feature\Api;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\Empleado;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
class RecuperacionYcambioContraseñaTest extends TestCase
{
    use RefreshDatabase;

    public function test_puede_solicitar_enlace_restablecimiento(): void
    {

        $empleado = Empleado::create([
            'dni' => '99999999Z',
            'nombre' => 'Prueba',
            'apellido1' => 'Usuario',
            'apellido2' => '',
            'email' => 'prueba@ejemplo.com',
            'contrasena' => 'initialpass',
            'estado' => 'alta',
            'dias_vacaciones_restantes' => 0,
        ]);

        $broker = new class {
            public function sendResetLink($input)
            {
                return Password::RESET_LINK_SENT;
            }
        };

        $manager = new class ($broker) {
            private $broker;
            public function __construct($b) { $this->broker = $b; }
            public function broker($name = null) { return $this->broker; }
        };

        Password::swap($manager);

        $response = $this->postJson('/forgot-password', [
            'email' => $empleado->email,
        ]);

        $response->assertStatus(200)->assertJsonStructure(['message']);
    }

    public function test_puede_cambiar_contrasena_con_token_valido(): void
    {
        $empleado = Empleado::create([
            'dni' => '88888888Y',
            'nombre' => 'Cambio',
            'apellido1' => 'Clave',
            'apellido2' => '',
            'email' => 'cambio@ejemplo.com',
            'contrasena' => 'oldpass',
            'estado' => 'alta',
            'dias_vacaciones_restantes' => 0,
        ]);

        $token = Password::broker('empleados')->createToken($empleado);

        $newPassword = 'nuevaClave123';

        $response = $this->postJson('/reset-password', [
            'token' => $token,
            'email' => $empleado->email,
            'password' => $newPassword,
            'password_confirmation' => $newPassword,
        ]);

        $response->assertStatus(200)->assertJsonStructure(['message']);

        $this->assertTrue(Hash::check($newPassword, $empleado->fresh()->contrasena));
    }
}
