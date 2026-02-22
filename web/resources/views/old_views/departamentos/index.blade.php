@extends('layouts.app')

@section('title', 'Departamentos')

@section('content')
<div class="row g-3">
    <div class="col-md-4">
        <div class="card shadow-sm h-100">
            <div class="card-body">
                <h5 class="card-title">Nuevo departamento</h5>
                <form method="POST" action="/departamentos">
                    @csrf
                    <div class="mb-3">
                        <label class="form-label">Nombre</label>
                        <input type="text" name="nombre" class="form-control" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Descripcion</label>
                        <textarea name="descripcion" class="form-control" rows="3"></textarea>
                    </div>
                    <button class="btn btn-primary w-100">Crear</button>
                </form>
            </div>
        </div>
    </div>
    <div class="col-md-8">
        <div class="card shadow-sm">
            <div class="card-body">
                <h5 class="card-title">Departamentos</h5>
                <div class="table-responsive">
                    <table class="table table-sm align-middle">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Descripcion</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($departamentos as $departamento)
                                <tr>
                                    <form method="POST" action="/departamentos/{{ $departamento->id_departamento }}">
                                        @csrf
                                        <input type="hidden" name="_method" value="PUT">
                                        <td><input name="nombre" class="form-control form-control-sm" value="{{ $departamento->nombre }}" required></td>
                                        <td><input name="descripcion" class="form-control form-control-sm" value="{{ $departamento->descripcion }}"></td>
                                        <td class="text-nowrap">
                                            <button class="btn btn-sm btn-outline-primary">Guardar</button>
                                        </td>
                                    </form>
                                </tr>
                            @empty
                                <tr><td colspan="3" class="text-muted">Sin departamentos.</td></tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
