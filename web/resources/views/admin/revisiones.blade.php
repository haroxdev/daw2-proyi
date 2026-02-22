@extends('layouts.app')

@section('title', 'Revisiones')

@section('content')
<div class="row g-3">
    <div class="col-12">
        <div class="card shadow-sm">
            <div class="card-body">
                <h5 class="card-title">Correcciones de fichaje pendientes</h5>
                <div class="table-responsive">
                    <table class="table table-sm align-middle">
                        <thead>
                            <tr>
                                <th>Empleado</th>
                                <th>Solicitante</th>
                                <th>Inicio propuesto</th>
                                <th>Fin propuesto</th>
                                <th>Motivo</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($correcciones as $corr)
                                <tr>
                                    <td>{{ $corr->registro->empleado->nombre ?? '—' }}</td>
                                    <td>{{ $corr->solicitante->nombre ?? '—' }}</td>
                                    <td>{{ $corr->nuevo_inicio ?? '—' }}</td>
                                    <td>{{ $corr->nuevo_fin ?? '—' }}</td>
                                    <td>{{ $corr->motivo ?? '—' }}</td>
                                    <td class="text-nowrap">
                                        <form method="POST" action="/fichaje/correcciones/{{ $corr->id_correccion }}/resolver" class="d-inline">
                                            @csrf
                                            <input type="hidden" name="estado" value="aprobada">
                                            <button class="btn btn-sm btn-success">Aprobar</button>
                                        </form>
                                        <form method="POST" action="/fichaje/correcciones/{{ $corr->id_correccion }}/resolver" class="d-inline ms-1">
                                            @csrf
                                            <input type="hidden" name="estado" value="rechazada">
                                            <button class="btn btn-sm btn-outline-danger">Rechazar</button>
                                        </form>
                                    </td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="6" class="text-muted">Sin correcciones pendientes.</td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</div>

<div class="row g-3 mt-2">
    <div class="col-md-6">
        <div class="card shadow-sm h-100">
            <div class="card-body">
                <h5 class="card-title">Solicitudes de ausencia</h5>
                <div class="table-responsive">
                    <table class="table table-sm align-middle">
                        <thead>
                            <tr>
                                <th>Empleado</th>
                                <th>Tipo</th>
                                <th>Rango</th>
                                <th>Comentario</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($solicitudes as $sol)
                                <tr>
                                    <td>{{ $sol->empleado->nombre ?? '—' }}</td>
                                    <td>{{ $sol->tipo->nombre ?? '—' }}</td>
                                    <td>{{ $sol->inicio }} → {{ $sol->fin }}</td>
                                    <td>{{ $sol->comentario ?? '—' }}</td>
                                    <td class="text-nowrap">
                                        <form method="POST" action="/ausencias/{{ $sol->id_solicitud }}/resolver" class="d-inline">
                                            @csrf
                                            <input type="hidden" name="decision" value="aprobada">
                                            <button class="btn btn-sm btn-success">Aprobar</button>
                                        </form>
                                        <form method="POST" action="/ausencias/{{ $sol->id_solicitud }}/resolver" class="d-inline ms-1">
                                            @csrf
                                            <input type="hidden" name="decision" value="rechazada">
                                            <button class="btn btn-sm btn-outline-danger">Rechazar</button>
                                        </form>
                                    </td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="5" class="text-muted">Sin solicitudes pendientes.</td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
    <div class="col-md-6">
        <div class="card shadow-sm h-100">
            <div class="card-body">
                <h5 class="card-title">Timesheets enviados</h5>
                <div class="table-responsive">
                    <table class="table table-sm align-middle">
                        <thead>
                            <tr>
                                <th>Empleado</th>
                                <th>Periodo</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($timesheets as $ts)
                                <tr>
                                    <td>{{ $ts->empleado->nombre ?? '—' }}</td>
                                    <td>{{ $ts->inicio_periodo }} → {{ $ts->fin_periodo }}</td>
                                    <td class="text-nowrap">
                                        <form method="POST" action="/timesheets/{{ $ts->id_timesheet }}/revisar" class="d-inline">
                                            @csrf
                                            <input type="hidden" name="decision" value="aprobado">
                                            <input type="hidden" name="comentario" value="">
                                            <button class="btn btn-sm btn-success">Aprobar</button>
                                        </form>
                                        <form method="POST" action="/timesheets/{{ $ts->id_timesheet }}/revisar" class="d-inline ms-1">
                                            @csrf
                                            <input type="hidden" name="decision" value="rechazado">
                                            <input type="hidden" name="comentario" value="">
                                            <button class="btn btn-sm btn-outline-danger">Rechazar</button>
                                        </form>
                                    </td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="3" class="text-muted">Sin envíos pendientes.</td>
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
