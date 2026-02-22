@extends('layouts.app')

@section('title', 'Panel')

@section('content')
<div class="row g-3">
    <div class="col-md-4">
        <div class="card shadow-sm h-100">
            <div class="card-body">
                <h5 class="card-title">Fichaje</h5>
                <p class="card-text">Registrar entrada/salida y pausas.</p>
                <a href="/fichaje" class="btn btn-primary">Ir a fichaje</a>
            </div>
        </div>
    </div>
    <div class="col-md-4">
        <div class="card shadow-sm h-100">
            <div class="card-body">
                <h5 class="card-title">Ausencias</h5>
                <p class="card-text">Crear solicitudes de ausencia.</p>
                <a href="/ausencias" class="btn btn-primary">Solicitar</a>
            </div>
        </div>
    </div>
    <div class="col-md-4">
        <div class="card shadow-sm h-100">
            <div class="card-body">
                <h5 class="card-title">Timesheets</h5>
                <p class="card-text">Crea, envía y consulta tus periodos.</p>
                <a href="/timesheets" class="btn btn-primary">Ver timesheets</a>
            </div>
        </div>
    </div>
</div>
@endsection
