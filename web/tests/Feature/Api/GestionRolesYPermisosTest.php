<?php

namespace Tests\Feature\Api;

use App\Models\Departamento;
use App\Models\Empleado;
use App\Models\Proyecto;
use App\Models\Rol;
use App\Models\RolUsuario;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class GestionRolesYPermisosTest extends TestCase
{
    use RefreshDatabase;

    protected Empleado $empleadoAdmin;
    protected Empleado $empleadoUsuario;
    protected Rol $rolAdmin;
    protected Rol $rolResponsable;
    protected Departamento $departamento;
    protected Proyecto $proyecto;

    protected function setUp(): void
    {
        parent::setUp();

        // Crear departamento
        $this->departamento = Departamento::create([
            'nombre' => 'Desarrollo',
            'descripcion' => 'Departamento de desarrollo',
        ]);

        // Crear proyectos
        $this->proyecto = Proyecto::create([
            'nombre' => 'Proyecto Test',
            'descripcion' => 'Proyecto de prueba',
            'estado' => 'activo',
            'fecha_inicio' => now(),
        ]);

        // Crear roles
        $this->rolAdmin = Rol::create([
            'nombre' => 'admin',
            'descripcion' => 'Administrador del sistema',
        ]);

        $this->rolResponsable = Rol::create([
            'nombre' => 'responsable',
            'descripcion' => 'Responsable de departamento',
        ]);

        $rolUsuario = Rol::create([
            'nombre' => 'usuario',
            'descripcion' => 'Usuario estándar',
        ]);

        // Crear empleado admin
        $this->empleadoAdmin = Empleado::create([
            'dni' => '11111111A',
            'nombre' => 'Admin',
            'apellido1' => 'Sistema',
            'apellido2' => 'Test',
            'email' => 'admin@test.com',
            'contrasena' => Hash::make('password123'),
            'estado' => 'activo',
            'dias_vacaciones_restantes' => 22,
            'id_departamento' => $this->departamento->id_departamento,
        ]);

        // Asignar rol admin
        $this->empleadoAdmin->roles()->attach($this->rolAdmin->id_rol, [
            'id_departamento' => $this->departamento->id_departamento,
        ]);

        // Crear empleado usuario
        $this->empleadoUsuario = Empleado::create([
            'dni' => '22222222B',
            'nombre' => 'Usuario',
            'apellido1' => 'Test',
            'apellido2' => 'Empleado',
            'email' => 'usuario@test.com',
            'contrasena' => Hash::make('password123'),
            'estado' => 'activo',
            'dias_vacaciones_restantes' => 22,
            'id_departamento' => $this->departamento->id_departamento,
        ]);

        // Asignar rol usuario
        $this->empleadoUsuario->roles()->attach($rolUsuario->id_rol, [
            'id_departamento' => $this->departamento->id_departamento,
        ]);
    }

    /**
     * Test que un empleado tiene el rol correcto asignado.
     */
    public function test_empleado_tiene_rol_asignado(): void
    {
        $this->assertTrue($this->empleadoAdmin->hasRole('admin'));
        $this->assertFalse($this->empleadoAdmin->hasRole('usuario'));
        $this->assertFalse($this->empleadoAdmin->hasRole('responsable'));

        $this->assertTrue($this->empleadoUsuario->hasRole('usuario'));
        $this->assertFalse($this->empleadoUsuario->hasRole('admin'));
    }

    /**
     * Test que se puede verificar si un empleado tiene múltiples roles.
     */
    public function test_empleado_tiene_multiples_roles(): void
    {
        $this->empleadoUsuario->roles()->attach($this->rolResponsable->id_rol, [
            'id_departamento' => $this->departamento->id_departamento,
        ]);

        $this->assertTrue($this->empleadoUsuario->hasRole(['usuario', 'responsable']));
        $this->assertTrue($this->empleadoUsuario->hasRole('responsable'));
        $this->assertFalse($this->empleadoUsuario->hasRole('admin'));
    }

    /**
     * Test que se puede asignar un rol a un empleado.
     */
    public function test_asignar_rol_a_empleado(): void
    {
        $empleado = Empleado::create([
            'dni' => '33333333C',
            'nombre' => 'Nuevo',
            'apellido1' => 'Empleado',
            'apellido2' => 'Test',
            'email' => 'nuevo@test.com',
            'contrasena' => Hash::make('password123'),
            'estado' => 'activo',
            'dias_vacaciones_restantes' => 22,
            'id_departamento' => $this->departamento->id_departamento,
        ]);

        // No tiene roles al inicio
        $this->assertFalse($empleado->hasRole('responsable'));

        // Asignar rol
        $empleado->roles()->attach($this->rolResponsable->id_rol, [
            'id_departamento' => $this->departamento->id_departamento,
        ]);

        // Recargar el empleado
        $empleado->refresh();

        // Verificar que tiene el rol
        $this->assertTrue($empleado->hasRole('responsable'));
    }

    /**
     * Test que se puede remover un rol de un empleado.
     */
    public function test_remover_rol_de_empleado(): void
    {
        // El empleado admin tiene el rol admin
        $this->assertTrue($this->empleadoAdmin->hasRole('admin'));

        // Remover el rol
        $this->empleadoAdmin->roles()->detach($this->rolAdmin->id_rol);

        // Recargar el empleado
        $this->empleadoAdmin->refresh();

        // Verificar que no tiene el rol
        $this->assertFalse($this->empleadoAdmin->hasRole('admin'));
    }

    /**
     * Test que se puede sincronizar roles de un empleado.
     */
    public function test_sincronizar_roles_empleado(): void
    {
        $rolUsuario = Rol::where('nombre', 'usuario')->first();

        // Inicialmente tiene rol usuario
        $this->assertTrue($this->empleadoUsuario->hasRole('usuario'));

        // Sincronizar para tener solo rol admin
        $this->empleadoUsuario->roles()->sync([$this->rolAdmin->id_rol => [
            'id_departamento' => $this->departamento->id_departamento,
        ]]);

        $this->empleadoUsuario->refresh();

        // Verificar cambios
        $this->assertTrue($this->empleadoUsuario->hasRole('admin'));
        $this->assertFalse($this->empleadoUsuario->hasRole('usuario'));
    }

    /**
     * Test que se pueden obtener los roles de un empleado.
     */
    public function test_obtener_roles_empleado(): void
    {
        // Admin tiene 1 rol
        $rolesAdmin = $this->empleadoAdmin->roles;
        $this->assertCount(1, $rolesAdmin);
        $this->assertEquals('admin', $rolesAdmin->first()->nombre);

        // Asignar múltiples roles al usuario
        $this->empleadoUsuario->roles()->attach($this->rolResponsable->id_rol, [
            'id_departamento' => $this->departamento->id_departamento,
        ]);

        // Usuario ahora tiene 2 roles
        $rolesUsuario = $this->empleadoUsuario->roles;
        $this->assertCount(2, $rolesUsuario);
        $this->assertTrue($rolesUsuario->contains('nombre', 'usuario'));
        $this->assertTrue($rolesUsuario->contains('nombre', 'responsable'));
    }

    /**
     * Test que un rol puede tener múltiples empleados.
     */
    public function test_rol_tiene_multiples_empleados(): void
    {
        $empleadosConRolAdmin = $this->rolAdmin->empleados;
        $this->assertCount(1, $empleadosConRolAdmin);

        // Asignar el mismo rol a otro empleado
        $this->empleadoUsuario->roles()->attach($this->rolAdmin->id_rol, [
            'id_departamento' => $this->departamento->id_departamento,
        ]);

        // Recargar
        $this->rolAdmin->refresh();
        $empleadosConRolAdmin = $this->rolAdmin->empleados;
        $this->assertCount(2, $empleadosConRolAdmin);
    }

    /**
     * Test que se pueden obtener roles con contexto de departamento.
     */
    public function test_roles_usuario_con_contexto_departamento(): void
    {
        $rolUsuarios = $this->empleadoAdmin->rolesUsuarios;
        $this->assertCount(1, $rolUsuarios);

        $rolUsuario = $rolUsuarios->first();
        $this->assertEquals($this->rolAdmin->id_rol, $rolUsuario->id_rol);
        $this->assertEquals($this->departamento->id_departamento, $rolUsuario->id_departamento);
    }

    /**
     * Test que se pueden obtener roles con contexto de proyecto.
     */
    public function test_roles_usuario_con_contexto_proyecto(): void
    {
        // Asignar rol con contexto de proyecto
        $this->empleadoUsuario->roles()->sync([
            $this->rolResponsable->id_rol => [
                'id_departamento' => $this->departamento->id_departamento,
                'id_proyecto' => $this->proyecto->id_proyecto,
            ]
        ]);

        $this->empleadoUsuario->refresh();
        $rolUsuarios = $this->empleadoUsuario->rolesUsuarios;

        $rolConProyecto = $rolUsuarios->where('id_proyecto', $this->proyecto->id_proyecto)->first();
        $this->assertNotNull($rolConProyecto);
        $this->assertEquals($this->rolResponsable->id_rol, $rolConProyecto->id_rol);
        $this->assertEquals($this->proyecto->id_proyecto, $rolConProyecto->id_proyecto);
    }
}
