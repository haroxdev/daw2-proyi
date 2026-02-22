<?php

namespace Tests\Feature\Api;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\Empleado;
use App\Models\RegistroHorario;
use App\Models\CorreccionFichaje;
use App\Models\Rol;
use Carbon\Carbon;

class AprobacionCorrecionFichajesTest extends TestCase
{
    use RefreshDatabase;

    public function test_aprobador_puede_aprobar_correccion_y_se_actualiza_registro(): void
    {
        config(['logging.default' => 'errorlog']);

        $solicitante = Empleado::create([
            'dni' => '81000000A',
            'nombre' => 'Solicita',
            'apellido1' => 'Correc',
            'apellido2' => '',
            'email' => 'soli@t.test',
            'contrasena' => 'pass12345',
            'estado' => 'alta',
            'dias_vacaciones_restantes' => 0,
        ]);

        $aprobador = Empleado::create([
            'dni' => '81000001B',
            'nombre' => 'Aprueba',
            'apellido1' => 'Correc',
            'apellido2' => '',
            'email' => 'aprueba@t.test',
            'contrasena' => 'pass12345',
            'estado' => 'alta',
            'dias_vacaciones_restantes' => 0,
        ]);

        $rolResponsable = Rol::create(['nombre' => 'responsable', 'descripcion' => 'Responsable']);
        $aprobador->roles()->attach($rolResponsable->id_rol);

        $registro = RegistroHorario::create([
            'id_empleado' => $solicitante->id_empleado,
            'hora_llegada' => Carbon::today()->setTime(9,0,0),
            'hora_salida' => Carbon::today()->setTime(17,0,0),
            'tiempo_total' => '08:00:00',
        ]);

        $nuevoInicio = Carbon::today()->setTime(8,45,0);
        $correccion = CorreccionFichaje::create([
            'id_registro' => $registro->id_registro,
            'id_solicitante' => $solicitante->id_empleado,
            'nuevo_inicio' => $nuevoInicio,
            'motivo' => 'Entrada olvidada',
            'estado' => 'pendiente',
        ]);

        $this->actingAs($aprobador);

        $resp = $this->postJson('/fichaje/correcciones/' . $correccion->id_correccion . '/resolver', [
            'estado' => 'aprobada',
        ]);

        $resp->assertStatus(200)
            ->assertJsonPath('estado', 'aprobada')
            ->assertJsonPath('id_aprobador', $aprobador->id_empleado);

        $this->assertDatabaseHas('correccion_fichaje', [
            'id_correccion' => $correccion->id_correccion,
            'estado' => 'aprobada',
            'id_aprobador' => $aprobador->id_empleado,
        ]);

        $registroActualizado = $registro->fresh();
        $this->assertNotNull($registroActualizado->hora_llegada);
    }

    public function test_aprobador_rechaza_correccion_sin_actualizar_registro(): void
    {
        config(['logging.default' => 'errorlog']);

        $solicitante = Empleado::create([
            'dni' => '82000000A',
            'nombre' => 'Solicita2',
            'apellido1' => 'Correc2',
            'apellido2' => '',
            'email' => 'soli2@t.test',
            'contrasena' => 'pass12345',
            'estado' => 'alta',
            'dias_vacaciones_restantes' => 0,
        ]);

        $aprobador = Empleado::create([
            'dni' => '82000001B',
            'nombre' => 'Aprueba2',
            'apellido1' => 'Correc2',
            'apellido2' => '',
            'email' => 'aprueba2@t.test',
            'contrasena' => 'pass12345',
            'estado' => 'alta',
            'dias_vacaciones_restantes' => 0,
        ]);

        $rolAdmin = Rol::create(['nombre' => 'admin', 'descripcion' => 'Administrador']);
        $aprobador->roles()->attach($rolAdmin->id_rol);

        $horaLlegadaOriginal = Carbon::today()->setTime(9,0,0);
        $horaSalidaOriginal = Carbon::today()->setTime(17,0,0);
        $registro = RegistroHorario::create([
            'id_empleado' => $solicitante->id_empleado,
            'hora_llegada' => $horaLlegadaOriginal,
            'hora_salida' => $horaSalidaOriginal,
            'tiempo_total' => '08:00:00',
        ]);

        $correccion = CorreccionFichaje::create([
            'id_registro' => $registro->id_registro,
            'id_solicitante' => $solicitante->id_empleado,
            'nuevo_inicio' => Carbon::today()->setTime(8,45,0),
            'motivo' => 'Entrada errónea',
            'estado' => 'pendiente',
        ]);

        $this->actingAs($aprobador);

        $resp = $this->postJson('/fichaje/correcciones/' . $correccion->id_correccion . '/resolver', [
            'estado' => 'rechazada',
        ]);

        $resp->assertStatus(200)
            ->assertJsonPath('estado', 'rechazada')
            ->assertJsonPath('id_aprobador', $aprobador->id_empleado);

        $this->assertDatabaseHas('correccion_fichaje', [
            'id_correccion' => $correccion->id_correccion,
            'estado' => 'rechazada',
            'id_aprobador' => $aprobador->id_empleado,
        ]);

        $registroSinCambios = $registro->fresh();
        $this->assertEquals($horaLlegadaOriginal->toDateTimeString(), $registroSinCambios->hora_llegada->toDateTimeString());
        $this->assertEquals($horaSalidaOriginal->toDateTimeString(), $registroSinCambios->hora_salida->toDateTimeString());
    }
}
