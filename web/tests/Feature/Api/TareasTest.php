<?php

namespace Tests\Feature\Api;

use App\Models\Empleado;
use App\Models\Proyecto;
use App\Models\Rol;
use App\Models\Tarea;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TareasTest extends TestCase
{
    use RefreshDatabase;

    protected function crearAdmin()
    {
        $admin = Empleado::create([
            'dni' => '60000000A',
            'nombre' => 'Admin',
            'apellido1' => 'Tareas',
            'email' => 'admin_tareas@test.local',
            'contrasena' => 'password123',
            'estado' => 'alta',
            'dias_vacaciones_restantes' => 0,
        ]);
        $rol = Rol::create(['nombre' => 'admin', 'descripcion' => 'Administrador']);
        $admin->roles()->attach($rol->id_rol);

        return $admin;
    }

    public function test_administrador_puede_crear_tarea_en_proyecto(): void
    {
        $admin = $this->crearAdmin();
        $this->actingAs($admin);

        $proyecto = Proyecto::create([
            'nombre' => 'Proyecto Principal',
            'estado' => 'activo',
            'fecha_inicio' => '2025-01-01',
        ]);

        $response = $this->postJson('/tareas', [
            'id_proyecto' => $proyecto->id_proyecto,
            'titulo' => 'Desarrollo de API',
            'estado' => 'pendiente',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure(['id_tarea', 'id_proyecto', 'titulo', 'estado']);

        $this->assertDatabaseHas('tarea', [
            'id_proyecto' => $proyecto->id_proyecto,
            'titulo' => 'Desarrollo de API',
        ]);
    }

    public function test_empleado_puede_imputar_tiempo_manual_a_tarea(): void
    {
        $empleado = Empleado::create([
            'dni' => '60000001B',
            'nombre' => 'Currante',
            'apellido1' => 'Empleado',
            'email' => 'empleado_tareas@test.local',
            'contrasena' => 'password123',
            'estado' => 'alta',
            'dias_vacaciones_restantes' => 0,
        ]);

        $proyecto = Proyecto::create([
            'nombre' => 'Proyecto Secundario',
            'estado' => 'activo',
            'fecha_inicio' => '2025-01-01',
        ]);
        $proyecto->empleados()->attach($empleado->id_empleado);

        $tarea = Tarea::create([
            'id_proyecto' => $proyecto->id_proyecto,
            'titulo' => 'Diseño UI',
            'estado' => 'en_proceso',
        ]);
        $tarea->empleados()->attach($empleado->id_empleado);

        $this->actingAs($empleado);

        $inicio = '2025-02-15 09:00:00';
        $fin = '2025-02-15 11:30:00'; // 2.5 horas

        $response = $this->postJson("/tareas/{$tarea->id_tarea}/imputar", [
            'inicio' => $inicio,
            'fin' => $fin,
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure(['id_tiempo', 'id_tarea', 'id_empleado', 'inicio', 'fin']);

        $this->assertDatabaseHas('tiempo_tarea', [
            'id_tarea' => $tarea->id_tarea,
            'id_empleado' => $empleado->id_empleado,
            'inicio' => $inicio,
            'fin' => $fin,
        ]);
    }

    public function test_empleado_puede_iniciar_y_cerrar_temporizador_de_tarea(): void
    {
        $empleado = Empleado::create([
            'dni' => '60000002C',
            'nombre' => 'Timetracker',
            'apellido1' => 'User',
            'email' => 'timer@test.local',
            'contrasena' => 'password123',
            'estado' => 'alta',
            'dias_vacaciones_restantes' => 0,
        ]);

        $proyecto = Proyecto::create([
            'nombre' => 'Proyecto Timer',
            'estado' => 'activo',
            'fecha_inicio' => '2025-01-01',
        ]);
        $proyecto->empleados()->attach($empleado->id_empleado);

        $tarea = Tarea::create([
            'id_proyecto' => $proyecto->id_proyecto,
            'titulo' => 'Desarrollo Backend',
            'estado' => 'en_proceso',
        ]);
        $tarea->empleados()->attach($empleado->id_empleado);

        $this->actingAs($empleado);

        $inicio = now()->format('Y-m-d H:i:s');

        // Start timer (no fin provided)
        $respStart = $this->postJson("/tareas/{$tarea->id_tarea}/imputar", [
            'inicio' => $inicio,
        ]);
        
        $respStart->assertStatus(200);
        $idTiempo = $respStart->json('id_tiempo');

        $this->assertDatabaseHas('tiempo_tarea', [
            'id_tiempo' => $idTiempo,
            'inicio' => $inicio,
            'fin' => null, // Timer is open
        ]);

        // Stop timer
        $fin = now()->addHours(2)->format('Y-m-d H:i:s');
        $respStop = $this->postJson("/tiempo/{$idTiempo}/cerrar", [
            'fin' => $fin,
        ]);

        $respStop->assertStatus(200);

        $this->assertDatabaseHas('tiempo_tarea', [
            'id_tiempo' => $idTiempo,
            'fin' => $fin, // Timer is closed
        ]);
    }
}
