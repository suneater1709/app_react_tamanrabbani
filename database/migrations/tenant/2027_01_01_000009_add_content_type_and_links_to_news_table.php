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
        Schema::connection($this->connection)->table('news', function (Blueprint $table) {
            $table->string('content_type')->default('image')->after('content'); // 'image', 'file', 'link'
            $table->string('file_path')->nullable()->after('image');
            $table->string('external_link')->nullable()->after('file_path');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection($this->connection)->table('news', function (Blueprint $table) {
            $table->dropColumn(['content_type', 'file_path', 'external_link']);
        });
    }
};
