<?php

namespace Tests\Feature\Api;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\Empleado;
use App\Models\RegistroHorario;
use App\Models\Pausa;
use Illuminate\Validation\ValidationException;
use Carbon\Carbon;

class RegistroPausasTest extends TestCase
{
    use RefreshDatabase;

    public function test_no_permitir_abrir_pausa_si_empresa_desactiva(): void
    {
        $empleado = Empleado::create([
            'dni' => '90000000A',
            'nombre' => 'Pausa',
            'apellido1' => 'NoAct',
            'apellido2' => '',
            'email' => 'noact2@t.test',
            'contrasena' => 'pass12345',
            'estado' => 'alta',
            'dias_vacaciones_restantes' => 0,
        ]);

        $registro = RegistroHorario::create([
            'id_empleado' => $empleado->id_empleado,
            'hora_llegada' => Carbon::now(),
        ]);

        // Evitar que Monolog intente escribir en storage durante test
        config(['logging.default' => 'errorlog']);

        // Binder fake service que rechaza aperturas si "empresa desactiva"
        $this->app->bind(\App\Services\FichajeService::class, function () {
            return new class extends \App\Services\FichajeService {
                public function abrirPausa(\App\Models\RegistroHorario $registro, \DateTimeInterface $inicio): \App\Models\Pausa
                {
                    throw ValidationException::withMessages(['pausa' => 'Pausas desactivadas por la empresa']);
                }

                public function cerrarPausa(\App\Models\Pausa $pausa, \DateTimeInterface $fin): \App\Models\Pausa
                {
                    throw ValidationException::withMessages(['pausa' => 'Pausas desactivadas por la empresa']);
                }
            };
        });

        $this->actingAs($empleado);

        $inicio = Carbon::now()->toDateTimeString();
        $this->postJson('/fichaje/' . $registro->id_registro . '/pausa/abrir', ['inicio' => $inicio])
            ->assertStatus(422);
    }

    public function test_permitir_abrir_y_cerrar_pausa_si_empresa_activa(): void
    {
        $empleado = Empleado::create([
            'dni' => '90000001B',
            'nombre' => 'Pausa',
            'apellido1' => 'Act',
            'apellido2' => '',
            'email' => 'act2@t.test',
            'contrasena' => 'pass12345',
            'estado' => 'alta',
            'dias_vacaciones_restantes' => 0,
        ]);

        $registro = RegistroHorario::create([
            'id_empleado' => $empleado->id_empleado,
            'hora_llegada' => Carbon::now(),
        ]);

        // Evitar que Monolog intente escribir en storage durante test
        config(['logging.default' => 'errorlog']);

        $this->app->bind(\App\Services\FichajeService::class, function () {
            return new class extends \App\Services\FichajeService {
                public function abrirPausa(\App\Models\RegistroHorario $registro, \DateTimeInterface $inicio): \App\Models\Pausa
                {
                    return \App\Models\Pausa::create(['id_registro' => $registro->id_registro, 'inicio' => $inicio]);
                }

                public function cerrarPausa(\App\Models\Pausa $pausa, \DateTimeInterface $fin): \App\Models\Pausa
                {
                    $pausa->fin = $fin;
                    $pausa->save();
                    return $pausa;
                }
            };
        });

        $this->actingAs($empleado);

        $inicio = Carbon::now()->toDateTimeString();
        $resp = $this->postJson('/fichaje/' . $registro->id_registro . '/pausa/abrir', ['inicio' => $inicio]);
        $resp->assertStatus(200)->assertJsonStructure(['id_pausa', 'id_registro', 'inicio']);

        $pausaId = $resp->json('id_pausa');
        $this->assertDatabaseHas('pausa', ['id_pausa' => $pausaId, 'id_registro' => $registro->id_registro]);

        $fin = Carbon::now()->addMinutes(15)->toDateTimeString();
        $resp2 = $this->postJson('/fichaje/pausa/' . $pausaId . '/cerrar', ['fin' => $fin]);
        $resp2->assertStatus(200)->assertJsonStructure(['id_pausa', 'id_registro', 'fin']);

        $this->assertDatabaseHas('pausa', ['id_pausa' => $pausaId, 'fin' => substr($fin, 0, 19)]);
    }
}
