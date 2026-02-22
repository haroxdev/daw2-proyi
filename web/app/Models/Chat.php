<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Chat extends Model
{
    use HasFactory;

    protected $table = 'chat';
    protected $primaryKey = 'id_chat';
    public $timestamps = false;

    protected $fillable = [
        'id_remitente',
        'id_destinatario',
        'mensaje',
        'fecha_envio',
    ];

    protected $casts = [
        'fecha_envio' => 'datetime',
    ];

    public function remitente(): BelongsTo
    {
        return $this->belongsTo(Empleado::class, 'id_remitente', 'id_empleado');
    }

    public function destinatario(): BelongsTo
    {
        return $this->belongsTo(Empleado::class, 'id_destinatario', 'id_empleado');
    }
}
