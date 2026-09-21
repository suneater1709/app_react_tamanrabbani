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
        Schema::connection($this->connection)->table('extracurriculars', function (Blueprint $table) {
            if (! Schema::connection($this->connection)->hasColumn('extracurriculars', 'is_active')) {
                $table->boolean('is_active')->default(true)->after('order');
            }
            if (! Schema::connection($this->connection)->hasColumn('extracurriculars', 'instructor')) {
                $table->string('instructor')->nullable()->after('name');
            }
            if (! Schema::connection($this->connection)->hasColumn('extracurriculars', 'schedule')) {
                $table->string('schedule')->nullable()->after('instructor');
            }
            if (! Schema::connection($this->connection)->hasColumn('extracurriculars', 'description')) {
                $table->text('description')->nullable()->after('schedule');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection($this->connection)->table('extracurriculars', function (Blueprint $table) {
            $table->dropColumn(['is_active', 'instructor', 'schedule', 'description']);
        });
    }
};
