<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('analysis_results', 'risk_label')) {
            Schema::table('analysis_results', function (Blueprint $table) {
                $table->renameColumn('risk_label', 'sugerencia');
            });
        }
        if (Schema::hasColumn('analysis_results', 'risk_score')) {
            Schema::table('analysis_results', function (Blueprint $table) {
                $table->dropColumn('risk_score');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('analysis_results', 'sugerencia')) {
            Schema::table('analysis_results', function (Blueprint $table) {
                $table->renameColumn('sugerencia', 'risk_label');
            });
        }
        if (! Schema::hasColumn('analysis_results', 'risk_score')) {
            Schema::table('analysis_results', function (Blueprint $table) {
                $table->float('risk_score')->nullable();
            });
        }
    }
};
