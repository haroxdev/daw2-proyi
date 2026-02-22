@extends('layouts.app')

@section('title', 'Tipos de ausencia')

@section('content')
<div class="row g-3">
    <div class="col-md-4">
        <div class="card shadow-sm h-100">
            <div class="card-body">
                <h5 class="card-title">Nuevo tipo</h5>
                <form method="POST" action="/tipos-ausencia">
                    @csrf
                    <div class="mb-3">
                        <label class="form-label">Nombre</label>
                        <input type="text" name="nombre" class="form-control" required>
                    </div>
                    <div class="form-check mb-3">
                        <input class="form-check-input" type="checkbox" value="1" id="remunerado" name="remunerado" checked>
                        <label class="form-check-label" for="remunerado">Remunerado</label>
                        
                    </div>
                    <button class="btn btn-primary w-100">Crear</button>
                </form>
            </div>
        </div>
    </div>
    <div class="col-md-8">
        <div class="card shadow-sm">
            <div class="card-body">
                <h5 class="card-title">Tipos de ausencia</h5>
                <div class="table-responsive">
                    <table class="table table-sm align-middle">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Remunerado</th>
                                <th class="text-end">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($tipos as $tipo)
                                <tr>
                                    <form method="POST" action="/tipos-ausencia/{{ $tipo->id_tipo }}">
                                        @csrf
                                        <input type="hidden" name="_method" value="PUT">
                                        <td><input name="nombre" class="form-control form-control-sm" value="{{ $tipo->nombre }}" required></td>
                                        <td>
                                            <div class="form-check form-switch">
                                                <input class="form-check-input" type="checkbox" name="remunerado" value="1" @checked($tipo->remunerado)>
                                            </div>
                                        </td>
                                        <td class="text-end text-nowrap">
                                            <button class="btn btn-sm btn-outline-primary">Guardar</button>
                                            <form method="POST" action="/tipos-ausencia/{{ $tipo->id_tipo }}" class="d-inline ms-1" onsubmit="return confirm('Eliminar este tipo?');">
                                                @csrf
                                                <input type="hidden" name="_method" value="DELETE">
                                                <button class="btn btn-sm btn-outline-light">Eliminar</button>
                                            </form>
                                        </td>
                                    </form>
                                </tr>
                            @empty
                                <tr><td colspan="3" class="text-muted">Sin tipos configurados.</td></tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
