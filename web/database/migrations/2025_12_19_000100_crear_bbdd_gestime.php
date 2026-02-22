<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('empresa', function (Blueprint $table) {
            $table->id('id_empresa');
            $table->string('nombre', 100);
            $table->string('cif', 15);
            $table->string('email_admin', 100);
            $table->timestamp('fecha_creacion')->useCurrent();
            $table->timestamp('fecha_actualizacion')->nullable();
        });

        Schema::create('departamento', function (Blueprint $table) {
            $table->id('id_departamento');
            $table->string('nombre', 50);
            $table->text('descripcion')->nullable();
        });

        Schema::create('empleado', function (Blueprint $table) {
            $table->id('id_empleado');
            $table->string('dni', 15)->unique();
            $table->string('nombre', 50);
            $table->string('apellido1', 50);
            $table->string('apellido2', 50)->nullable();
            $table->string('email', 100)->unique();
            $table->string('contrasena', 255);
            $table->string('imagen_perfil', 255)->nullable();
            $table->enum('estado', ['alta', 'baja', 'baja_temporal'])->default('alta');
            $table->integer('dias_vacaciones_restantes')->default(0);
            $table->foreignId('id_departamento')->nullable()->constrained(table: 'departamento', column: 'id_departamento');
        });

        Schema::create('rol', function (Blueprint $table) {
            $table->id('id_rol');
            $table->string('nombre', 50);
            $table->text('descripcion')->nullable();
        });

        Schema::create('proyecto', function (Blueprint $table) {
            $table->id('id_proyecto');
            $table->string('nombre', 100);
            $table->text('descripcion')->nullable();
            $table->date('fecha_inicio')->nullable();
            $table->date('fecha_fin')->nullable();
            $table->enum('estado', ['activo', 'en_pausa', 'finalizado'])->default('activo');
        });

        Schema::create('rol_usuario', function (Blueprint $table) {
            $table->id('id_rol_usuario');
            $table->foreignId('id_empleado')->constrained(table: 'empleado', column: 'id_empleado');
            $table->foreignId('id_rol')->constrained(table: 'rol', column: 'id_rol');
            $table->foreignId('id_departamento')->nullable()->constrained(table: 'departamento', column: 'id_departamento');
            $table->foreignId('id_proyecto')->nullable()->constrained(table: 'proyecto', column: 'id_proyecto');
        });

        Schema::create('registro_horario', function (Blueprint $table) {
            $table->id('id_registro');
            $table->foreignId('id_empleado')->constrained(table: 'empleado', column: 'id_empleado');
            $table->dateTime('hora_llegada');
            $table->dateTime('hora_salida')->nullable();
            $table->time('tiempo_total')->nullable();
        });

        Schema::create('pausa', function (Blueprint $table) {
            $table->id('id_pausa');
            $table->foreignId('id_registro')->constrained(table: 'registro_horario', column: 'id_registro');
            $table->dateTime('inicio');
            $table->dateTime('fin')->nullable();
        });

        Schema::create('correccion_fichaje', function (Blueprint $table) {
            $table->id('id_correccion');
            $table->foreignId('id_registro')->constrained(table: 'registro_horario', column: 'id_registro');
            $table->foreignId('id_solicitante')->constrained(table: 'empleado', column: 'id_empleado');
            $table->dateTime('nuevo_inicio')->nullable();
            $table->dateTime('nuevo_fin')->nullable();
            $table->text('motivo')->nullable();
            $table->enum('estado', ['pendiente', 'aprobada', 'rechazada'])->default('pendiente');
            $table->foreignId('id_aprobador')->nullable()->constrained(table: 'empleado', column: 'id_empleado');
            $table->dateTime('fecha_resolucion')->nullable();
        });

        Schema::create('proyecto_empleado', function (Blueprint $table) {
            $table->id('id_proyecto_empleado');
            $table->foreignId('id_proyecto')->constrained(table: 'proyecto', column: 'id_proyecto');
            $table->foreignId('id_empleado')->constrained(table: 'empleado', column: 'id_empleado');
        });

        Schema::create('tarea', function (Blueprint $table) {
            $table->id('id_tarea');
            $table->foreignId('id_proyecto')->constrained(table: 'proyecto', column: 'id_proyecto');
            $table->foreignId('id_empleado')->nullable()->constrained(table: 'empleado', column: 'id_empleado');
            $table->string('titulo', 100);
            $table->text('descripcion')->nullable();
            $table->enum('prioridad', ['baja', 'media', 'alta'])->default('media');
            $table->enum('estado', ['pendiente', 'en_proceso', 'finalizada'])->default('pendiente');
        });

        Schema::create('tiempo_tarea', function (Blueprint $table) {
            $table->id('id_tiempo');
            $table->foreignId('id_tarea')->constrained(table: 'tarea', column: 'id_tarea');
            $table->foreignId('id_empleado')->constrained(table: 'empleado', column: 'id_empleado');
            $table->dateTime('inicio');
            $table->dateTime('fin')->nullable();
        });

        Schema::create('timesheet', function (Blueprint $table) {
            $table->id('id_timesheet');
            $table->foreignId('id_empleado')->constrained(table: 'empleado', column: 'id_empleado');
            $table->date('inicio_periodo');
            $table->date('fin_periodo');
            $table->enum('estado', ['borrador', 'enviado', 'aprobado', 'rechazado'])->default('borrador');
            $table->foreignId('id_aprobador')->nullable()->constrained(table: 'empleado', column: 'id_empleado');
            $table->text('comentario')->nullable();
        });

        Schema::create('tipo_ausencia', function (Blueprint $table) {
            $table->id('id_tipo');
            $table->string('nombre', 50);
            $table->boolean('remunerado')->default(true);
        });

        Schema::create('solicitud', function (Blueprint $table) {
            $table->id('id_solicitud');
            $table->foreignId('id_empleado')->constrained(table: 'empleado', column: 'id_empleado');
            $table->foreignId('id_tipo')->constrained(table: 'tipo_ausencia', column: 'id_tipo');
            $table->date('inicio');
            $table->date('fin');
            $table->text('comentario')->nullable();
            $table->enum('estado', ['pendiente', 'aprobada', 'rechazada', 'cancelada'])->default('pendiente');
            $table->foreignId('id_aprobador')->nullable()->constrained(table: 'empleado', column: 'id_empleado');
            $table->dateTime('fecha_resolucion')->nullable();
        });

        Schema::create('chat', function (Blueprint $table) {
            $table->id('id_chat');
            $table->foreignId('id_remitente')->constrained(table: 'empleado', column: 'id_empleado');
            $table->foreignId('id_destinatario')->constrained(table: 'empleado', column: 'id_empleado');
            $table->text('mensaje');
            $table->timestamp('fecha_envio')->useCurrent();
        });

        Schema::create('notificacion', function (Blueprint $table) {
            $table->id('id_notificacion');
            $table->foreignId('id_empleado')->constrained(table: 'empleado', column: 'id_empleado');
            $table->string('tipo', 50)->nullable();
            $table->text('mensaje')->nullable();
            $table->boolean('leida')->default(false);
            $table->timestamp('fecha')->useCurrent();
        });

        Schema::create('evento_calendario', function (Blueprint $table) {
            $table->id('id_evento');
            $table->foreignId('id_empleado')->nullable()->constrained(table: 'empleado', column: 'id_empleado');
            $table->string('titulo', 100);
            $table->text('descripcion')->nullable();
            $table->dateTime('inicio');
            $table->dateTime('fin')->nullable();
            $table->enum('tipo', ['personal', 'equipo', 'compania'])->default('personal');
            $table->string('ubicacion', 150)->nullable();
            $table->boolean('todo_dia')->default(false);
            $table->timestamp('fecha_creacion')->useCurrent();
            $table->timestamp('fecha_actualizacion')->nullable();
        });

        Schema::create('auditoria', function (Blueprint $table) {
            $table->id('id_auditoria');
            $table->foreignId('id_empleado')->nullable()->constrained(table: 'empleado', column: 'id_empleado');
            $table->string('accion', 100);
            $table->string('entidad', 50);
            $table->unsignedBigInteger('entidad_id');
            $table->timestamp('fecha')->useCurrent();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->text('payload');
            $table->integer('last_activity');
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('auditoria');
        Schema::dropIfExists('notificacion');
        Schema::dropIfExists('evento_calendario');
        Schema::dropIfExists('chat');
        Schema::dropIfExists('solicitud');
        Schema::dropIfExists('tipo_ausencia');
        Schema::dropIfExists('timesheet');
        Schema::dropIfExists('tiempo_tarea');
        Schema::dropIfExists('tarea');
        Schema::dropIfExists('proyecto_empleado');
        Schema::dropIfExists('rol_usuario');
        Schema::dropIfExists('proyecto');
        Schema::dropIfExists('correccion_fichaje');
        Schema::dropIfExists('pausa');
        Schema::dropIfExists('registro_horario');
        Schema::dropIfExists('rol');
        Schema::dropIfExists('empleado');
        Schema::dropIfExists('departamento');
        Schema::dropIfExists('empresa');
        Schema::dropIfExists('sessions');
        Schema::dropIfExists('password_reset_tokens');
    }
};
