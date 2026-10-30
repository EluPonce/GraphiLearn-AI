<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('model_versions', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('version')->nullable();
            $table->string('algorithm')->nullable(); // RandomForest, SVM, etc.
            $table->string('description')->nullable();
            $table->string('file_path'); // ruta al archivo .pkl o .joblib
            $table->json('metrics')->nullable(); // precision, recall, f1, confusion_matrix
            $table->boolean('active')->default(false);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('model_versions');
    }
};
?>
