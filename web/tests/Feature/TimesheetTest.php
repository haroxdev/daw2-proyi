<?php

namespace Tests\Feature;

use App\Models\Empleado;
use App\Models\Timesheet;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TimesheetTest extends TestCase
{
    use RefreshDatabase;

    public function test_crea_y_envia_timesheet(): void
    {
        $empleado = Empleado::factory()->create();

        $createResponse = $this->actingAs($empleado)
            ->postJson('/timesheets', [
                'inicio_periodo' => '2025-02-01',
                'fin_periodo' => '2025-02-15',
            ])
            ->assertOk();

        $timesheetId = $createResponse->json('id_timesheet');
        $timesheet = Timesheet::find($timesheetId);

        $this->actingAs($empleado)
            ->postJson("/timesheets/{$timesheetId}/enviar")
            ->assertOk();

        $this->assertEquals('enviado', $timesheet->fresh()->estado);
    }
}
