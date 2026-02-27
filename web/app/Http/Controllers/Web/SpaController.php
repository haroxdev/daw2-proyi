<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Departamento;
use App\Models\Empleado;
use App\Models\Empresa;
use App\Models\EventoCalendario;
use App\Models\Proyecto;
use App\Models\Rol;
use App\Models\Solicitud;
use App\Models\Tarea;
use App\Models\Timesheet;
use App\Models\TipoAusencia;
use App\Models\CorreccionFichaje;
use App\Models\Chat;
use App\Models\Notificacion;
use App\Models\Festivo;
use App\Services\ReportingService;
use Illuminate\Http\Request;

// controlador que renderiza la spa con los datos necesarios
// cada método prepara los datos específicos de cada página
class SpaController extends Controller
{
    // renderiza la spa con datos del panel
    public function panel()
    {
        return view('spa', ['datosPagina' => []]);
    }

    // renderiza la spa con datos de fichaje
    public function fichaje(Request $request)
    {
        $empleado = $request->user();
        
        $registroAbierto = $empleado?->registrosHorario()
            ->with('pausas')
            ->whereNull('hora_salida')
            ->latest('hora_llegada')
            ->first();

        $registros = $empleado?->registrosHorario()
            ->with('pausas')
            ->latest('hora_llegada')
            ->take(10)
            ->get() ?? [];

        return view('spa', [
            'datosPagina' => [
                'registroAbierto' => $registroAbierto,
                'registros' => $registros
            ]
        ]);
    }

    // renderiza la spa con datos de ausencias
    public function ausencias(Request $request)
    {
        $empleado = $request->user();
        
        $tipos = TipoAusencia::all();
        $solicitudes = $empleado?->solicitudes()
            ->with('tipo')
            ->latest('id_solicitud')
            ->get() ?? [];

        return view('spa', [
            'datosPagina' => [
                'tipos' => $tipos,
                'solicitudes' => $solicitudes
            ]
        ]);
    }

    // renderiza la spa con datos de timesheets
    public function timesheets(Request $request)
    {
        $empleado = $request->user();
        
        $timesheets = $empleado?->timesheets()
            ->latest('inicio_periodo')
            ->get() ?? [];

        return view('spa', [
            'datosPagina' => [
                'timesheets' => $timesheets
            ]
        ]);
    }

    // renderiza la spa con datos de calendario
    public function calendario(Request $request)
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
            ->map(fn($a) => [
                'title' => $a->tipo->nombre ?? 'Ausencia',
                'start' => $a->inicio,
                'end' => $a->fin
            ]) ?? [];

        $equipo = EventoCalendario::where('tipo', 'equipo')->get();
        $compania = EventoCalendario::where('tipo', 'compania')->get();

