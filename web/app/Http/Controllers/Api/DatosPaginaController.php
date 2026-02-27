<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CorreccionFichaje;
use App\Models\Departamento;
use App\Models\Empleado;
use App\Models\Empresa;
use App\Models\EventoCalendario;
use App\Models\Notificacion;
use App\Models\Proyecto;
use App\Models\Rol;
use App\Models\Solicitud;
use App\Models\Tarea;
use App\Models\Timesheet;
use App\Models\TipoAusencia;
use App\Models\Festivo;
use App\Services\ReportingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Carbon\Carbon;

// controlador api que devuelve datos json para cada página de la spa
// permite cargar datos al navegar con react router sin refrescar
class DatosPaginaController extends Controller
{
    // datos del panel principal
    public function panel(Request $request): JsonResponse
    {
        $empleado = $request->user();
        $ahora = Carbon::now();
        $inicioSemana = $ahora->copy()->startOfWeek();
        $finSemana = $ahora->copy()->endOfWeek();
        $inicioMes = $ahora->copy()->startOfMonth();

        // registro abierto con pausas
        $registroAbierto = $empleado?->registrosHorario()
            ->with('pausas')
            ->whereNull('hora_salida')
            ->latest('hora_llegada')
            ->first();

        // horas trabajadas esta semana descontando pausas
        $registrosSemana = $empleado?->registrosHorario()
            ->with('pausas')
            ->whereBetween('hora_llegada', [$inicioSemana, $finSemana])
            ->get() ?? collect();

        $horasSemana = $registrosSemana->sum(function ($r) {
            if (!$r->hora_llegada) return 0;
            $fin = $r->hora_salida ?? now();
            $minutosBrutos = $r->hora_llegada->diffInMinutes($fin);
            // descuenta pausas cerradas
            $minutosPausa = $r->pausas->sum(function ($p) {
                if (!$p->inicio || !$p->fin) return 0;
                return $p->inicio->diffInMinutes($p->fin);
            });
            return max(0, $minutosBrutos - $minutosPausa) / 60;
        });

        // horas semana anterior para variación
        $inicioSemanaAnterior = $inicioSemana->copy()->subWeek();
        $finSemanaAnterior = $inicioSemana->copy()->subSecond();
        $registrosSemanaAnterior = $empleado?->registrosHorario()
            ->with('pausas')
            ->whereBetween('hora_llegada', [$inicioSemanaAnterior, $finSemanaAnterior])
            ->get() ?? collect();

        $horasSemanaAnterior = $registrosSemanaAnterior->sum(function ($r) {
            if (!$r->hora_llegada || !$r->hora_salida) return 0;
            $minutosBrutos = $r->hora_llegada->diffInMinutes($r->hora_salida);
            $minutosPausa = $r->pausas->sum(function ($p) {
                if (!$p->inicio || !$p->fin) return 0;
                return $p->inicio->diffInMinutes($p->fin);
            });
            return max(0, $minutosBrutos - $minutosPausa) / 60;
        });

        // proyectos activos del empleado con horas
        $proyectos = $empleado?->proyectos()
            ->where('estado', 'activo')
            ->with(['tareas' => function ($q) use ($empleado) {
                $q->with(['tiempos' => function ($q2) use ($empleado) {
                    $q2->where('id_empleado', $empleado->id_empleado);
                }]);
            }])
            ->get()
            ->map(function ($p) {
                $horasImputadas = $p->tareas->flatMap->tiempos->sum(function ($t) {
                    if (!$t->inicio || !$t->fin) return 0;
                    return $t->inicio->diffInMinutes($t->fin) / 60;
                });
                return [
                    'nombre' => $p->nombre,
                    'descripcion' => $p->descripcion,
                    'estado' => $p->estado,
                    'horas' => round($horasImputadas, 1),
                ];
            }) ?? [];

        // días de vacaciones restantes
        $diasVacaciones = $empleado?->dias_vacaciones_restantes ?? 0;

        // solicitudes pendientes del empleado
        $solicitudesPendientes = $empleado?->solicitudes()
            ->where('estado', 'pendiente')
            ->count() ?? 0;

        // actividad reciente: últimas notificaciones
        $notificaciones = $empleado?->notificaciones()
            ->latest('fecha')
            ->take(6)
            ->get()
            ->map(fn ($n) => [
                'tipo' => $n->tipo,
                'mensaje' => $n->mensaje,
                'fecha' => $n->fecha,
                'leida' => $n->leida,
            ]) ?? [];

        // fichajes recientes (hoy y ayer)
        $fichajesRecientes = $empleado?->registrosHorario()
            ->where('hora_llegada', '>=', $ahora->copy()->subDay()->startOfDay())
            ->latest('hora_llegada')
            ->take(5)
            ->get()
            ->map(fn ($r) => [
                'hora_llegada' => $r->hora_llegada,
                'hora_salida' => $r->hora_salida,
            ]) ?? [];

        return response()->json([
            'registroAbierto' => $registroAbierto,
            'horasSemana' => round($horasSemana, 1),
            'horasSemanaAnterior' => round($horasSemanaAnterior, 1),
            'proyectosActivos' => $proyectos,
            'totalProyectos' => count($proyectos),
            'diasVacaciones' => $diasVacaciones,
            'solicitudesPendientes' => $solicitudesPendientes,
            'notificaciones' => $notificaciones,
            'fichajesRecientes' => $fichajesRecientes,
        ]);
    }

