@extends('layouts.app')

@section('title', 'Reporting')

@section('content')
<div class="row g-3 mb-3">
    <div class="col-md-3">
        <div class="card shadow-sm">
            <div class="card-body">
                <div class="text-muted">Tareas totales</div>
                <div class="h4 mb-0">{{ $resumen['tareas_totales'] ?? 0 }}</div>
            </div>
        </div>
    </div>
    <div class="col-md-3">
        <div class="card shadow-sm">
            <div class="card-body">
                <div class="text-muted">Tareas finalizadas</div>
                <div class="h4 mb-0">{{ $resumen['tareas_finalizadas'] ?? 0 }}</div>
            </div>
        </div>
    </div>
    <div class="col-md-3">
        <div class="card shadow-sm">
            <div class="card-body">
                <div class="text-muted">Horas en tareas</div>
                <div class="h4 mb-0">{{ $resumen['horas_en_tareas'] ?? 0 }}</div>
            </div>
        </div>
    </div>
    <div class="col-md-3">
        <div class="card shadow-sm">
            <div class="card-body">
                <div class="text-muted">Horas en jornada</div>
                <div class="h4 mb-0">{{ $resumen['horas_en_jornada'] ?? 0 }}</div>
            </div>
        </div>
    </div>
</div>

<div class="card shadow-sm">
    <div class="card-body">
        <h5 class="card-title">Horas por proyecto</h5>
        <div class="table-responsive">
            <table class="table table-sm align-middle">
                <thead>
                    <tr>
                        <th>Proyecto</th>
                        <th>Horas</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($horasPorProyecto as $row)
                        <tr>
                            <td>{{ $row['proyecto'] }}</td>
                            <td>{{ $row['horas'] }}</td>
                        </tr>
                    @empty
                        <tr><td colspan="2" class="text-muted">Sin datos.</td></tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>
</div>
@endsection
