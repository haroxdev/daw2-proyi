<?php

namespace App\Http\Controllers;

use App\Services\AuditoriaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

// controlador para que el empleado gestione su propio perfil
class PerfilController extends Controller
{
    public function __construct(private AuditoriaService $auditoria)
    {
    }

    // devuelve datos del perfil del usuario autenticado
    public function mostrar(Request $request): JsonResponse
    {
        $empleado = $request->user();
        $empleado->load(['departamento', 'roles', 'proyectos' => function ($q) {
            $q->where('estado', 'activo');
        }]);

        // solicitudes recientes del empleado
        $solicitudes = $empleado->solicitudes()
            ->with('tipo')
            ->latest('id_solicitud')
            ->take(10)
            ->get();

        return response()->json([
            'perfil' => [
                'id_empleado' => $empleado->id_empleado,
                'dni' => $empleado->dni,
                'nombre' => $empleado->nombre,
                'apellido1' => $empleado->apellido1,
                'apellido2' => $empleado->apellido2,
                'email' => $empleado->email,
                'imagen_perfil' => $empleado->imagen_perfil,
                'estado' => $empleado->estado,
                'dias_vacaciones_restantes' => $empleado->dias_vacaciones_restantes,
                'departamento' => $empleado->departamento,
                'roles' => $empleado->roles,
                'proyectos' => $empleado->proyectos,
            ],
            'solicitudes' => $solicitudes,
        ]);
    }

    // actualiza datos editables del perfil propio
    public function actualizar(Request $request): JsonResponse
    {
        $empleado = $request->user();

        $datos = $request->validate([
            'nombre' => ['required', 'string', 'max:100'],
            'apellido1' => ['required', 'string', 'max:100'],
            'apellido2' => ['nullable', 'string', 'max:100'],
            'email' => ['required', 'email', Rule::unique('empleado', 'email')->ignore($empleado->id_empleado, 'id_empleado')],
            'contrasena' => ['nullable', 'string', 'min:6', 'confirmed'],
        ]);

        // solo hashea si se proporcionó contraseña nueva
        if (empty($datos['contrasena'])) {
            unset($datos['contrasena']);
        }

        $empleado->update($datos);

        $this->auditoria->registrar($empleado, 'perfil_actualizado', 'empleado', $empleado->id_empleado);

        return response()->json([
            'message' => 'Perfil actualizado correctamente',
            'perfil' => $empleado->fresh(['departamento', 'roles']),
        ]);
    }
}
