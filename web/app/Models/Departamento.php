<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Departamento extends Model
{
    use HasFactory;

    protected $table = 'departamento';
    protected $primaryKey = 'id_departamento';
    public $timestamps = false;

    protected $fillable = [
        'nombre',
        'descripcion',
    ];

    public function empleados(): HasMany
    {
        return $this->hasMany(Empleado::class, 'id_departamento', 'id_departamento');
    }

    public function rolUsuarios(): HasMany
    {
        return $this->hasMany(RolUsuario::class, 'id_departamento', 'id_departamento');
    }
}
