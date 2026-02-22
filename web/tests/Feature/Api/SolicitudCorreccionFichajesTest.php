<?php

namespace Tests\Feature\Api;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\Empleado;
use App\Models\RegistroHorario;
use Carbon\Carbon;

class SolicitudCorreccionFichajesTest extends TestCase
{
    use RefreshDatabase;

    public function test_usuario_puede_solicitar_correccion_sobre_un_registro(): void
    {
        config(['logging.default' => 'errorlog']);

        $empleado = Empleado::create([
            'dni' => '80000000A',
            'nombre' => 'Solicita',
            'apellido1' => 'Correccion',
            'apellido2' => '',
            'email' => 'solicita@t.test',
            'contrasena' => 'pass12345',
            'estado' => 'alta',
            'dias_vacaciones_restantes' => 0,
        ]);

        $registro = RegistroHorario::create([
            'id_empleado' => $empleado->id_empleado,
            'hora_llegada' => Carbon::today()->setTime(9,0,0),
            'hora_salida' => Carbon::today()->setTime(17,0,0),
            'tiempo_total' => '08:00:00',
        ]);

        $this->actingAs($empleado);

        $nuevoInicio = Carbon::today()->setTime(8,45,0)->toDateTimeString();
        $motivo = 'Olvidé fichar la entrada exacta';

        $resp = $this->postJson('/fichaje/' . $registro->id_registro . '/correcciones', [
            'nuevo_inicio' => $nuevoInicio,
            'motivo' => $motivo,
        ]);

        $resp->assertStatus(200)
            ->assertJsonStructure(['id_correccion', 'id_registro', 'id_solicitante', 'nuevo_inicio', 'motivo', 'estado'])
            ->assertJsonPath('id_registro', $registro->id_registro)
            ->assertJsonPath('id_solicitante', $empleado->id_empleado)
            ->assertJsonPath('motivo', $motivo)
            ->assertJsonPath('estado', 'pendiente');

        $this->assertDatabaseHas('correccion_fichaje', [
            'id_registro' => $registro->id_registro,
            'id_solicitante' => $empleado->id_empleado,
            'motivo' => $motivo,
            'estado' => 'pendiente',
        ]);
    }
}

