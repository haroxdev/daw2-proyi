@extends('layouts.app')

@section('title', 'Solicitar ausencia')

@section('content')
<div class="row justify-content-center">
    <div class="col-md-6">
        <div class="card shadow-sm">
            <div class="card-body">
                <h5 class="card-title">Solicitud de ausencia</h5>
                <form method="POST" action="/ausencias">
                    @csrf
                    <div class="mb-3">
                        <label class="form-label">Tipo</label>
                        <select name="id_tipo" class="form-select" required>
                            <option value="" disabled selected>Selecciona un tipo</option>
                            @foreach($tipos as $tipo)
                                <option value="{{ $tipo->id_tipo }}">{{ $tipo->nombre }}</option>
                            @endforeach
                        </select>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Inicio</label>
                        <input type="date" name="inicio" class="form-control" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Fin</label>
                        <input type="date" name="fin" class="form-control" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Comentario</label>
                        <textarea name="comentario" class="form-control" rows="3"></textarea>
                    </div>
                    <button class="btn btn-primary">Enviar solicitud</button>
                </form>
            </div>
        </div>
    </div>
</div>

<div class="row mt-4">
    <div class="col-12">
        <div class="card shadow-sm">
            <div class="card-body">
                <h5 class="card-title">Mis solicitudes</h5>
                <div class="table-responsive">
                    <table class="table table-sm align-middle">
                        <thead>
                            <tr>
                                <th>Tipo</th>
                                <th>Inicio</th>
                                <th>Fin</th>
                                <th>Estado</th>
                                <th>Comentario</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($solicitudes as $solicitud)
                                <tr>
                                    <td>{{ $solicitud->tipo->nombre ?? '—' }}</td>
                                    <td>{{ $solicitud->inicio }}</td>
                                    <td>{{ $solicitud->fin }}</td>
                                    <td><span class="badge bg-secondary">{{ $solicitud->estado }}</span></td>
                                    <td>{{ $solicitud->comentario ?? '—' }}</td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="5" class="text-muted">Sin solicitudes aún.</td>
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
