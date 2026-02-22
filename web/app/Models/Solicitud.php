<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Solicitud extends Model
{
    use HasFactory;

    protected $table = 'solicitud';
    protected $primaryKey = 'id_solicitud';
    public $timestamps = false;

    protected $fillable = [
        'id_empleado',
        'id_tipo',
        'inicio',
        'fin',
        'comentario',
        'estado',
        'id_aprobador',
        'fecha_resolucion',
    ];

    public function empleado(): BelongsTo
    {
        return $this->belongsTo(Empleado::class, 'id_empleado', 'id_empleado');
    }

    public function tipo(): BelongsTo
    {
        return $this->belongsTo(TipoAusencia::class, 'id_tipo', 'id_tipo');
    }

    public function aprobador(): BelongsTo
    {
        return $this->belongsTo(Empleado::class, 'id_aprobador', 'id_empleado');
    }
}