    // datos de fichaje
    public function fichaje(Request $request): JsonResponse
    {
        $empleado = $request->user();

        // incluye pausas para detectar si hay una activa
        $registroAbierto = $empleado?->registrosHorario()
            ->with('pausas')
            ->whereNull('hora_salida')
            ->latest('hora_llegada')
            ->first();

        $registros = $empleado?->registrosHorario()
            ->with('pausas')
            ->latest('hora_llegada')
            ->take(30)
            ->get() ?? [];

        return response()->json([
            'registroAbierto' => $registroAbierto,
            'registros' => $registros,
        ]);
    }

    // datos de ausencias
    public function ausencias(Request $request): JsonResponse
    {
        $empleado = $request->user();

        $tipos = TipoAusencia::all();
        $solicitudes = $empleado?->solicitudes()
            ->with('tipo')
            ->latest('id_solicitud')
            ->get() ?? [];

        return response()->json([
            'tipos' => $tipos,
            'solicitudes' => $solicitudes,
        ]);
    }

    // datos de timesheets
    public function timesheets(Request $request): JsonResponse
    {
        $empleado = $request->user();

        $timesheets = $empleado?->timesheets()
            ->latest('inicio_periodo')
            ->get()
            ->map(function ($ts) {
                $lineas = $ts->lineas()->map(function ($t) {
                    $horas = ($t->inicio && $t->fin)
                        ? round($t->inicio->diffInMinutes($t->fin) / 60, 2)
                        : 0;
                    return [
                        'id_tiempo' => $t->id_tiempo,
                        'tarea' => $t->tarea?->titulo ?? 'Sin tarea',
                        'proyecto' => $t->tarea?->proyecto?->nombre ?? '—',
                        'inicio' => $t->inicio?->toIso8601String(),
                        'fin' => $t->fin?->toIso8601String(),
                        'horas' => $horas,
                        'abierto' => $t->fin === null,
                    ];
                });

                return [
                    'id_timesheet' => $ts->id_timesheet,
                    'inicio_periodo' => $ts->inicio_periodo,
                    'fin_periodo' => $ts->fin_periodo,
                    'estado' => $ts->estado,
                    'comentario' => $ts->comentario,
                    'total_horas' => $ts->totalHoras(),
                    'lineas' => $lineas,
                ];
            }) ?? [];

        // tareas asignadas al empleado para imputar desde timesheets
        $tareasAsignadas = $empleado?->tareas()
            ->with('proyecto')
            ->whereIn('estado', ['pendiente', 'en_proceso', null, ''])
            ->get() ?? [];

        return response()->json([
            'timesheets' => $timesheets,
            'tareas' => $tareasAsignadas,
        ]);
    }

    // datos de calendario
    public function calendario(Request $request): JsonResponse
    {
        $empleado = $request->user();

        $eventos = EventoCalendario::where(function ($q) use ($empleado) {
            $q->where('id_empleado', $empleado?->id_empleado)
              ->orWhere('tipo', 'personal');
        })->get();

        $ausencias = $empleado?->solicitudes()
            ->where('estado', 'aprobada')
            ->with('tipo')
            ->get()
            ->map(fn ($a) => [
                'title' => $a->tipo->nombre ?? 'Ausencia',
                'start' => $a->inicio,
                'end' => $a->fin,
            ]) ?? [];

        $equipo = EventoCalendario::where('tipo', 'equipo')->get();
        $compania = EventoCalendario::where('tipo', 'compania')->get();

        // festivos visibles en el calendario
        $festivos = Festivo::orderBy('fecha')->get()->map(fn ($f) => [
            'id' => $f->id_festivo,
            'title' => $f->nombre,
            'start' => $f->fecha->format('Y-m-d'),
            'end' => $f->fecha->format('Y-m-d'),
            'descripcion' => $f->descripcion,
        ]);

        return response()->json([
            'eventos' => $eventos,
            'ausencias' => $ausencias,
            'equipo' => $equipo,
            'compania' => $compania,
            'festivos' => $festivos,
        ]);
    }

