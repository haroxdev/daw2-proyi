<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CorreccionFichaje extends Model
{
    use HasFactory;

    protected $table = 'correccion_fichaje';
    protected $primaryKey = 'id_correccion';
    public $timestamps = false;

    protected $fillable = [
        'id_registro',
        'id_solicitante',
        'id_aprobador',
        'nuevo_inicio',
        'nuevo_fin',
        'motivo',
        'estado',
        'fecha_resolucion',
    ];

    public function registro(): BelongsTo
    {
        return $this->belongsTo(RegistroHorario::class, 'id_registro', 'id_registro');
    }

    public function solicitante(): BelongsTo
    {
        return $this->belongsTo(Empleado::class, 'id_solicitante', 'id_empleado');
    }

    public function aprobador(): BelongsTo
    {
        return $this->belongsTo(Empleado::class, 'id_aprobador', 'id_empleado');
    }
}
