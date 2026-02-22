@extends('layouts.app')

@section('title', 'Proyectos')

@section('content')
<div class="row g-3">
    <div class="col-md-4">
        <div class="card shadow-sm">
            <div class="card-body">
                <h5 class="card-title">Nuevo proyecto</h5>
                <form method="POST" action="/proyectos">
                    @csrf
                    <div class="mb-3">
                        <label class="form-label">Nombre</label>
                        <input type="text" name="nombre" class="form-control" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Descripcion</label>
                        <textarea name="descripcion" class="form-control" rows="3"></textarea>
                    </div>
                    <div class="row g-2 mb-3">
                        <div class="col-6">
                            <label class="form-label">Inicio</label>
                            <input type="date" name="fecha_inicio" class="form-control">
                        </div>
                        <div class="col-6">
                            <label class="form-label">Fin</label>
                            <input type="date" name="fecha_fin" class="form-control">
                        </div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Estado</label>
                        <select name="estado" class="form-select">
                            <option value="">Sin estado</option>
                            <option value="activo">Activo</option>
                            <option value="en_pausa">En pausa</option>
                            <option value="finalizado">Finalizado</option>
                        </select>
                    </div>
                    <button class="btn btn-primary w-100">Crear proyecto</button>
                </form>
            </div>
        </div>
    </div>
    <div class="col-md-8">
        <div class="card shadow-sm">
            <div class="card-body">
                <h5 class="card-title">Proyectos</h5>
                <div class="table-responsive">
                    <table class="table table-sm align-middle">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Fechas</th>
                                <th>Estado</th>
                                <th>Equipo</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($proyectos as $proyecto)
                                <tr>
                                    <td>{{ $proyecto->nombre }}</td>
                                    <td>{{ $proyecto->fecha_inicio ?? '—' }} → {{ $proyecto->fecha_fin ?? '—' }}</td>
                                    <td><span class="badge bg-secondary">{{ $proyecto->estado ?? '—' }}</span></td>
                                    <td>
                                        <small>{{ $proyecto->empleados->pluck('nombre')->join(', ') ?: 'Sin asignar' }}</small>
                                        <form method="POST" action="/proyectos/{{ $proyecto->id_proyecto }}/asignar" class="mt-1">
                                            @csrf
                                            <div class="input-group input-group-sm">
                                                <select name="id_empleado" class="form-select" required>
                                                    <option value="" disabled selected>Asignar</option>
                                                    @foreach($empleados as $empleado)
                                                        <option value="{{ $empleado->id_empleado }}">{{ $empleado->nombre }}</option>
                                                    @endforeach
                                                </select>
                                                <button class="btn btn-outline-primary">Añadir</button>
                                            </div>
                                        </form>
                                    </td>
                                    <td class="text-nowrap">
                                        <form method="POST" action="/proyectos/{{ $proyecto->id_proyecto }}/estado" class="d-inline">
                                            @csrf
                                            <input type="hidden" name="estado" value="activo">
                                            <button class="btn btn-sm btn-outline-success">Activar</button>
                                        </form>
                                        <form method="POST" action="/proyectos/{{ $proyecto->id_proyecto }}/estado" class="d-inline ms-1">
                                            @csrf
                                            <input type="hidden" name="estado" value="finalizado">
                                            <button class="btn btn-sm btn-outline-secondary">Finalizar</button>
                                        </form>
                                    </td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="5" class="text-muted">Sin proyectos creados.</td>
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