        return view('spa', [
            'datosPagina' => [
                'eventos' => $eventos,
                'ausencias' => $ausencias,
                'equipo' => $equipo,
                'compania' => $compania
            ]
        ]);
    }

    // renderiza la spa con datos de chat
    public function chat(Request $request)
    {
        $yo = $request->user();
        $contactoId = $request->session()->get('chat_contact_id');

        // contactos con los que ya hay conversación
        $idContactos = Chat::where(function ($q) use ($yo) {
                $q->where('id_remitente', $yo->id_empleado)
                  ->orWhere('id_destinatario', $yo->id_empleado);
            })
            ->get()
            ->flatMap(fn($m) => [$m->id_remitente, $m->id_destinatario])
            ->unique()
            ->reject(fn($id) => $id === $yo->id_empleado)
            ->values();

        // incluir contacto seleccionado aunque no haya mensajes aún
        if ($contactoId && !$idContactos->contains($contactoId)) {
            $idContactos = $idContactos->push($contactoId)->unique()->values();
        }

        $contactos = Empleado::whereIn('id_empleado', $idContactos)
            ->orderBy('nombre')
            ->get();

        // contactos nuevos disponibles (sin conversación abierta)
        $nuevosContactos = Empleado::where('id_empleado', '!=', $yo->id_empleado)
            ->whereNotIn('id_empleado', $idContactos)
            ->orderBy('nombre')
            ->get();

        // contacto seleccionado
        $contactoSeleccionado = $contactoId 
            ? Empleado::find($contactoId) 
            : null;

        // mensajes con el contacto seleccionado
        $mensajes = [];
        if ($contactoSeleccionado) {
            $mensajes = Chat::where(function($q) use ($yo, $contactoSeleccionado) {
                    $q->where(function($q2) use ($yo, $contactoSeleccionado) {
                        $q2->where('id_remitente', $yo->id_empleado)
                           ->where('id_destinatario', $contactoSeleccionado->id_empleado);
                    })->orWhere(function($q2) use ($yo, $contactoSeleccionado) {
                        $q2->where('id_remitente', $contactoSeleccionado->id_empleado)
                           ->where('id_destinatario', $yo->id_empleado);
                    });
                })
                ->with('remitente')
                ->orderBy('fecha_envio')
                ->get()
                ->map(fn($m) => [
                    'id' => $m->id_chat,
                    'mensaje' => $m->mensaje,
                    'fecha' => $m->fecha_envio?->format('d/m H:i'),
                    'fechaFormateada' => $m->fecha_envio?->format('d/m H:i'),
                    'soyYo' => $m->id_remitente === $yo->id_empleado,
                    'remitente' => $m->remitente->nombre ?? 'Desconocido'
                ]);
        }

        return view('spa', [
            'datosPagina' => [
                'contactos' => $contactos,
                'nuevosContactos' => $nuevosContactos,
                'contactoSeleccionado' => $contactoSeleccionado,
                'mensajes' => $mensajes
            ]
        ]);
    }

    // renderiza la spa con datos de notificaciones
    public function notificaciones(Request $request)
    {
        $empleado = $request->user();
        
        $notificaciones = Notificacion::where('id_empleado', $empleado?->id_empleado)
            ->latest('fecha')
            ->get();

        return view('spa', [
            'datosPagina' => [
                'notificaciones' => $notificaciones
            ]
        ]);
    }

    // renderiza la spa con datos de proyectos (admin)
    public function proyectos()
    {
        $proyectos = Proyecto::with('empleados')->get();
        $empleados = Empleado::where('estado', 'alta')->get();

        return view('spa', [
            'datosPagina' => [
                'proyectos' => $proyectos,
                'empleados' => $empleados
            ]
        ]);
    }

    // renderiza la spa con datos de tareas (admin)
    public function tareas()
    {
        $tareas = Tarea::with(['proyecto', 'empleado', 'tiempos'])->get();
        $proyectos = Proyecto::all();
        $empleados = Empleado::where('estado', 'alta')->get();

        return view('spa', [
            'datosPagina' => [
                'tareas' => $tareas,
                'proyectos' => $proyectos,
                'empleados' => $empleados
            ]
        ]);
    }

    // renderiza la spa con datos de equipo (admin)
    public function equipo()
    {
        $empleados = Empleado::with('roles')->get();
        $departamentos = Departamento::all();
        $roles = Rol::all();

        return view('spa', [
            'datosPagina' => [
                'empleados' => $empleados,
                'departamentos' => $departamentos,
                'roles' => $roles
            ]
        ]);
    }

    // renderiza la spa con datos de empresa (admin)
    public function empresa()
    {
        $empresa = Empresa::first();

        return view('spa', [
            'datosPagina' => [
                'empresa' => $empresa
            ]
        ]);
    }

    // renderiza la spa con datos de departamentos (admin)
    public function departamentos()
    {
        $departamentos = Departamento::all();

        return view('spa', [
            'datosPagina' => [
                'departamentos' => $departamentos
            ]
        ]);
    }

    // renderiza la spa con datos de tipos de ausencia (admin)
    public function tiposAusencia()
    {
        $tipos = TipoAusencia::all();

        return view('spa', [
            'datosPagina' => [
                'tipos' => $tipos
            ]
        ]);
    }

    // renderiza la spa con datos de revisiones (admin)
    public function revisiones()
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

        return view('spa', [
            'datosPagina' => [
                'correcciones' => $correcciones,
                'solicitudes' => $solicitudes,
                'timesheets' => $timesheets
            ]
        ]);
    }

    // renderiza la spa con datos de reporting (admin) — delega en ReportingService
    public function reporting(ReportingService $reporting)
    {
        return view('spa', [
            'datosPagina' => [
                'resumen' => $reporting->resumenProductividad(),
                'horasPorProyecto' => $reporting->horasPorProyecto(),
                'horasPorEmpleado' => $reporting->horasPorEmpleado(),
                'ausenciasPorTipo' => $reporting->ausenciasPorTipo(),
            ]
        ]);
    }

    // renderiza la spa con datos de festivos (admin)
    public function festivos()
    {
        $festivos = Festivo::orderBy('fecha')->get();

        return view('spa', [
            'datosPagina' => [
                'festivos' => $festivos
            ]
        ]);
    }
}
