@extends('layouts.app')

@section('title', 'Equipo')

@section('content')
<div class="row g-3">
    <div class="col-lg-4">
        <div class="card shadow-sm h-100">
            <div class="card-body">
                <h5 class="card-title">Crear empleado</h5>
                <form method="POST" action="/equipo">
                    @csrf
                    <div class="mb-2">
                        <label class="form-label">DNI</label>
                        <input type="text" name="dni" class="form-control" required>
                    </div>
                    <div class="mb-2">
                        <label class="form-label">Nombre</label>
                        <input type="text" name="nombre" class="form-control" required>
                    </div>
                    <div class="mb-2">
                        <label class="form-label">Apellido 1</label>
                        <input type="text" name="apellido1" class="form-control" required>
                    </div>
                    <div class="mb-2">
                        <label class="form-label">Apellido 2</label>
                        <input type="text" name="apellido2" class="form-control">
                    </div>
                    <div class="mb-2">
                        <label class="form-label">Email</label>
                        <input type="email" name="email" class="form-control" required>
                    </div>
                    <div class="mb-2">
                        <label class="form-label">Contraseña</label>
                        <input type="password" name="contrasena" class="form-control" required>
                    </div>
                    <div class="mb-2">
                        <label class="form-label">Departamento</label>
                        <select name="id_departamento" class="form-select">
                            <option value="">Sin departamento</option>
                            @foreach($departamentos as $departamento)
                                <option value="{{ $departamento->id_departamento }}">{{ $departamento->nombre }}</option>
                            @endforeach
                        </select>
                    </div>
                    <div class="mb-2">
                        <label class="form-label">Estado</label>
                        <select name="estado" class="form-select">
                            <option value="alta" selected>Alta</option>
                            <option value="baja">Baja</option>
                            <option value="baja_temporal">Baja temporal</option>
                        </select>
                    </div>
                    <div class="mb-2">
                        <label class="form-label">Vacaciones restantes</label>
                        <input type="number" name="dias_vacaciones_restantes" class="form-control" min="0" value="22">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Roles</label>
                        <div class="d-flex flex-wrap gap-2">
                            @foreach($roles as $rol)
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" name="roles[]" value="{{ $rol->id_rol }}" id="rol_new_{{ $rol->id_rol }}">
                                    <label class="form-check-label" for="rol_new_{{ $rol->id_rol }}">{{ $rol->nombre }}</label>
                                </div>
                            @endforeach
                        </div>
                    </div>
                    <button class="btn btn-primary w-100">Crear</button>
                </form>
            </div>
        </div>
    </div>
    <div class="col-lg-8">
        <div class="card shadow-sm">
            <div class="card-body">
                <h5 class="card-title">Empleados</h5>
                <div class="table-responsive">
                    <table class="table table-sm align-middle">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Email</th>
                                <th>Departamento</th>
                                <th>Estado</th>
                                <th>Roles</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($empleados as $empleado)
                                <tr>
                                    <form method="POST" action="/equipo/{{ $empleado->id_empleado }}">
                                        @csrf
                                        <input type="hidden" name="_method" value="PUT">
                                        <td>
                                            <div class="input-group input-group-sm mb-1">
                                                <span class="input-group-text">Nombre</span>
                                                <input name="nombre" class="form-control" value="{{ $empleado->nombre }}" required>
                                            </div>
                                            <div class="input-group input-group-sm">
                                                <span class="input-group-text">Apellidos</span>
                                                <input name="apellido1" class="form-control" value="{{ $empleado->apellido1 }}" required>
                                                <input name="apellido2" class="form-control" value="{{ $empleado->apellido2 }}" placeholder="Opcional">
                                            </div>
                                            <input type="hidden" name="dni" value="{{ $empleado->dni }}">
                                        </td>
                                        <td>
                                            <input name="email" class="form-control form-control-sm" value="{{ $empleado->email }}" required>
                                        </td>
                                        <td>
                                            <select name="id_departamento" class="form-select form-select-sm">
                                                <option value="">Sin departamento</option>
                                                @foreach($departamentos as $departamento)
                                                    <option value="{{ $departamento->id_departamento }}" @selected($departamento->id_departamento === $empleado->id_departamento)>{{ $departamento->nombre }}</option>
                                                @endforeach
                                            </select>
                                        </td>
                                        <td>
                                            <select name="estado" class="form-select form-select-sm">
                                                <option value="alta" @selected($empleado->estado === 'alta')>Alta</option>
                                                <option value="baja" @selected($empleado->estado === 'baja')>Baja</option>
                                                <option value="baja_temporal" @selected($empleado->estado === 'baja_temporal')>Baja temporal</option>
                                            </select>
                                            <input type="number" name="dias_vacaciones_restantes" class="form-control form-control-sm mt-1" min="0" value="{{ $empleado->dias_vacaciones_restantes }}">
                                        </td>
                                        <td>
                                            <div class="d-flex flex-column gap-1">
                                                @foreach($roles as $rol)
                                                    <label class="form-check">
                                                        <input class="form-check-input" type="checkbox" name="roles[]" value="{{ $rol->id_rol }}" @checked($empleado->roles->contains('id_rol', $rol->id_rol))>
                                                        <span class="form-check-label">{{ $rol->nombre }}</span>
                                                    </label>
                                                @endforeach
                                            </div>
                                        </td>
                                        <td class="text-nowrap">
                                            <input type="password" name="contrasena" class="form-control form-control-sm mb-1" placeholder="Nueva contraseña">
                                            <button class="btn btn-sm btn-outline-primary w-100">Guardar</button>
                                        </td>
                                    </form>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="6" class="text-muted">No hay empleados.</td>
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
