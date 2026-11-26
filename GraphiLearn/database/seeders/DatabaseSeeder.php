<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\Exercise;
use App\Models\Institution;
use App\Models\Student;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Cargar datos iniciales de prueba para GraphiLearn AI (Sprint 1).
     */
    public function run(): void
    {
        // 1. Institución Educativa
        $institution = Institution::create([
            'nombre'    => 'Unidad Educativa San José',
            'direccion' => 'Av. Educación #123, Zona Central',
        ]);

        // 2. Administrador del Sistema
        $admin = User::create([
            'institution_id' => $institution->id,
            'nombre'         => 'Lic. Ana Martínez',
            'correo'         => 'admin@graphilearn.test',
            'password'       => Hash::make('password'),
            'rol'            => 'administrador',
        ]);

        // 3. Docente Titular 1
        $docente1 = User::create([
            'institution_id' => $institution->id,
            'nombre'         => 'Prof. Carlos Morales',
            'correo'         => 'docente@graphilearn.test',
            'password'       => Hash::make('password'),
            'rol'            => 'docente',
        ]);

        // 4. Docente Titular 2 (para probar aislamiento multi-curso)
        $docente2 = User::create([
            'institution_id' => $institution->id,
            'nombre'         => 'Prof. Laura Gutiérrez',
            'correo'         => 'laura@graphilearn.test',
            'password'       => Hash::make('password'),
            'rol'            => 'docente',
        ]);

        // 5. Cursos
        $curso1 = Course::create([
            'institution_id' => $institution->id,
            'id_docente'     => $docente1->id,
            'nombre'         => 'Kinder A (Nivel Inicial)',
            'nivel'          => 'Inicial',
            'gestion'        => '2026',
        ]);

        $curso2 = Course::create([
            'institution_id' => $institution->id,
            'id_docente'     => $docente1->id,
            'nombre'         => 'Pre-Kinder A (Nivel Inicial)',
            'nivel'          => 'Inicial',
            'gestion'        => '2026',
        ]);

        $curso3 = Course::create([
            'institution_id' => $institution->id,
            'id_docente'     => $docente2->id,
            'nombre'         => 'Kinder B (Nivel Inicial)',
            'nivel'          => 'Inicial',
            'gestion'        => '2026',
        ]);

        // 6. Estudiantes asignados a cada curso
        $studentsCurso1 = [
            ['nombre' => 'Mateo Pérez Gómez', 'fecha_nacimiento' => '2020-03-15'],
            ['nombre' => 'Lucía Fernández Rojas', 'fecha_nacimiento' => '2020-07-22'],
            ['nombre' => 'Joaquín Mamani Quispe', 'fecha_nacimiento' => '2020-11-05'],
        ];

        foreach ($studentsCurso1 as $studentData) {
            Student::create([
                'id_curso'         => $curso1->id,
                'nombre'           => $studentData['nombre'],
                'fecha_nacimiento' => $studentData['fecha_nacimiento'],
            ]);
        }

        Student::create([
            'id_curso'         => $curso2->id,
            'nombre'           => 'Camila Vargas Mendoza',
            'fecha_nacimiento' => '2021-02-18',
        ]);

        $studentsCurso3 = [
            ['nombre' => 'Andrés Castro Silva', 'fecha_nacimiento' => '2020-05-10'],
            ['nombre' => 'Valentina Morales Peña', 'fecha_nacimiento' => '2020-09-30'],
        ];

        foreach ($studentsCurso3 as $studentData) {
            Student::create([
                'id_curso'         => $curso3->id,
                'nombre'           => $studentData['nombre'],
                'fecha_nacimiento' => $studentData['fecha_nacimiento'],
            ]);
        }

        // 7. Catálogo de los 4 tipos de ejercicio grafomotor
        $exercises = [
            [
                'nombre'      => 'Trazo de Línea Recta',
                'tipo_trazo'  => 'linea',
                'descripcion' => 'Ejercicio de continuidad y rectitud del trazo horizontal.',
                'activo'      => true,
            ],
            [
                'nombre'      => 'Trazo de Círculo',
                'tipo_trazo'  => 'circulo',
                'descripcion' => 'Ejercicio de cierre y redondez de trazo circular.',
                'activo'      => true,
            ],
            [
                'nombre'      => 'Trazo de Espiral',
                'tipo_trazo'  => 'espiral',
                'descripcion' => 'Ejercicio de modulación de curvatura y espaciado progresivo.',
                'activo'      => true,
            ],
            [
                'nombre'      => 'Trazo de Zigzag',
                'tipo_trazo'  => 'zigzag',
                'descripcion' => 'Ejercicio de cambio angular y conservación de vértices.',
                'activo'      => true,
            ],
        ];

        foreach ($exercises as $exerciseData) {
            Exercise::create($exerciseData);
        }

        $this->call(ModelVersionSeeder::class);
    }
}
