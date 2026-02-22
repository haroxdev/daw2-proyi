@extends('layouts.app')

@section('title', 'Fichaje')

@section('content')
<div class="row g-3">
    <div class="col-md-6">
        <div class="card shadow-sm">
            <div class="card-body">
                <h5 class="card-title">Entrada</h5>
                <p class="text-muted">Marca tu inicio de jornada.</p>
                <form method="POST" action="/fichaje/entrada">
                    @csrf
                    <div class="mb-3">
                        <label class="form-label">Hora</label>
                        <input type="datetime-local" name="hora" class="form-control" value="{{ now()->format('Y-m-d\TH:i') }}" required>
                    </div>
                    <button class="btn btn-success" {{ $registroAbierto ? 'disabled' : '' }}>Fichar entrada</button>
                </form>
                @if($registroAbierto)
                    <small class="text-warning d-block mt-2">Ya tienes un registro abierto desde {{ $registroAbierto->hora_llegada }}.</small>
                @endif
            </div>
        </div>
    </div>
    <div class="col-md-6">
        <div class="card shadow-sm">
            <div class="card-body">
                <h5 class="card-title">Salida</h5>
                <p class="text-muted">Cierra tu jornada activa.</p>
                <form method="POST" action="/fichaje/salida">
                    @csrf
                    <div class="mb-3">
                        <label class="form-label">Hora</label>
                        <input type="datetime-local" name="hora" class="form-control" value="{{ now()->format('Y-m-d\TH:i') }}" required>
                    </div>
                    <button class="btn btn-danger" {{ $registroAbierto ? '' : 'disabled' }}>Fichar salida</button>
                </form>
                @unless($registroAbierto)
                    <small class="text-muted d-block mt-2">No hay registro abierto.</small>
                @endunless
            </div>
        </div>
    </div>
</div>

<div class="row g-3 mt-3">
    <div class="col-12">
        <div class="card shadow-sm">
            <div class="card-body">
                <h5 class="card-title">Historial reciente</h5>
                <div class="table-responsive">
                    <table class="table table-sm align-middle">
                        <thead>
                            <tr>
                                <th>Entrada</th>
                                <th>Salida</th>
                                <th>Tiempo total</th>
                                <th>Pausas</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($registros as $registro)
                                <tr>
                                    <td>{{ $registro->hora_llegada }}</td>
                                    <td>{{ $registro->hora_salida ?? '—' }}</td>
                                    <td>{{ $registro->tiempo_total ?? '—' }}</td>
                                    <td>{{ $registro->pausas->count() }}</td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="4" class="text-muted">Sin registros aún.</td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
