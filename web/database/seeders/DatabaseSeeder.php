<?php

namespace Database\Seeders;

use App\Models\Departamento;
use App\Models\Empleado;
use App\Models\Empresa;
use App\Models\Rol;
use App\Models\RolUsuario;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    // siembra la base de datos con datos iniciales y usuarios de prueba
    public function run(): void
    {
        if (! env('APP_SEED_ADMIN', false)) {
            return; // se deja vacío para que /setup cree la empresa/admin
        }

        if (Empleado::count() > 0) {
            return; // ya existe un empleado, no sobrescribir
        }

        // empresa por defecto
        $empresa = Empresa::firstOrCreate(
            ['id_empresa' => 1],
            [
                'nombre' => 'Empresa Demo',
                'cif' => 'B00000000',
                'email_admin' => 'admin@gestime.dev',
            ]
        );

        // departamentos de prueba
        $depGeneral = Departamento::firstOrCreate(
            ['nombre' => 'General'],
            ['descripcion' => 'Departamento por defecto']
        );

        $depDesarrollo = Departamento::firstOrCreate(
            ['nombre' => 'Desarrollo'],
            ['descripcion' => 'Equipo de desarrollo software']
        );

        $depRrhh = Departamento::firstOrCreate(
            ['nombre' => 'Recursos Humanos'],
            ['descripcion' => 'Gestión de personal']
        );

        // roles del sistema
        $rolAdmin = Rol::firstOrCreate(
            ['nombre' => 'admin'],
            ['descripcion' => 'Administrador del sistema']
        );

        $rolResponsable = Rol::firstOrCreate(
            ['nombre' => 'responsable'],
            ['descripcion' => 'Responsable de equipo o departamento']
        );

        $rolEmpleado = Rol::firstOrCreate(
            ['nombre' => 'empleado'],
            ['descripcion' => 'Empleado estándar']
        );

        $contrasena = Hash::make(env('APP_ADMIN_PASSWORD', 'admin123'));

        // usuario admin
        $admin = Empleado::create([
            'dni' => '00000000A',
            'nombre' => 'Admin',
            'apellido1' => 'Sistema',
            'apellido2' => null,
            'email' => 'admin@gestime.dev',
            'contrasena' => $contrasena,
            'estado' => 'alta',
            'dias_vacaciones_restantes' => 22,
            'id_departamento' => $depGeneral->id_departamento,
        ]);
        $this->asignarRol($admin, $rolAdmin, $depGeneral);

        // usuario responsable
        $responsable = Empleado::create([
            'dni' => '11111111B',
            'nombre' => 'María',
            'apellido1' => 'García',
            'apellido2' => 'López',
            'email' => 'responsable@gestime.dev',
            'contrasena' => $contrasena,
            'estado' => 'alta',
            'dias_vacaciones_restantes' => 22,
            'id_departamento' => $depDesarrollo->id_departamento,
        ]);
        $this->asignarRol($responsable, $rolResponsable, $depDesarrollo);

        // usuario empleado desarrollo
        $empleado1 = Empleado::create([
            'dni' => '22222222C',
            'nombre' => 'Carlos',
            'apellido1' => 'Martínez',
            'apellido2' => 'Ruiz',
            'email' => 'empleado@gestime.dev',
            'contrasena' => $contrasena,
            'estado' => 'alta',
            'dias_vacaciones_restantes' => 18,
            'id_departamento' => $depDesarrollo->id_departamento,
        ]);
        $this->asignarRol($empleado1, $rolEmpleado, $depDesarrollo);

        // usuario empleado rrhh
        $empleado2 = Empleado::create([
            'dni' => '33333333D',
            'nombre' => 'Ana',
            'apellido1' => 'Fernández',
            'apellido2' => 'Sánchez',
            'email' => 'rrhh@gestime.dev',
            'contrasena' => $contrasena,
            'estado' => 'alta',
            'dias_vacaciones_restantes' => 22,
            'id_departamento' => $depRrhh->id_departamento,
        ]);
        $this->asignarRol($empleado2, $rolEmpleado, $depRrhh);

        // usuario con doble rol (admin + responsable) para probar
        $superusuario = Empleado::create([
            'dni' => '44444444E',
            'nombre' => 'Pedro',
            'apellido1' => 'Navarro',
            'apellido2' => 'Torres',
            'email' => 'super@gestime.dev',
            'contrasena' => $contrasena,
            'estado' => 'alta',
            'dias_vacaciones_restantes' => 22,
            'id_departamento' => $depGeneral->id_departamento,
        ]);
        $this->asignarRol($superusuario, $rolAdmin, $depGeneral);
        $this->asignarRol($superusuario, $rolResponsable, $depGeneral);
    }

    // asigna un rol a un empleado en un departamento
    private function asignarRol(Empleado $empleado, Rol $rol, Departamento $departamento): void
    {
        RolUsuario::firstOrCreate([
            'id_empleado' => $empleado->id_empleado,
            'id_rol' => $rol->id_rol,
            'id_departamento' => $departamento->id_departamento,
            'id_proyecto' => null,
        ]);
    }
}
