<?php

namespace Database\Factories;

use App\Models\Departamento;
use App\Models\Empleado;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;

class EmpleadoFactory extends Factory
{
    protected $model = Empleado::class;

    public function definition(): array
    {
        return [
            'dni' => $this->faker->unique()->bothify('########A'),
            'nombre' => $this->faker->firstName(),
            'apellido1' => $this->faker->lastName(),
            'apellido2' => null,
            'email' => $this->faker->unique()->safeEmail(),
            'contrasena' => Hash::make('password'),
            'estado' => 'alta',
            'dias_vacaciones_restantes' => 22,
            'id_departamento' => Departamento::factory(),
        ];
    }
}
