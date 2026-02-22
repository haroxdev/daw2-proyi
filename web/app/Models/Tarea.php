<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Tarea extends Model
{
    use HasFactory;

    protected $table = 'tarea';
    protected $primaryKey = 'id_tarea';
    public $timestamps = false;

    protected $fillable = [
        'id_proyecto',
        'id_empleado',
        'titulo',
        'descripcion',
        'prioridad',
        'estado',
    ];

    public function proyecto(): BelongsTo
    {
        return $this->belongsTo(Proyecto::class, 'id_proyecto', 'id_proyecto');
    }

    // mantiene compatibilidad con asignación simple legacy
    public function empleado(): BelongsTo
    {
        return $this->belongsTo(Empleado::class, 'id_empleado', 'id_empleado');
    }

    // relación many-to-many para multi-asignación
    public function empleados(): BelongsToMany
    {
        return $this->belongsToMany(Empleado::class, 'tarea_empleado', 'id_tarea', 'id_empleado');
    }

    public function tiempos(): HasMany
    {
        return $this->hasMany(TiempoTarea::class, 'id_tarea', 'id_tarea');
    }
}
