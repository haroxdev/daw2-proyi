<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TipoAusencia extends Model
{
    use HasFactory;

    protected $table = 'tipo_ausencia';
    protected $primaryKey = 'id_tipo';
    public $timestamps = false;

    protected $fillable = [
        'nombre',
        'remunerado',
    ];

    protected $casts = [
        'remunerado' => 'boolean',
    ];

    public function solicitudes(): HasMany
    {
        return $this->hasMany(Solicitud::class, 'id_tipo', 'id_tipo');
    }
}
