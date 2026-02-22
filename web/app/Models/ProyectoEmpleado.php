<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProyectoEmpleado extends Model
{
    use HasFactory;

    protected $table = 'proyecto_empleado';
    protected $primaryKey = 'id_proyecto_empleado';
    public $timestamps = false;

    protected $fillable = [
        'id_proyecto',
        'id_empleado',
    ];

    public function proyecto(): BelongsTo
    {
        return $this->belongsTo(Proyecto::class, 'id_proyecto', 'id_proyecto');
    }

    public function empleado(): BelongsTo
    {
        return $this->belongsTo(Empleado::class, 'id_empleado', 'id_empleado');
    }
}
