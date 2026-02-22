<?php

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\Empleado;
use App\Models\RegistroHorario;
use Carbon\Carbon;

class HistorialJornadaTest extends TestCase
{
    use RefreshDatabase;

    public function test_usuario_consulta_historial_por_dia(): void
    {
        config(['logging.default' => 'errorlog']);

        $empleado = Empleado::create([
            'dni' => '70000000A',
            'nombre' => 'Hist',
            'apellido1' => 'Dia',
            'apellido2' => '',
            'email' => 'histdia@t.test',
            'contrasena' => 'secret123',
            'estado' => 'alta',
            'dias_vacaciones_restantes' => 0,
        ]);

        $fecha = Carbon::today();
        RegistroHorario::create([
            'id_empleado' => $empleado->id_empleado,
            'hora_llegada' => $fecha->copy()->setTime(9,0,0),
            'hora_salida' => $fecha->copy()->setTime(17,0,0),
            'tiempo_total' => '08:00:00',
        ]);

        $this->actingAs($empleado);

        $resp = $this->getJson('/api/datos/fichaje');
        $resp->assertStatus(200)
            ->assertJsonStructure(['registroAbierto', 'registros']);

        $registros = $resp->json('registros');
        $this->assertCount(1, $registros);
        $this->assertEquals('08:00:00', $registros[0]['tiempo_total']);
    }

    public function test_usuario_consulta_historial_por_semana(): void
    {
        config(['logging.default' => 'errorlog']);

        $empleado = Empleado::create([
            'dni' => '70000001B',
            'nombre' => 'Hist',
            'apellido1' => 'Semana',
            'apellido2' => '',
            'email' => 'histsem@t.test',
            'contrasena' => 'secret123',
            'estado' => 'alta',
            'dias_vacaciones_restantes' => 0,
        ]);

        $monday = Carbon::now()->startOfWeek();
        RegistroHorario::create([
            'id_empleado' => $empleado->id_empleado,
            'hora_llegada' => $monday->copy()->setTime(9,0,0),
            'hora_salida' => $monday->copy()->setTime(17,0,0),
            'tiempo_total' => '08:00:00',
        ]);
        RegistroHorario::create([
            'id_empleado' => $empleado->id_empleado,
            'hora_llegada' => $monday->copy()->addDays(1)->setTime(9,0,0),
            'hora_salida' => $monday->copy()->addDays(1)->setTime(13,0,0),
            'tiempo_total' => '04:00:00',
        ]);
        RegistroHorario::create([
            'id_empleado' => $empleado->id_empleado,
            'hora_llegada' => $monday->copy()->addDays(2)->setTime(10,0,0),
            'hora_salida' => $monday->copy()->addDays(2)->setTime(15,0,0),
            'tiempo_total' => '05:00:00',
        ]);

        $this->actingAs($empleado);

        $from = $monday->toDateString();
        $to = $monday->copy()->endOfWeek()->toDateString();

        $resp = $this->getJson('/api/datos/fichaje');
        $resp->assertStatus(200)
            ->assertJsonStructure(['registroAbierto', 'registros']);

        $registros = $resp->json('registros');
        $totalSeconds = 0;
        foreach ($registros as $r) {
            if (!empty($r['tiempo_total'])) {
                [$h, $m, $s] = explode(':', $r['tiempo_total']);
                $totalSeconds += ($h * 3600) + ($m * 60) + $s;
            }
        }
        $hours = floor($totalSeconds / 3600);
        $mins = floor(($totalSeconds % 3600) / 60);
        $secs = $totalSeconds % 60;
        $formatted = sprintf('%02d:%02d:%02d', $hours, $mins, $secs);
        $this->assertEquals('17:00:00', $formatted);
    }

    public function test_responsable_consulta_historial_equipo_segun_permisos(): void
    {
        config(['logging.default' => 'errorlog']);

        $responsable = Empleado::create([
            'dni' => '70000002C',
            'nombre' => 'Jefe',
            'apellido1' => 'Equipo',
            'apellido2' => '',
            'email' => 'jefe@t.test',
            'contrasena' => 'secret123',
            'estado' => 'alta',
            'dias_vacaciones_restantes' => 0,
        ]);

        $miembro = Empleado::create([
            'dni' => '70000003D',
            'nombre' => 'Miembro',
            'apellido1' => 'Equipo',
            'apellido2' => '',
            'email' => 'miembro@t.test',
            'contrasena' => 'secret123',
            'estado' => 'alta',
            'dias_vacaciones_restantes' => 0,
        ]);

        RegistroHorario::create([
            'id_empleado' => $miembro->id_empleado,
            'hora_llegada' => Carbon::today()->setTime(9,0,0),
            'hora_salida' => Carbon::today()->setTime(17,0,0),
            'tiempo_total' => '08:00:00',
        ]);

        $rol = \App\Models\Rol::create(['nombre' => 'responsable', 'descripcion' => 'Responsable de equipo']);
        $responsable->roles()->attach($rol->id_rol);

        $this->actingAs($responsable);

        $resp = $this->getJson('/api/datos/equipo');
        $resp->assertStatus(200)
            ->assertJsonStructure(['empleados', 'departamentos', 'roles']);

        $empleados = $resp->json('empleados');
        $emails = array_column($empleados, 'email');
        $this->assertContains($miembro->email, $emails);
    }
}
