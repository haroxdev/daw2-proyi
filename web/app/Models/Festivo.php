<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Festivo extends Model
{
    protected $table = 'festivo';
    protected $primaryKey = 'id_festivo';
    public $timestamps = false;

    protected $fillable = [
        'fecha',
        'nombre',
        'descripcion',
        'recurrente',
        'id_empresa',
    ];

    protected $casts = [
        'fecha' => 'date',
        'recurrente' => 'boolean',
    ];

    public function empresa(): BelongsTo
    {
        return $this->belongsTo(Empresa::class, 'id_empresa', 'id_empresa');
    }
}
