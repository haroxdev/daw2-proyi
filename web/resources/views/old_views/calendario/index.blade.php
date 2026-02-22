@extends('layouts.app')

@section('title', 'Calendario')

@section('content')
<div class="row g-3">
    <div class="col-md-5">
        <div class="card shadow-sm h-100">
            <div class="card-body">
                <h5 class="card-title">Crear evento</h5>
                <form method="POST" action="/calendario/eventos">
                    @csrf
                    <div class="mb-3">
                        <label class="form-label">Titulo</label>
                        <input type="text" name="titulo" class="form-control" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Descripcion</label>
                        <textarea name="descripcion" class="form-control" rows="3"></textarea>
                    </div>
                    <div class="row g-2 mb-3">
                        <div class="col-6">
                            <label class="form-label">Inicio</label>
                            <input type="date" name="inicio" class="form-control" required>
                        </div>
                        <div class="col-6">
                            <label class="form-label">Fin</label>
                            <input type="date" name="fin" class="form-control">
                        </div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Tipo</label>
                        <select name="tipo" class="form-select">
                            <option value="personal" selected>Personal</option>
                            @if(auth()->user()?->hasRole(['admin','responsable']))
                                <option value="equipo">Equipo</option>
                                <option value="compania">Compania</option>
                            @endif
                        </select>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Ubicacion</label>
                        <input type="text" name="ubicacion" class="form-control" placeholder="Opcional">
                    </div>
                    <div class="form-check mb-3">
                        <input class="form-check-input" type="checkbox" value="1" id="todo_dia" name="todo_dia">
                        <label class="form-check-label" for="todo_dia">Todo el dia</label>
                    </div>
                    <button class="btn btn-primary w-100">Guardar evento</button>
                </form>
            </div>
        </div>
    </div>
    <div class="col-md-7">
        <div class="row g-3">
            <div class="col-12">
                <div class="card shadow-sm">
                    <div class="card-body">
                        <h5 class="card-title">Mis eventos</h5>
                        <ul class="list-group list-group-flush">
                            @forelse($eventos as $evento)
                                <li class="list-group-item">
                                    <div class="fw-semibold">{{ $evento->titulo ?? 'Evento' }}</div>
                                    <small class="text-muted">{{ $evento->inicio ?? $evento->start }} → {{ $evento->fin ?? $evento->end ?? '—' }}</small>
                                </li>
                            @empty
                                <li class="list-group-item text-muted">Sin eventos personales.</li>
                            @endforelse
                        </ul>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card shadow-sm">
                    <div class="card-body">
                        <h5 class="card-title">Ausencias aprobadas</h5>
                        <ul class="list-group list-group-flush">
                            @forelse($ausencias as $ausencia)
                                <li class="list-group-item">
                                    <div class="fw-semibold">{{ $ausencia['title'] ?? 'Ausencia' }}</div>
                                    <small class="text-muted">{{ $ausencia['start'] }} → {{ $ausencia['end'] }}</small>
                                </li>
                            @empty
                                <li class="list-group-item text-muted">Sin ausencias aprobadas.</li>
                            @endforelse
                        </ul>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card shadow-sm">
                    <div class="card-body">
                        <h5 class="card-title">Eventos de equipo</h5>
                        <ul class="list-group list-group-flush">
                            @forelse($equipo as $evento)
                                <li class="list-group-item">
                                    <div class="fw-semibold">{{ $evento->titulo ?? 'Evento' }}</div>
                                    <small class="text-muted">{{ $evento->inicio ?? $evento->start }} → {{ $evento->fin ?? $evento->end ?? '—' }}</small>
                                </li>
                            @empty
                                <li class="list-group-item text-muted">Sin eventos de equipo.</li>
                            @endforelse
                        </ul>
                    </div>
                </div>
            </div>
            <div class="col-12">
                <div class="card shadow-sm">
                    <div class="card-body">
                        <h5 class="card-title">Eventos de compania</h5>
                        <ul class="list-group list-group-flush">
                            @forelse($compania as $evento)
                                <li class="list-group-item">
                                    <div class="fw-semibold">{{ $evento->titulo ?? 'Evento' }}</div>
                                    <small class="text-muted">{{ $evento->inicio ?? $evento->start }} → {{ $evento->fin ?? $evento->end ?? '—' }}</small>
                                </li>
                            @empty
                                <li class="list-group-item text-muted">Sin eventos de compania.</li>
                            @endforelse
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
