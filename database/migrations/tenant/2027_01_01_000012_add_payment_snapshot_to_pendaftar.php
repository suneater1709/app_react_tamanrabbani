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
        Schema::connection($this->connection)->table('pendaftar', function (Blueprint $table) {
            if (! Schema::connection($this->connection)->hasColumn('pendaftar', 'entry_fee')) {
                $table->decimal('entry_fee', 12, 2)->default(0)->after('status');
            }
            if (! Schema::connection($this->connection)->hasColumn('pendaftar', 'form_fee')) {
                $table->decimal('form_fee', 12, 2)->default(0)->after('entry_fee');
            }
            if (! Schema::connection($this->connection)->hasColumn('pendaftar', 'discount_amount')) {
                $table->decimal('discount_amount', 12, 2)->default(0)->after('form_fee');
            }
            if (! Schema::connection($this->connection)->hasColumn('pendaftar', 'total_transfer_amount')) {
                $table->decimal('total_transfer_amount', 12, 2)->default(0)->after('discount_amount');
            }
            if (! Schema::connection($this->connection)->hasColumn('pendaftar', 'wave_name')) {
                $table->string('wave_name')->nullable()->after('total_transfer_amount');
            }
            if (! Schema::connection($this->connection)->hasColumn('pendaftar', 'payment_breakdown')) {
                $table->json('payment_breakdown')->nullable()->after('wave_name');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection($this->connection)->table('pendaftar', function (Blueprint $table) {
            $table->dropColumn([
                'entry_fee',
                'form_fee',
                'discount_amount',
                'total_transfer_amount',
                'wave_name',
                'payment_breakdown',
            ]);
        });
    }
};
