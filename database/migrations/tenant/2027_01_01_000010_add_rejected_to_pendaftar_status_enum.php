<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    protected $connection = 'mysql';

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::connection($this->connection)->statement("ALTER TABLE pendaftar MODIFY COLUMN status ENUM('pending', 'revision', 'accepted', 'rejected') NOT NULL DEFAULT 'pending'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::connection($this->connection)->statement("ALTER TABLE pendaftar MODIFY COLUMN status ENUM('pending', 'revision', 'accepted') NOT NULL DEFAULT 'pending'");
    }
};
