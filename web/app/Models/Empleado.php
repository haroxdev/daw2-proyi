<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class Empleado extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $table = 'empleado';
    protected $primaryKey = 'id_empleado';
    public $timestamps = false;
    protected $rememberTokenName = null;

    protected $fillable = [
        'dni',
        'nombre',
        'apellido1',
        'apellido2',
        'email',
        'contrasena',
        'imagen_perfil',
        'estado',
        'dias_vacaciones_restantes',
        'id_departamento',
    ];

    protected $hidden = [
        'contrasena',
    ];

    protected $casts = [
        'contrasena' => 'hashed',
    ];

    public function getAuthPassword(): string
    {
        return $this->contrasena;
    }

    public function departamento(): BelongsTo
    {
        return $this->belongsTo(Departamento::class, 'id_departamento', 'id_departamento');
    }

    public function registrosHorario(): HasMany
    {
        return $this->hasMany(RegistroHorario::class, 'id_empleado', 'id_empleado');
    }

    public function solicitudes(): HasMany
    {
        return $this->hasMany(Solicitud::class, 'id_empleado', 'id_empleado');
    }

    public function notificaciones(): HasMany
    {
        return $this->hasMany(Notificacion::class, 'id_empleado', 'id_empleado');
    }

    public function eventosCalendario(): HasMany
    {
        return $this->hasMany(EventoCalendario::class, 'id_empleado', 'id_empleado');
    }

    // relación legacy simple (campo id_empleado en tarea)
    public function tareasDirectas(): HasMany
    {
        return $this->hasMany(Tarea::class, 'id_empleado', 'id_empleado');
    }

    // relación many-to-many para multi-asignación
    public function tareas(): BelongsToMany
    {
        return $this->belongsToMany(Tarea::class, 'tarea_empleado', 'id_empleado', 'id_tarea');
    }

    public function tiemposTarea(): HasMany
    {
        return $this->hasMany(TiempoTarea::class, 'id_empleado', 'id_empleado');
    }

    public function rolesUsuarios(): HasMany
    {
        return $this->hasMany(RolUsuario::class, 'id_empleado', 'id_empleado');
    }

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Rol::class, 'rol_usuario', 'id_empleado', 'id_rol')
            ->withPivot('id_departamento', 'id_proyecto');
    }

    public function hasRole(string|array $roles): bool
    {
        $roles = (array) $roles;
        return $this->roles()->whereIn('nombre', $roles)->exists();
    }

    public function proyectos(): BelongsToMany
    {
        return $this->belongsToMany(Proyecto::class, 'proyecto_empleado', 'id_empleado', 'id_proyecto');
    }

    public function chatsEnviados(): HasMany
    {
        return $this->hasMany(Chat::class, 'id_remitente', 'id_empleado');
    }

    public function chatsRecibidos(): HasMany
    {
        return $this->hasMany(Chat::class, 'id_destinatario', 'id_empleado');
    }

    public function correccionesSolicitadas(): HasMany
    {
        return $this->hasMany(CorreccionFichaje::class, 'id_solicitante', 'id_empleado');
    }

    public function correccionesAprobadas(): HasMany
    {
        return $this->hasMany(CorreccionFichaje::class, 'id_aprobador', 'id_empleado');
    }

    public function timesheets(): HasMany
    {
        return $this->hasMany(Timesheet::class, 'id_empleado', 'id_empleado');
    }

    public function timesheetsAprobados(): HasMany
    {
        return $this->hasMany(Timesheet::class, 'id_aprobador', 'id_empleado');
    }
}
