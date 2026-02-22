<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Chat;
use App\Models\Empleado;
use Illuminate\Http\Request;

class ChatPageController extends Controller
{
    public function __invoke(Request $request)
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

        $mensajes = collect();
        if ($contactoSeleccionado) {
            $mensajes = Chat::with(['remitente', 'destinatario'])
                ->where(function ($q) use ($empleado, $contactoIdSession) {
                    $q->where(function ($q2) use ($empleado, $contactoIdSession) {
                        $q2->where('id_remitente', $empleado->id_empleado)
                            ->where('id_destinatario', $contactoIdSession);
                    })->orWhere(function ($q2) use ($empleado, $contactoIdSession) {
                        $q2->where('id_remitente', $contactoIdSession)
                            ->where('id_destinatario', $empleado->id_empleado);
                    });
                })
                ->orderBy('fecha_envio')
                ->take(200)
                ->get();
        }

        return view('chat.index', [
            'mensajes' => $mensajes,
            'contactos' => $contactos,
            'nuevosContactos' => $nuevosContactos,
            'contactoSeleccionado' => $contactoSeleccionado,
        ]);
    }
}
