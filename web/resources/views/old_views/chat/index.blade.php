@extends('layouts.app')

@section('title', 'Chat')

@section('content')
@php
    use Illuminate\Support\Str;
    $yo = auth()->user();
    $initials = fn($nombre, $email) => Str::upper(Str::of($nombre ?? $email)->substr(0, 2));
    $fechaTexto = function ($fecha) {
        if ($fecha instanceof \Illuminate\Support\Carbon) {
            return $fecha->format('d/m H:i');
        }
        return \Carbon\Carbon::parse($fecha)->format('d/m H:i');
    };
    $contactoId = $contactoSeleccionado->id_empleado ?? null;
@endphp
<div class="row g-4">
    <div class="col-lg-4">
        <div class="card h-100">
            <div class="card-body d-flex flex-column gap-3">
                <div>
                    <div class="d-flex justify-content-between align-items-center mb-2 gap-2">
                        <div>
                            <h5 class="card-title mb-0">Contactos</h5>
                            <small class="text-muted">Conversaciones abiertas</small>
                        </div>
                        <div class="d-flex gap-2">
                            <form action="/chat/seleccionar" method="POST" class="d-none" id="chat-select-form">
                                @csrf
                                <input type="hidden" name="contacto_id" id="chat-select-input">
                            </form>
                            <button class="btn btn-outline-primary btn-sm" data-bs-toggle="modal" data-bs-target="#nuevoContactoModal" {{ $nuevosContactos->isEmpty() ? 'disabled' : '' }}>Nuevo contacto</button>
                        </div>
                    </div>
                    <div class="list-group list-group-flush border rounded-3" style="border-color: var(--panel-border);">
                        @forelse($contactos as $dest)
                            <button type="button" class="list-group-item d-flex align-items-center text-start chat-contact {{ ($contactoId === $dest->id_empleado) ? 'active' : '' }}" data-contacto="{{ $dest->id_empleado }}" style="background: {{ ($contactoId === $dest->id_empleado) ? 'var(--accent-soft)' : 'rgba(255,255,255,0.02)' }}; border: 1px solid var(--panel-border); padding: 0.85rem 1rem; color: inherit; text-decoration: none; border-radius: 0;">
                                <div class="chat-avatar me-2">{{ $initials($dest->nombre, $dest->email) }}</div>
                                <div class="flex-grow-1">
                                    <div class="fw-semibold">{{ $dest->nombre }}</div>
                                    <div class="text-muted small">{{ $dest->email }}</div>
                                </div>
                            </button>
                        @empty
                            <div class="list-group-item text-muted" style="background: rgba(255,255,255,0.02); border-color: var(--panel-border);">Sin contactos disponibles.</div>
                        @endforelse
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="col-lg-8">
        <div class="card h-100">
            <div class="card-body d-flex flex-column gap-3">
                <div class="d-flex align-items-center justify-content-between">
                    <div>
                        <h5 class="card-title mb-0">Conversación</h5>
                        @if($contactoSeleccionado)
                            <small class="text-muted">Con {{ $contactoSeleccionado->nombre }} ({{ $contactoSeleccionado->email }})</small>
                        @else
                            <small class="text-muted">Selecciona un contacto</small>
                        @endif
                    </div>
                </div>
                <div class="chat-window" id="chat-thread">
                    @if(!$contactoSeleccionado)
                        <div class="text-muted text-center">Selecciona un contacto para comenzar.</div>
                    @else
                        @forelse($mensajes as $mensaje)
                            @php
                                $soyYo = $mensaje->id_remitente === $yo->id_empleado;
                            @endphp
                            <div class="d-flex mb-3 {{ $soyYo ? 'justify-content-end' : 'justify-content-start' }}">
                                @unless($soyYo)
                                    <div class="chat-avatar me-2">{{ $initials($mensaje->remitente->nombre ?? 'U', $mensaje->remitente->email ?? 'user') }}</div>
                                @endunless
                                <div class="d-flex flex-column" style="max-width: 82%;">
                                    <div class="chat-bubble {{ $soyYo ? 'me' : 'them' }}">{{ $mensaje->mensaje }}</div>
                                    <div class="chat-meta {{ $soyYo ? 'text-end' : '' }}">
                                        {{ $soyYo ? 'Tú' : ($mensaje->remitente->nombre ?? 'Desconocido') }} · {{ $fechaTexto($mensaje->fecha_envio) }}
                                    </div>
                                </div>
                                @if($soyYo)
                                    <div class="chat-avatar ms-2">{{ $initials($yo->nombre ?? null, $yo->email) }}</div>
                                @endif
                            </div>
                        @empty
                            <div class="text-muted text-center">Sin mensajes todavía con este contacto. Envía el primero.</div>
                        @endforelse
                    @endif
                </div>
                @if($contactoSeleccionado)
                    <form method="POST" action="/chat" class="d-flex gap-2" id="chat-send-form">
                        @csrf
                        <input type="hidden" name="id_destinatario" value="{{ $contactoSeleccionado->id_empleado }}" id="chat-destinatario">
                        <input type="text" name="mensaje" class="form-control" placeholder="Escribe un mensaje" required id="chat-input">
                        <button class="btn btn-primary px-4" id="chat-send-btn">Enviar</button>
                    </form>
                @endif
            </div>
        </div>
    </div>
</div>

