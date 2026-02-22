<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// migración para la tabla de festivos y días no laborables
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('festivo', function (Blueprint $table) {
            $table->id('id_festivo');
            $table->date('fecha');
            $table->string('nombre', 100);
            $table->string('descripcion', 255)->nullable();
            $table->boolean('recurrente')->default(false);
            $table->unsignedBigInteger('id_empresa')->nullable();

            $table->foreign('id_empresa')
                ->references('id_empresa')
                ->on('empresa')
                ->onDelete('cascade');

            $table->unique(['fecha', 'id_empresa']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('festivo');
    }
};
