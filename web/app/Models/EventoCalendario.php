<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EventoCalendario extends Model
{
    use HasFactory;

    protected $table = 'evento_calendario';
    protected $primaryKey = 'id_evento';

    public $timestamps = true;
    const CREATED_AT = 'fecha_creacion';
    const UPDATED_AT = 'fecha_actualizacion';

    protected $fillable = [
        'id_empleado',
        'titulo',
        'descripcion',
        'inicio',
        'fin',
        'tipo',
        'ubicacion',
        'todo_dia',
        'fecha_creacion',
        'fecha_actualizacion',
    ];

    protected $casts = [
        'todo_dia' => 'boolean',
    ];

    public function empleado(): BelongsTo
    {
        return $this->belongsTo(Empleado::class, 'id_empleado', 'id_empleado');
    }
}
