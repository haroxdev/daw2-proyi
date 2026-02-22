<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // tabla pivot para multi-asignación de tareas
        Schema::create('tarea_empleado', function (Blueprint $table) {
            $table->id('id_tarea_empleado');
            $table->foreignId('id_tarea')->constrained(table: 'tarea', column: 'id_tarea')->cascadeOnDelete();
            $table->foreignId('id_empleado')->constrained(table: 'empleado', column: 'id_empleado')->cascadeOnDelete();
            $table->unique(['id_tarea', 'id_empleado']);
        });

        // migra asignaciones existentes de tarea.id_empleado a la tabla pivot
        DB::statement('
            INSERT INTO tarea_empleado (id_tarea, id_empleado)
            SELECT id_tarea, id_empleado FROM tarea WHERE id_empleado IS NOT NULL
        ');
    }

    public function down(): void
    {
        Schema::dropIfExists('tarea_empleado');
    }
};
