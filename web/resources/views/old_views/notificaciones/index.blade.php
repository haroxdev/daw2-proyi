@extends('layouts.app')

@section('title', 'Notificaciones')

@section('content')
<div class="d-flex justify-content-between align-items-center mb-3">
    <h4 class="mb-0">Notificaciones</h4>
    <form method="POST" action="/notificaciones/leer-todas">
        @csrf
        <button class="btn btn-sm btn-outline-primary">Marcar todas como leidas</button>
    </form>
</div>
<div class="list-group">
    @forelse($notificaciones as $notificacion)
        <div class="list-group-item d-flex justify-content-between align-items-start {{ $notificacion->leida ? '' : 'list-group-item-info' }}">
            <div>
                <div class="fw-semibold">{{ $notificacion->tipo ?? 'General' }}</div>
                <div>{{ $notificacion->mensaje ?? '—' }}</div>
                <small class="text-muted">{{ $notificacion->fecha }}</small>
            </div>
            @if(! $notificacion->leida)
                <form method="POST" action="/notificaciones/{{ $notificacion->id_notificacion }}/leer">
                    @csrf
                    <button class="btn btn-sm btn-outline-secondary">Marcar leida</button>
                </form>
            @endif
        </div>
    @empty
        <div class="list-group-item text-muted">Sin notificaciones.</div>
    @endforelse
</div>
@endsection
