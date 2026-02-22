<?php

namespace Tests\Feature\Api;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\Empleado;
use App\Models\EventoCalendario;
use App\Models\Rol;
use App\Models\Solicitud;
use App\Models\TipoAusencia;
use Carbon\Carbon;

class ConfiguracionCalendarioTest extends TestCase
{
    use RefreshDatabase;

    public function test_crear_evento_personal(): void
    {
        $empleado = Empleado::create([
            'dni' => '70000000A',
            'nombre' => 'Calendario',
            'apellido1' => 'Usuario',
            'apellido2' => '',
            'email' => 'cal@ejemplo.test',
            'contrasena' => 'secret123',
            'estado' => 'alta',
            'dias_vacaciones_restantes' => 0,
        ]);

        $this->actingAs($empleado);

        $inicio = Carbon::now()->toDateTimeString();
        $fin = Carbon::now()->addHour()->toDateTimeString();

        $response = $this->postJson('/calendario/eventos', [
            'titulo' => 'Reunión personal',
            'inicio' => $inicio,
            'fin' => $fin,
        ]);

        $response->assertStatus(200)->assertJsonFragment(['titulo' => 'Reunión personal']);

        $this->assertDatabaseHas('evento_calendario', ['titulo' => 'Reunión personal', 'id_empleado' => $empleado->id_empleado]);
    }

    public function test_crear_evento_equipo_requiere_rol_admin(): void
    {
        $empleado = Empleado::create([
            'dni' => '70000001B',
            'nombre' => 'Normal',
            'apellido1' => 'User',
            'apellido2' => '',
            'email' => 'normal@ejemplo.test',
            'contrasena' => 'secret123',
            'estado' => 'alta',
            'dias_vacaciones_restantes' => 0,
        ]);

        $this->actingAs($empleado);

        $inicio = Carbon::now()->toDateTimeString();

        $resp = $this->postJson('/calendario/eventos', [
            'titulo' => 'Evento equipo',
            'inicio' => $inicio,
            'tipo' => 'equipo',
        ]);

        $resp->assertStatus(403);
        $rol = Rol::create(['nombre' => 'admin', 'descripcion' => 'Admin']);
        $empleado->roles()->attach($rol->id_rol, ['id_departamento' => null]);

        $resp2 = $this->postJson('/calendario/eventos', [
            'titulo' => 'Evento equipo',
            'inicio' => $inicio,
            'tipo' => 'equipo',
        ]);

        $resp2->assertStatus(200)->assertJsonFragment(['titulo' => 'Evento equipo']);
        $this->assertDatabaseHas('evento_calendario', ['titulo' => 'Evento equipo', 'tipo' => 'equipo']);
    }

    public function test_mis_eventos_devuelve_solo_los_propios(): void
    {
        $a = Empleado::create([
            'dni' => '70000002C', 'nombre' => 'A', 'apellido1' => 'One', 'apellido2' => '', 'email' => 'a@t.test', 'contrasena' => 'x', 'estado' => 'alta', 'dias_vacaciones_restantes' => 0
        ]);
        $b = Empleado::create([
            'dni' => '70000003D', 'nombre' => 'B', 'apellido1' => 'Two', 'apellido2' => '', 'email' => 'b@t.test', 'contrasena' => 'x', 'estado' => 'alta', 'dias_vacaciones_restantes' => 0
        ]);

        EventoCalendario::create(['id_empleado' => $a->id_empleado, 'titulo' => 'Evento A1', 'inicio' => Carbon::now()->toDateTimeString(), 'tipo' => 'personal']);
        EventoCalendario::create(['id_empleado' => $b->id_empleado, 'titulo' => 'Evento B1', 'inicio' => Carbon::now()->toDateTimeString(), 'tipo' => 'personal']);

        $this->actingAs($a);
        $resp = $this->getJson('/calendario/mis-eventos');
        $resp->assertStatus(200);
        $data = $resp->json();
        $this->assertCount(1, $data);
        $this->assertEquals('Evento A1', $data[0]['titulo']);
    }

    public function test_mis_ausencias_se_mapearon_como_eventos(): void
    {
        $empleado = Empleado::create([
            'dni' => '70000004E', 'nombre' => 'Aus', 'apellido1' => 'User', 'apellido2' => '', 'email' => 'aus@t.test', 'contrasena' => 'x', 'estado' => 'alta', 'dias_vacaciones_restantes' => 0
        ]);

        $tipo = TipoAusencia::create(['nombre' => 'Vacaciones', 'remunerado' => true]);

        Solicitud::create([
            'id_empleado' => $empleado->id_empleado,
            'id_tipo' => $tipo->id_tipo,
            'inicio' => '2026-02-01',
            'fin' => '2026-02-03',
            'comentario' => 'Vacaciones',
            'estado' => 'aprobada',
        ]);

        $this->actingAs($empleado);
        $resp = $this->getJson('/calendario/mis-ausencias');
        $resp->assertStatus(200);
        $arr = $resp->json();
        $this->assertCount(1, $arr);
        $this->assertEquals('Ausencia', $arr[0]['title']);
        $this->assertEquals('2026-02-01', substr($arr[0]['start'], 0, 10));
    }
}
