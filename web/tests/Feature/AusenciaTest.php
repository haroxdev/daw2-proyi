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
}
