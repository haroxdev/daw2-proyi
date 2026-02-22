@extends('layouts.app')

@section('title', 'Timesheets')

@section('content')
<div class="row g-3">
    <div class="col-md-5">
        <div class="card shadow-sm">
            <div class="card-body">
                <h5 class="card-title">Crear timesheet</h5>
                <form method="POST" action="/timesheets">
                    @csrf
                    <div class="mb-3">
                        <label class="form-label">Inicio periodo</label>
                        <input type="date" name="inicio_periodo" class="form-control" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Fin periodo</label>
                        <input type="date" name="fin_periodo" class="form-control" required>
                    </div>
                    <button class="btn btn-primary">Crear borrador</button>
                </form>
            </div>
        </div>
    </div>
    <div class="col-md-7">
        <div class="card shadow-sm">
            <div class="card-body">
                <h5 class="card-title">Mis timesheets</h5>
                <div class="table-responsive">
                    <table class="table table-sm align-middle">
                        <thead>
                            <tr>
                                <th>Periodo</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($timesheets as $timesheet)
                                <tr>
                                    <td>{{ $timesheet->inicio_periodo }} → {{ $timesheet->fin_periodo }}</td>
                                    <td><span class="badge bg-secondary">{{ $timesheet->estado }}</span></td>
                                    <td>
                                        @if($timesheet->estado === 'borrador')
                                            <form method="POST" action="/timesheets/{{ $timesheet->id_timesheet }}/enviar" class="d-inline">
                                                @csrf
                                                <button class="btn btn-sm btn-outline-primary">Enviar</button>
                                            </form>
                                        @else
                                            <span class="text-muted">Sin acciones</span>
                                        @endif
                                    </td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="3" class="text-muted">Sin timesheets aún.</td>
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
