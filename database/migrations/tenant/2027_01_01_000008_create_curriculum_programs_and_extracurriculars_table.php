<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'mysql';

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::connection($this->connection)->create('curriculum_programs', function (Blueprint $table) {
            $table->id();
            $table->string('category')->index(); // 'sekolah', 'kelas', 'akhlak', 'quran', 'uks'
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('time_allocation')->nullable();
            $table->integer('order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::connection($this->connection)->create('extracurriculars', function (Blueprint $table) {
            $table->id();
            $table->string('level')->index(); // 'KB', 'TK'
            $table->string('name');
            $table->integer('order')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection($this->connection)->dropIfExists('extracurriculars');
        Schema::connection($this->connection)->dropIfExists('curriculum_programs');
    }
};
