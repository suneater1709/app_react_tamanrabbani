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
        Schema::connection($this->connection)->create('pendaftar', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('registration_number')->unique(); // e.g., TR-2027-0001
            $table->foreignId('program_id')->constrained('programs')->onDelete('restrict');
            $table->string('email');
            $table->string('phone');
            $table->string('full_name');
            $table->string('nickname');
            $table->string('nik')->unique();
            $table->enum('gender', ['L', 'P']);
            $table->string('birth_place');
            $table->date('birth_date');
            $table->string('religion')->default('Islam');
            $table->text('address');
            $table->string('previous_school')->nullable();
            $table->enum('status', ['pending', 'revision', 'accepted', 'rejected'])->default('pending');
            $table->text('verifier_notes')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            // Add index for searching
            $table->index(['full_name', 'registration_number', 'nik', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection($this->connection)->dropIfExists('pendaftar');
    }
};