    // datos de notificaciones con paginación
    public function notificaciones(Request $request): JsonResponse
    {
        $empleado = $request->user();
        $porPagina = 5;

        $paginado = $empleado?->notificaciones()
            ->latest('id_notificacion')
            ->paginate($porPagina, ['*'], 'pagina', $request->query('pagina', 1));

        return response()->json([
            'notificaciones' => $paginado?->items() ?? [],
            'paginacion' => [
                'paginaActual' => $paginado?->currentPage() ?? 1,
                'totalPaginas' => $paginado?->lastPage() ?? 1,
                'total' => $paginado?->total() ?? 0,
                'porPagina' => $porPagina,
            ],
        ]);
    }

    // datos de proyectos (admin)
    public function proyectos(): JsonResponse
    {
        $proyectos = Proyecto::with(['empleados', 'tareas.empleado'])
            ->withCount('tareas')
            ->get();
        $empleados = Empleado::orderBy('nombre')->get();

        return response()->json([
            'proyectos' => $proyectos,
            'empleados' => $empleados,
        ]);
    }

    // datos de tareas (admin)
    public function tareas(): JsonResponse
    {
        $tareas = Tarea::with(['proyecto', 'empleados', 'tiempos'])->get();
        $proyectos = Proyecto::orderBy('nombre')->get();
        $empleados = Empleado::orderBy('nombre')->get();

        return response()->json([
            'tareas' => $tareas,
            'proyectos' => $proyectos,
            'empleados' => $empleados,
        ]);
    }

    // datos de equipo (admin)
    public function equipo(): JsonResponse
    {
        $empleados = Empleado::with('roles')->orderBy('nombre')->get();
        $departamentos = Departamento::all();
        $roles = Rol::all();

        return response()->json([
            'empleados' => $empleados,
            'departamentos' => $departamentos,
            'roles' => $roles,
        ]);
    }

    // datos de empresa (admin)
    public function empresa(): JsonResponse
    {
        $empresa = Empresa::first();

        return response()->json([
            'empresa' => $empresa,
        ]);
    }

    // datos de departamentos (admin)
    public function departamentos(): JsonResponse
    {
        $departamentos = Departamento::all();

        return response()->json([
            'departamentos' => $departamentos,
        ]);
    }

    // datos de tipos de ausencia (admin)
    public function tiposAusencia(): JsonResponse
    {
        $tipos = TipoAusencia::all();

        return response()->json([
            'tipos' => $tipos,
        ]);
    }

    // datos de revisiones (admin)
    public function revisiones(): JsonResponse
    {
        $correcciones = CorreccionFichaje::with(['registro.empleado', 'solicitante'])
            ->where('estado', 'pendiente')
            ->get();

        $solicitudes = Solicitud::with(['empleado', 'tipo'])
            ->where('estado', 'pendiente')
            ->get();

        $timesheets = Timesheet::with('empleado')
            ->where('estado', 'enviado')
            ->get();

        return response()->json([
            'correcciones' => $correcciones,
            'solicitudes' => $solicitudes,
            'timesheets' => $timesheets,
        ]);
    }

    // datos de reporting (admin) — delega en ReportingService
    public function reporting(Request $request, ReportingService $reporting): JsonResponse
    {
        $inicio = $request->query('inicio');
        $fin = $request->query('fin');

        return response()->json([
            'resumen' => $reporting->resumenProductividad($inicio, $fin),
            'horasPorProyecto' => $reporting->horasPorProyecto($inicio, $fin),
            'horasPorEmpleado' => $reporting->horasPorEmpleado($inicio, $fin),
            'ausenciasPorTipo' => $reporting->ausenciasPorTipo($inicio, $fin),
        ]);
    }

    // contadores para badges de la barra lateral
    public function contadores(Request $request): JsonResponse
    {
        $empleado = $request->user();
        $esAdmin = $empleado?->hasRole(['admin', 'responsable']);

        // notificaciones sin leer del usuario
        $notificaciones = Notificacion::where('id_empleado', $empleado?->id_empleado)
            ->where('leida', false)
            ->count();

        // solicitudes de ausencia pendientes del usuario
        $ausenciasPendientes = Solicitud::where('id_empleado', $empleado?->id_empleado)
            ->where('estado', 'pendiente')
            ->count();

        $contadores = [
            'notificaciones' => $notificaciones,
            'ausencias' => $ausenciasPendientes,
            'revisiones' => 0,
        ];

        // solo admins: pendientes de revisión
        if ($esAdmin) {
            $solicitudesPendientes = Solicitud::where('estado', 'pendiente')->count();
            $correccionesPendientes = CorreccionFichaje::where('estado', 'pendiente')->count();
            $timesheetsPendientes = Timesheet::where('estado', 'enviado')->count();
            $contadores['revisiones'] = $solicitudesPendientes + $correccionesPendientes + $timesheetsPendientes;
        }

        return response()->json($contadores);
    }

    // datos de festivos (admin)
    public function festivos(): JsonResponse
    {
        $festivos = Festivo::orderBy('fecha')->get();

        return response()->json([
            'festivos' => $festivos,
        ]);
    }
}
