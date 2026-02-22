<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Proyecto extends Model
{
    use HasFactory;

    protected $table = 'proyecto';
    protected $primaryKey = 'id_proyecto';
    public $timestamps = false;

    protected $fillable = [
        'nombre',
        'descripcion',
        'fecha_inicio',
        'fecha_fin',
        'estado',
    ];

    public function empleados(): BelongsToMany
    {
        return $this->belongsToMany(Empleado::class, 'proyecto_empleado', 'id_proyecto', 'id_empleado');
    }

    public function tareas(): HasMany
    {
        return $this->hasMany(Tarea::class, 'id_proyecto', 'id_proyecto');
    }

    public function rolUsuarios(): HasMany
    {
        return $this->hasMany(RolUsuario::class, 'id_proyecto', 'id_proyecto');
    }

    public function proyectoEmpleados(): HasMany
    {
        return $this->hasMany(ProyectoEmpleado::class, 'id_proyecto', 'id_proyecto');
    }
}
