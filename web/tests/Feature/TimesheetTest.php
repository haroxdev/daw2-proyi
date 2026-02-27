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

    public function test_vista_timesheets_devuelve_imputaciones_agrupadas(): void
    {
        $empleado = Empleado::factory()->create();

        // Create a timesheet
        $timesheet = Timesheet::create([
            'id_empleado' => $empleado->id_empleado,
            'inicio_periodo' => '2025-03-01',
            'fin_periodo' => '2025-03-15',
            'estado' => 'borrador',
        ]);

        $this->actingAs($empleado);
        
        $resp = $this->getJson('/api/datos/timesheets');
        $resp->assertStatus(200);
        
        $timesheetsResponse = collect($resp->json('timesheets'));
        $this->assertNotEmpty($timesheetsResponse);
        
        // Assert the timesheet is present in the response
        $this->assertTrue($timesheetsResponse->contains('id_timesheet', $timesheet->id_timesheet));
        // Assert it has lineas and correct total hours calculating structure
        $this->assertArrayHasKey('lineas', $timesheetsResponse->first());
        $this->assertArrayHasKey('total_horas', $timesheetsResponse->first());
    }

    public function test_responsable_puede_rechazar_timesheet(): void
    {
        $empleado = Empleado::factory()->create();
        $responsable = Empleado::factory()->create();
        $rolResponsable = \App\Models\Rol::create(['nombre' => 'responsable', 'descripcion' => 'Responsable']);
        $responsable->roles()->attach($rolResponsable->id_rol);

        $timesheet = Timesheet::create([
            'id_empleado' => $empleado->id_empleado,
            'inicio_periodo' => '2025-03-01',
            'fin_periodo' => '2025-03-15',
            'estado' => 'enviado',
        ]);

        $this->actingAs($responsable);
        
        $resp = $this->postJson("/timesheets/{$timesheet->id_timesheet}/revisar", [
            'decision' => 'rechazado',
            'comentario' => 'Te faltan horas por imputar en el Proyecto A',
        ]);
        
        $resp->assertStatus(200);
        
        $this->assertDatabaseHas('timesheet', [
            'id_timesheet' => $timesheet->id_timesheet,
            'estado' => 'rechazado',
            'comentario' => 'Te faltan horas por imputar en el Proyecto A',
            'id_aprobador' => $responsable->id_empleado,
        ]);
    }
}
