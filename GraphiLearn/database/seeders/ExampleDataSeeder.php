<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\Institution;
use App\Models\Student;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * Datos ficticios para desarrollo y demostración. No usar como datos reales.
 * Idempotente: actualiza únicamente los registros identificados por estas claves de ejemplo.
 */
class ExampleDataSeeder extends Seeder
{
    public function run(): void
    {
        $institution = Institution::updateOrCreate(
            ['nombre' => 'INSTITUCIÓN DE EJEMPLO GraphiLearn'],
            ['direccion' => 'Dirección ficticia de ejemplo'],
        );

        $users = [
            'docente.ejemplo@graphilearn.test' => ['Docente de ejemplo', 'docente'],
            'admin.ejemplo@graphilearn.test' => ['Administrador de ejemplo', 'administrador'],
            'direccion.ejemplo@graphilearn.test' => ['Dirección de ejemplo', 'direccion'],
        ];

        $createdUsers = [];
        foreach ($users as $email => [$name, $role]) {
            $createdUsers[$role] = User::updateOrCreate(
                ['correo' => $email],
                [
                    'institution_id' => $institution->id,
                    'nombre' => $name,
                    'password' => Hash::make('Example-Only-ChangeMe-123!'),
                    'rol' => $role,
                ],
            );
        }

        foreach (['Curso de ejemplo A', 'Curso de ejemplo B'] as $courseName) {
            $course = Course::updateOrCreate(
                [
                    'institution_id' => $institution->id,
                    'nombre' => $courseName,
                    'gestion' => 'EJEMPLO',
                ],
                [
                    'id_docente' => $createdUsers['docente']->id,
                    'nivel' => 'Inicial (ejemplo)',
                ],
            );

            for ($number = 1; $number <= 6; $number++) {
                $studentName = sprintf('Estudiante de ejemplo %02d', $number);
                Student::updateOrCreate(
                    ['id_curso' => $course->id, 'nombre' => $studentName],
                    ['fecha_nacimiento' => '2020-01-01'],
                );
            }
        }

        $this->command?->info('Datos de EJEMPLO cargados: 1 institución, 1 docente, 1 administrador, 1 dirección, 2 cursos y 6 estudiantes por curso.');
        $this->command?->warn('Credencial de desarrollo para las tres cuentas: Example-Only-ChangeMe-123!');
    }
}
