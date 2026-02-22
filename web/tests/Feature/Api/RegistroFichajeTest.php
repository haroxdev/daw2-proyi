<?php

namespace Tests\Feature\Api;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\Empleado;
use App\Models\RegistroHorario;
use Carbon\Carbon;

class RegistroFichajeTest extends TestCase
{
    use RefreshDatabase;

    public function test_entrada_crea_registro(): void
    {
        $empleado = Empleado::create([
            'dni' => '60000000A',
            'nombre' => 'Fichador',
            'apellido1' => 'Uno',
            'apellido2' => '',
            'email' => 'fichador@t.test',
            'contrasena' => 'pass12345',
            'estado' => 'alta',
            'dias_vacaciones_restantes' => 0,
        ]);

        $this->actingAs($empleado);

        $hora = Carbon::now()->toDateTimeString();

        $resp = $this->postJson('/fichaje/entrada', ['hora' => $hora]);
        $resp->assertStatus(200)->assertJsonFragment(['id_empleado' => $empleado->id_empleado]);

        $registro = RegistroHorario::where('id_empleado', $empleado->id_empleado)->first();
        $this->assertNotNull($registro);
        $this->assertNull($registro->hora_salida);
    }

    public function test_entrada_doble_devuelve_error(): void
    {
        $empleado = Empleado::create([
            'dni' => '60000001B',
            'nombre' => 'Fichador2',
            'apellido1' => 'Dos',
            'apellido2' => '',
            'email' => 'f2@t.test',
            'contrasena' => 'pass12345',
            'estado' => 'alta',
            'dias_vacaciones_restantes' => 0,
        ]);

        $this->actingAs($empleado);

        $hora = Carbon::now()->toDateTimeString();
        $this->postJson('/fichaje/entrada', ['hora' => $hora])->assertStatus(200);

        // Segundo intento debe devolver 422 por registro ya abierto
        $this->postJson('/fichaje/entrada', ['hora' => $hora])->assertStatus(422);
    }

    public function test_salida_sin_registro_abierto_devuelve_error(): void
    {
        $empleado = Empleado::create([
            'dni' => '60000002C',
            'nombre' => 'Fichador3',
            'apellido1' => 'Tres',
            'apellido2' => '',
            'email' => 'f3@t.test',
            'contrasena' => 'pass12345',
            'estado' => 'alta',
            'dias_vacaciones_restantes' => 0,
        ]);

        $this->actingAs($empleado);

        $hora = Carbon::now()->toDateTimeString();
        $this->postJson('/fichaje/salida', ['hora' => $hora])->assertStatus(422);
    }

    public function test_salida_calcula_tiempo_total(): void
    {
        $empleado = Empleado::create([
            'dni' => '60000003D',
            'nombre' => 'Fichador4',
            'apellido1' => 'Cuatro',
            'apellido2' => '',
            'email' => 'f4@t.test',
            'contrasena' => 'pass12345',
            'estado' => 'alta',
            'dias_vacaciones_restantes' => 0,
        ]);

        $this->actingAs($empleado);

        $entrada = Carbon::now();
        $salida = $entrada->copy()->addHours(2);

        $this->postJson('/fichaje/entrada', ['hora' => $entrada->toDateTimeString()])->assertStatus(200);
        $resp = $this->postJson('/fichaje/salida', ['hora' => $salida->toDateTimeString()]);

        $resp->assertStatus(200);

        $registro = RegistroHorario::where('id_empleado', $empleado->id_empleado)->first();
        $this->assertNotNull($registro->hora_salida);
        $this->assertEquals('02:00:00', $registro->tiempo_total);
    }
}
