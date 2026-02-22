<?php

namespace App\Http\Controllers;

use App\Http\Requests\ChatEnviarRequest;
use App\Models\Chat;
use App\Models\Empleado;
use App\Services\AuditoriaService;
use App\Services\NotificacionesService;
use Illuminate\Http\Request;

class ChatController extends Controller
{
    public function __construct(private AuditoriaService $auditoria, private NotificacionesService $notificaciones)
    {
    }

    public function enviar(ChatEnviarRequest $request)
    {
        /** @var Empleado $remitente */
        $remitente = $request->user();
        $data = $request->validated();

        $mensaje = Chat::create([
            'id_remitente' => $remitente->id_empleado,
            'id_destinatario' => $data['id_destinatario'],
            'mensaje' => $data['mensaje'],
            'fecha_envio' => now(),
        ]);

        $this->auditoria->registrar($remitente, 'chat_enviar', 'chat', $mensaje->id_chat);
        if ($mensaje->destinatario) {
            $this->notificaciones->enviar($mensaje->destinatario, 'Nuevo mensaje de '.$remitente->nombre, 'chat');
        }

        if ($request->expectsJson()) {
            return response()->json($mensaje);
        }

        return back()->with('success', 'Mensaje enviado');
    }

    public function mensajes(Request $request)
    {
        /** @var Empleado $yo */
        $yo = $request->user();
        $contactoId = $request->session()->get('chat_contact_id');

        if (!$contactoId) {
            return response()->json(['mensajes' => []]);
        }

        $contacto = Empleado::find($contactoId);
        if (!$contacto) {
            return response()->json(['mensajes' => []]);
        }

        $mensajes = Chat::with(['remitente', 'destinatario'])
            ->where(function ($q) use ($yo, $contactoId) {
                $q->where(function ($q2) use ($yo, $contactoId) {
                    $q2->where('id_remitente', $yo->id_empleado)
                        ->where('id_destinatario', $contactoId);
                })->orWhere(function ($q2) use ($yo, $contactoId) {
                    $q2->where('id_remitente', $contactoId)
                        ->where('id_destinatario', $yo->id_empleado);
                });
            })
            ->orderBy('fecha_envio')
            ->take(200)
            ->get()
            ->map(function (Chat $m) use ($yo) {
                return [
                    'id' => $m->id_chat,
                    'soyYo' => $m->id_remitente === $yo->id_empleado,
                    'mensaje' => $m->mensaje,
                    'fecha' => $m->fecha_envio?->format('d/m H:i'),
                    'remitente' => $m->remitente?->nombre ?? 'Desconocido',
                    'destinatario' => $m->destinatario?->nombre ?? 'Desconocido',
                ];
            });

        return response()->json([
            'contacto' => [
                'id' => $contacto->id_empleado,
                'nombre' => $contacto->nombre,
                'email' => $contacto->email,
            ],
            'mensajes' => $mensajes,
        ]);
    }

    // devuelve datos para la spa: contactos con mensajes y contacto seleccionado
        public function indexData(Request $request)
        {
            $empleado = $request->user();
            $contactoIdSession = $request->session()->get('chat_contact_id');

            $contactIds = Chat::where('id_remitente', $empleado->id_empleado)->pluck('id_destinatario')
                ->merge(Chat::where('id_destinatario', $empleado->id_empleado)->pluck('id_remitente'))
                ->unique()
                ->values();

            if ($contactoIdSession) {
                $contactIds = $contactIds->push($contactoIdSession)->unique();
            }

            $contactos = Empleado::where('id_empleado', '!=', $empleado->id_empleado)
                ->whereIn('id_empleado', $contactIds)
                ->orderBy('nombre')
                ->get();

            $contactoSeleccionado = $contactos->firstWhere('id_empleado', $contactoIdSession);
            if (!$contactoSeleccionado && $contactos->isNotEmpty()) {
                $contactoSeleccionado = $contactos->first();
                $contactoIdSession = $contactoSeleccionado->id_empleado;
                $request->session()->put('chat_contact_id', $contactoIdSession);
            }

            $nuevosContactos = Empleado::where('id_empleado', '!=', $empleado->id_empleado)
                ->whereNotIn('id_empleado', $contactos->pluck('id_empleado'))
                ->orderBy('nombre')
                ->get();

            // cargar mensajes si hay contacto seleccionado
            $mensajes = [];
            if ($contactoSeleccionado) {
                $mensajes = $this->obtenerMensajesEntre($empleado->id_empleado, $contactoSeleccionado->id_empleado);
            }

            return response()->json([
                'contactos' => $contactos,
                'nuevosContactos' => $nuevosContactos,
                'contactoSeleccionado' => $contactoSeleccionado,
                'mensajes' => $mensajes,
            ]);
        }

    // selecciona un contacto y lo guarda en sesión
    public function seleccionar(Request $request)
    {
        $data = $request->validate(['contacto_id' => 'required|integer']);
        $request->session()->put('chat_contact_id', $data['contacto_id']);

        if ($request->expectsJson()) {
            return response()->json(['ok' => true]);
        }

        return redirect('/chat');
    }

    // inicia un nuevo chat con un contacto
    public function nuevo(Request $request)
    {
        $data = $request->validate(['contacto_id' => 'required|integer']);
        $request->session()->put('chat_contact_id', $data['contacto_id']);

        if ($request->expectsJson()) {
            return response()->json(['ok' => true]);
        }

        return redirect('/chat');
    }

    // obtiene mensajes con un contacto específico por id
    public function mensajesConContacto(Request $request, int $contactoId)
    {
        $yo = $request->user();
        
        // actualizar sesión con el contacto seleccionado
        $request->session()->put('chat_contact_id', $contactoId);
        
        $contacto = Empleado::find($contactoId);
        if (!$contacto) {
            return response()->json(['mensajes' => [], 'contacto' => null]);
        }

        $mensajes = $this->obtenerMensajesEntre($yo->id_empleado, $contactoId);

        return response()->json([
            'contacto' => [
                'id_empleado' => $contacto->id_empleado,
                'nombre' => $contacto->nombre,
                'email' => $contacto->email,
            ],
            'mensajes' => $mensajes,
        ]);
    }

    // obtiene los mensajes entre dos empleados
    private function obtenerMensajesEntre(int $idYo, int $idContacto): array
    {
        return Chat::with(['remitente', 'destinatario'])
            ->where(function ($q) use ($idYo, $idContacto) {
                $q->where(function ($q2) use ($idYo, $idContacto) {
                    $q2->where('id_remitente', $idYo)
                        ->where('id_destinatario', $idContacto);
                })->orWhere(function ($q2) use ($idYo, $idContacto) {
                    $q2->where('id_remitente', $idContacto)
                        ->where('id_destinatario', $idYo);
                });
            })
            ->orderBy('fecha_envio')
            ->take(200)
            ->get()
            ->map(function (Chat $m) use ($idYo) {
                return [
                    'id' => $m->id_chat,
                    'soyYo' => $m->id_remitente === $idYo,
                    'mensaje' => $m->mensaje,
                    'fecha' => $m->fecha_envio,
                    'fechaFormateada' => $m->fecha_envio?->format('d/m H:i'),
                    'remitente' => $m->remitente?->nombre ?? 'Desconocido',
                    'destinatario' => $m->destinatario?->nombre ?? 'Desconocido',
                ];
            })
            ->toArray();
    }
}