<!-- Modal nuevo contacto -->
<div class="modal fade" id="nuevoContactoModal" tabindex="-1" aria-labelledby="nuevoContactoLabel" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content" style="background: var(--panel); border-color: var(--panel-border);">
      <div class="modal-header">
        <h5 class="modal-title" id="nuevoContactoLabel">Nuevo contacto</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <form method="POST" action="/chat/nuevo" id="nuevo-contacto-form">
        @csrf
        <div class="modal-body">
            <label class="form-label">Selecciona a quién escribir</label>
            <select name="contacto_id" class="form-select" required {{ $nuevosContactos->isEmpty() ? 'disabled' : '' }}>
                <option value="" disabled selected>Elige un contacto</option>
                @foreach($nuevosContactos as $dest)
                    <option value="{{ $dest->id_empleado }}">{{ $dest->nombre }} ({{ $dest->email }})</option>
                @endforeach
            </select>
            @if($nuevosContactos->isEmpty())
                <small class="text-muted d-block mt-2">No hay contactos nuevos disponibles.</small>
            @endif
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-outline-light" data-bs-dismiss="modal">Cancelar</button>
          <button type="submit" class="btn btn-primary" {{ $nuevosContactos->isEmpty() ? 'disabled' : '' }}>Abrir chat</button>
        </div>
      </form>
    </div>
  </div>
</div>

@push('scripts')
<script>
document.addEventListener('DOMContentLoaded', () => {
    const csrf = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
    const contactButtons = document.querySelectorAll('.chat-contact');
    const threadEl = document.getElementById('chat-thread');
    const sendForm = document.getElementById('chat-send-form');
    const sendInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('chat-send-btn');
    const destInput = document.getElementById('chat-destinatario');
    const nuevoForm = document.getElementById('nuevo-contacto-form');
    let pollHandle = null;

    const currentContact = () => destInput?.value || null;

    const renderMensajes = (data) => {
        if (!threadEl) return;
        const mensajes = data.mensajes || [];
        if (!mensajes.length) {
            threadEl.innerHTML = '<div class="text-muted text-center">Sin mensajes todavía con este contacto. Envía el primero.</div>';
            return;
        }
        threadEl.innerHTML = mensajes.map(m => {
            const bubbleClass = m.soyYo ? 'me' : 'them';
            const alignClass = m.soyYo ? 'justify-content-end' : 'justify-content-start';
            const avatar = m.soyYo ? '{{ $initials($yo->nombre ?? null, $yo->email) }}' : ((m.remitente || 'U').slice(0,2).toUpperCase());
            return `
                <div class="d-flex mb-3 ${alignClass}">
                    ${m.soyYo ? '' : `<div class="chat-avatar me-2">${avatar}</div>`}
                    <div class="d-flex flex-column" style="max-width: 82%;">
                        <div class="chat-bubble ${bubbleClass}">${m.mensaje}</div>
                        <div class="chat-meta ${m.soyYo ? 'text-end' : ''}">${m.soyYo ? 'Tú' : m.remitente} · ${m.fecha}</div>
                    </div>
                    ${m.soyYo ? `<div class="chat-avatar ms-2">${avatar}</div>` : ''}
                </div>
            `;
        }).join('');
        threadEl.scrollTop = threadEl.scrollHeight;
    };

    const loadMensajes = async () => {
        if (!threadEl || !currentContact()) return;
        const res = await fetch('/chat/mensajes', { headers: { 'Accept': 'application/json' }});
        if (!res.ok) return;
        const data = await res.json();
        renderMensajes(data);
    };

    const ensurePolling = () => {
        if (pollHandle) clearInterval(pollHandle);
        if (!currentContact()) return;
        pollHandle = setInterval(loadMensajes, 4000);
    };

    contactButtons.forEach(btn => {
        btn.addEventListener('click', async () => {
            const contactoId = btn.getAttribute('data-contacto');
            const res = await fetch('/chat/seleccionar', {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': csrf,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ contacto_id: contactoId })
            });
            if (res.ok) {
                // update active state
                contactButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                if (destInput) destInput.value = contactoId;
                await loadMensajes();
                ensurePolling();
            } else {
                window.location.href = '/chat';
            }
        });
    });

    if (sendForm) {
        sendForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!sendInput.value.trim()) return;
            sendBtn.disabled = true;
            const formData = new FormData(sendForm);
            const res = await fetch('/chat', {
                method: 'POST',
                headers: { 'X-CSRF-TOKEN': csrf, 'Accept': 'application/json' },
                body: formData
            });
            sendBtn.disabled = false;
            if (res.ok) {
                sendInput.value = '';
                await loadMensajes();
                sendInput.focus();
            }
        });
    }

    if (nuevoForm) {
        nuevoForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(nuevoForm);
            const res = await fetch('/chat/nuevo', {
                method: 'POST',
                headers: { 'X-CSRF-TOKEN': csrf, 'Accept': 'application/json' },
                body: formData
            });
            if (res.ok) {
                const modalEl = document.getElementById('nuevoContactoModal');
                if (modalEl) {
                    const modal = bootstrap.Modal.getInstance(modalEl);
                    modal?.hide();
                }
                // reload to refresh contacts and set session selection
                window.location.href = '/chat';
            }
        });
    }

    loadMensajes();
    ensurePolling();
});
</script>
@endpush
@endsection
