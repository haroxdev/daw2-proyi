<?php

namespace Tests\Feature;

use App\Models\Empleado;
use App\Models\Solicitud;
use App\Models\TipoAusencia;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\TestCase as FrameworkTestCase;

class AusenciaTest extends FrameworkTestCase
{
    use RefreshDatabase;

    public function test_detecta_solape_en_solicitud(): void
    {
        $empleado = Empleado::factory()->create();
        $tipo = TipoAusencia::create(['nombre' => 'Vacaciones']);

        Solicitud::create([
            'id_empleado' => $empleado->id_empleado,
            'id_tipo' => $tipo->id_tipo,
            'inicio' => '2025-01-10',
            'fin' => '2025-01-12',
            'estado' => 'aprobada',
        ]);

        $this->actingAs($empleado)
            ->postJson('/ausencias', [
                'id_tipo' => $tipo->id_tipo,
                'inicio' => '2025-01-11',
                'fin' => '2025-01-13',
            ])
            ->assertStatus(422);
    }

    public function test_empleado_puede_solicitar_ausencia(): void
    {
        $empleado = Empleado::factory()->create();
        $tipo = TipoAusencia::create(['nombre' => 'Enfermedad']);

        $this->actingAs($empleado);

        $inicio = '2026-05-01';
        $fin = '2026-05-03';

        $resp = $this->postJson('/ausencias', [
            'id_tipo' => $tipo->id_tipo,
            'inicio' => $inicio,
            'fin' => $fin,
            'comentario' => 'Baja medica programada',
        ]);

        $resp->assertStatus(200);

        $this->assertDatabaseHas('solicitud', [
            'id_empleado' => $empleado->id_empleado,
            'id_tipo' => $tipo->id_tipo,
            'inicio' => $inicio,
            'fin' => $fin,
            'comentario' => 'Baja medica programada',
            'estado' => 'pendiente',
        ]);
    }

    public function test_responsable_puede_aprobar_o_rechazar_ausencia(): void
    {
        $empleado = Empleado::factory()->create();
        $responsable = Empleado::factory()->create();
        $rolReq = \App\Models\Rol::create(['nombre' => 'responsable', 'descripcion' => 'Resp']);
        $responsable->roles()->attach($rolReq->id_rol);

        $tipo = TipoAusencia::create(['nombre' => 'Asuntos Propios']);

        $solicitud = Solicitud::create([
            'id_empleado' => $empleado->id_empleado,
            'id_tipo' => $tipo->id_tipo,
            'inicio' => '2026-06-01',
            'fin' => '2026-06-02',
            'estado' => 'pendiente',
        ]);

        $this->actingAs($responsable);

        $resp = $this->postJson("/ausencias/{$solicitud->id_solicitud}/resolver", [
            'decision' => 'aprobada',
        ]);

        $resp->assertStatus(200);

        $this->assertDatabaseHas('solicitud', [
            'id_solicitud' => $solicitud->id_solicitud,
            'estado' => 'aprobada',
            'id_aprobador' => $responsable->id_empleado,
        ]);
    }
}
