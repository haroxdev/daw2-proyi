<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Pausa extends Model
{
    use HasFactory;

    protected $table = 'pausa';
    protected $primaryKey = 'id_pausa';
    public $timestamps = false;

    protected $fillable = [
        'id_registro',
        'inicio',
        'fin',
    ];

    protected $casts = [
        'inicio' => 'datetime',
        'fin' => 'datetime',
    ];

    public function registro(): BelongsTo
    {
        return $this->belongsTo(RegistroHorario::class, 'id_registro', 'id_registro');
    }
}
