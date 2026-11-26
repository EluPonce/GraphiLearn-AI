<?php

namespace Database\Seeders;

use App\Models\ModelVersion;
use App\Models\User;
use Illuminate\Database\Seeder;

class ModelVersionSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('rol', 'administrador')->first();

        ModelVersion::firstOrCreate(
            ['version' => '1.0.0'],
            [
                'name'        => 'GraphiLearn Vision Core',
                'version'     => '1.0.0',
                'algorithm'   => 'RandomForest + OpenCV (Zhang-Suen)',
                'description' => 'Motor de visión por computadora calibrado para la evaluación grafomotora de nivel inicial.',
                'file_path'   => 'models/graphilearn_rf_v1.pkl',
                'metrics'     => [
                    'exactitud'   => '92.4%',
                    'kappa_cohen' => '0.88',
                    'f1_score'    => '0.91',
                ],
                'active'      => true,
                'created_by'  => $admin?->id,
            ]
        );
    }
}
