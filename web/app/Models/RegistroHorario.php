<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RegistroHorario extends Model
{
    use HasFactory;

    protected $table = 'registro_horario';
    protected $primaryKey = 'id_registro';
    public $timestamps = false;

    protected $fillable = [
        'id_empleado',
        'hora_llegada',
        'hora_salida',
        'tiempo_total',
    ];

    protected $casts = [
        'hora_llegada' => 'datetime',
        'hora_salida' => 'datetime',
    ];

    public function empleado(): BelongsTo
    {
        return $this->belongsTo(Empleado::class, 'id_empleado', 'id_empleado');
    }

    public function pausas(): HasMany
    {
        return $this->hasMany(Pausa::class, 'id_registro', 'id_registro');
    }

    public function correcciones(): HasMany
    {
        return $this->hasMany(CorreccionFichaje::class, 'id_registro', 'id_registro');
    }
}
