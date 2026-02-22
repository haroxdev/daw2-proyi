<?php

namespace App\Http\Controllers;

use App\Models\Departamento;
use App\Models\Empleado;
use App\Models\Empresa;
use App\Models\Rol;
use App\Models\RolUsuario;
use App\Services\AuditoriaService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class SetupController extends Controller
{
    public function show()
    {
        return view('setup');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'empresa_nombre' => ['required', 'string', 'max:100'],
            'empresa_cif' => ['required', 'string', 'max:15'],
            'empresa_email' => ['required', 'email', 'max:100'],
            'admin_dni' => ['required', 'string', 'max:15'],
            'admin_nombre' => ['required', 'string', 'max:50'],
            'admin_apellido1' => ['required', 'string', 'max:50'],
            'admin_apellido2' => ['nullable', 'string', 'max:50'],
            'admin_email' => ['required', 'email', 'max:100'],
            'admin_password' => ['required', 'string', 'min:8'],
        ]);

        $admin = DB::transaction(function () use ($data) {
            $empresa = Empresa::firstOrCreate([
                'id_empresa' => 1,
            ], [
                'nombre' => $data['empresa_nombre'],
                'cif' => $data['empresa_cif'],
                'email_admin' => $data['empresa_email'],
            ]);

            $departamento = Departamento::firstOrCreate([
                'nombre' => 'General',
            ], [
                'descripcion' => 'Departamento inicial',
            ]);

            $rolAdmin = Rol::firstOrCreate([
                'nombre' => 'admin',
            ], [
                'descripcion' => 'Administrador del sistema',
            ]);

            $admin = Empleado::create([
                'dni' => $data['admin_dni'],
                'nombre' => $data['admin_nombre'],
                'apellido1' => $data['admin_apellido1'],
                'apellido2' => $data['admin_apellido2'] ?? null,
                'email' => $data['admin_email'],
                'contrasena' => Hash::make($data['admin_password']),
                'estado' => 'alta',
                'dias_vacaciones_restantes' => 22,
                'id_departamento' => $departamento->id_departamento,
            ]);

            RolUsuario::create([
                'id_empleado' => $admin->id_empleado,
                'id_rol' => $rolAdmin->id_rol,
                'id_departamento' => $departamento->id_departamento,
                'id_proyecto' => null,
            ]);

            return $admin;
        });

        Auth::login($admin);

        app(AuditoriaService::class)->registrar($admin, 'setup_inicial', 'empleado', $admin->id_empleado);

        return redirect('/panel')->with('success', 'Setup completado');
    }
}
