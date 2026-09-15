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
        DB::connection($this->connection)->statement("ALTER TABLE student_documents MODIFY COLUMN document_type ENUM('birth_certificate', 'family_card', 'photo', 'payment_receipt') NOT NULL");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::connection($this->connection)->statement("ALTER TABLE student_documents MODIFY COLUMN document_type ENUM('birth_certificate', 'family_card', 'photo') NOT NULL");
    }
};
