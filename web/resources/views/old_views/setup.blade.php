@extends('layouts.app')

@section('title', 'Setup inicial')

@section('content')
<div class="row justify-content-center">
    <div class="col-md-8">
        <div class="card shadow-sm">
            <div class="card-body">
                <h5 class="card-title mb-3">Configuración inicial</h5>
                <p class="text-muted">Completa los datos para crear la empresa y el usuario administrador.</p>
                <form method="POST" action="/setup">
                    @csrf
                    <div class="row g-3">
                        <div class="col-12">
                            <h6 class="fw-bold">Empresa</h6>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label">Nombre</label>
                            <input type="text" name="empresa_nombre" class="form-control" required>
                        </div>
                        <div class="col-md-3">
                            <label class="form-label">CIF</label>
                            <input type="text" name="empresa_cif" class="form-control" required>
                        </div>
                        <div class="col-md-3">
                            <label class="form-label">Email admin</label>
                            <input type="email" name="empresa_email" class="form-control" required>
                        </div>

                        <div class="col-12 mt-3">
                            <h6 class="fw-bold">Administrador</h6>
                        </div>
                        <div class="col-md-4">
                            <label class="form-label">DNI</label>
                            <input type="text" name="admin_dni" class="form-control" required>
                        </div>
                        <div class="col-md-4">
                            <label class="form-label">Nombre</label>
                            <input type="text" name="admin_nombre" class="form-control" required>
                        </div>
                        <div class="col-md-4">
                            <label class="form-label">Primer apellido</label>
                            <input type="text" name="admin_apellido1" class="form-control" required>
                        </div>
                        <div class="col-md-4">
                            <label class="form-label">Segundo apellido</label>
                            <input type="text" name="admin_apellido2" class="form-control">
                        </div>
                        <div class="col-md-4">
                            <label class="form-label">Email</label>
                            <input type="email" name="admin_email" class="form-control" required>
                        </div>
                        <div class="col-md-4">
                            <label class="form-label">Contraseña</label>
                            <input type="password" name="admin_password" class="form-control" minlength="8" required>
                        </div>
                    </div>

                    <div class="mt-4 d-flex justify-content-end gap-2">
                        <button class="btn btn-primary">Crear empresa y admin</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>
@endsection
