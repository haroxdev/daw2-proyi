@extends('layouts.app')

@section('title', 'Tareas')

@section('content')
<div class="row g-3">
    <div class="col-md-4">
        <div class="card shadow-sm">
            <div class="card-body">
                <h5 class="card-title">Nueva tarea</h5>
                <form method="POST" action="/tareas">
                    @csrf
                    <div class="mb-3">
                        <label class="form-label">Proyecto</label>
                        <select name="id_proyecto" class="form-select" required>
                            <option value="" disabled selected>Selecciona</option>
                            @foreach($proyectos as $proyecto)
                                <option value="{{ $proyecto->id_proyecto }}">{{ $proyecto->nombre }}</option>
                            @endforeach
                        </select>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Asignar a</label>
                        <select name="id_empleado" class="form-select">
                            <option value="">Sin asignar</option>
                            @foreach($empleados as $empleado)
                                <option value="{{ $empleado->id_empleado }}">{{ $empleado->nombre }}</option>
                            @endforeach
                        </select>
                    </div>
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
                            <label class="form-label">Prioridad</label>
                            <select name="prioridad" class="form-select">
                                <option value="">—</option>
                                <option value="baja">Baja</option>
                                <option value="media">Media</option>
                                <option value="alta">Alta</option>
                            </select>
                        </div>
                        <div class="col-6">
                            <label class="form-label">Estado</label>
                            <select name="estado" class="form-select">
                                <option value="">Pendiente</option>
                                <option value="en_proceso">En proceso</option>
                                <option value="finalizada">Finalizada</option>
                            </select>
                        </div>
                    </div>
                    <button class="btn btn-primary w-100">Crear tarea</button>
                </form>
            </div>
        </div>
    </div>
    <div class="col-md-8">
        <div class="card shadow-sm">
            <div class="card-body">
                <h5 class="card-title">Tareas</h5>
                <div class="table-responsive">
                    <table class="table table-sm align-middle">
                        <thead>
                            <tr>
                                <th>Titulo</th>
                                <th>Proyecto</th>
                                <th>Asignado</th>
                                <th>Prioridad</th>
                                <th>Estado</th>
                                <th>Tiempo</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($tareas as $tarea)
                                <tr>
                                    <td>{{ $tarea->titulo }}</td>
                                    <td>{{ $tarea->proyecto->nombre ?? '—' }}</td>
                                    <td>{{ $tarea->empleado->nombre ?? 'Sin asignar' }}</td>
                                    <td><span class="badge bg-secondary">{{ $tarea->prioridad ?? '—' }}</span></td>
                                    <td><span class="badge bg-info text-dark">{{ $tarea->estado ?? 'pendiente' }}</span></td>
                                    <td>{{ $tarea->tiempos->count() }} registros</td>
                                    <td class="text-nowrap">
                                        <form method="POST" action="/tareas/{{ $tarea->id_tarea }}/asignar" class="d-inline">
                                            @csrf
                                            <input type="hidden" name="id_empleado" value="">
                                            <button class="btn btn-sm btn-outline-secondary">Desasignar</button>
                                        </form>
                                        <form method="POST" action="/tareas/{{ $tarea->id_tarea }}/asignar" class="d-inline ms-1">
                                            @csrf
                                            <select name="id_empleado" class="form-select form-select-sm d-inline w-auto">
                                                @foreach($empleados as $empleado)
                                                    <option value="{{ $empleado->id_empleado }}">{{ $empleado->nombre }}</option>
                                                @endforeach
                                            </select>
                                            <button class="btn btn-sm btn-outline-primary">Asignar</button>
                                        </form>
                                    </td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="7" class="text-muted">Sin tareas aún.</td>
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
