@extends('layouts.app')

@section('title', 'Empresa')

@section('content')
<div class="row justify-content-center">
    <div class="col-md-6">
        <div class="card shadow-sm">
            <div class="card-body">
                <h5 class="card-title">Datos de la empresa</h5>
                <form method="POST" action="/empresa">
                    @csrf
                    <div class="mb-3">
                        <label class="form-label">Nombre</label>
                        <input type="text" name="nombre" class="form-control" value="{{ old('nombre', $empresa->nombre) }}" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">CIF</label>
                        <input type="text" name="cif" class="form-control" value="{{ old('cif', $empresa->cif) }}" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Email administración</label>
                        <input type="email" name="email_admin" class="form-control" value="{{ old('email_admin', $empresa->email_admin) }}" required>
                    </div>
                    <button class="btn btn-primary w-100">Guardar cambios</button>
                </form>
            </div>
        </div>
    </div>
</div>
@endsection
