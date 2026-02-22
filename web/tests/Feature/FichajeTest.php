<?php

namespace Tests\Feature;

use App\Models\Empleado;
use App\Models\RegistroHorario;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FichajeTest extends TestCase
{
    use RefreshDatabase;

    public function test_empleado_puede_fichar_entrada_y_salida(): void
    {
        $empleado = Empleado::factory()->create();

        $this->actingAs($empleado)
            ->postJson('/fichaje/entrada', ['hora' => now()->toISOString()])
            ->assertOk();

        $registro = RegistroHorario::first();

        $this->actingAs($empleado)
            ->postJson('/fichaje/salida', ['hora' => now()->addHours(8)->toISOString()])
            ->assertOk();

        $this->assertNotNull($registro->fresh()->hora_salida);
    }

    public function test_no_permite_segundo_registro_abierto(): void
    {
        $empleado = Empleado::factory()->create();

        $this->actingAs($empleado)
            ->postJson('/fichaje/entrada', ['hora' => now()->toISOString()])
            ->assertOk();

        $this->actingAs($empleado)
            ->postJson('/fichaje/entrada', ['hora' => now()->addMinutes(10)->toISOString()])
            ->assertStatus(422);
    }
}
