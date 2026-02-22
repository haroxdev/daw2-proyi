<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Timesheet extends Model
{
    use HasFactory;

    protected $table = 'timesheet';
    protected $primaryKey = 'id_timesheet';
    public $timestamps = false;

    protected $fillable = [
        'id_empleado',
        'inicio_periodo',
        'fin_periodo',
        'estado',
        'id_aprobador',
        'comentario',
    ];

    public function empleado(): BelongsTo
    {
        return $this->belongsTo(Empleado::class, 'id_empleado', 'id_empleado');
    }

    public function aprobador(): BelongsTo
    {
        return $this->belongsTo(Empleado::class, 'id_aprobador', 'id_empleado');
    }

    // obtiene los tiempos imputados del empleado dentro del periodo
    public function lineas()
    {
        return TiempoTarea::where('id_empleado', $this->id_empleado)
            ->whereDate('inicio', '>=', $this->inicio_periodo)
            ->whereDate('inicio', '<=', $this->fin_periodo)
            ->with('tarea.proyecto')
            ->get();
    }

    // calcula total de horas del periodo
    public function totalHoras(): float
    {
        return $this->lineas()->sum(function ($t) {
            if (!$t->inicio || !$t->fin) return 0;
            return round($t->inicio->diffInMinutes($t->fin) / 60, 2);
        });
    }
}
