<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Cache;

class Program extends Model
{
    use HasFactory, SoftDeletes;

    protected $connection = 'mysql';

    protected $table = 'programs';

    protected $fillable = [
        'name',
        'code',
        'description',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function pendaftar()
    {
        return $this->hasMany(Pendaftar::class, 'program_id');
    }

    protected static function booted(): void
    {
        static::saved(function ($model) {
            Cache::forget('public_programs_list');
            Cache::forget('active_program_ids');
            Cache::forget("program_item_{$model->id}");
        });

        static::deleted(function ($model) {
            Cache::forget('public_programs_list');
            Cache::forget('active_program_ids');
            Cache::forget("program_item_{$model->id}");
        });
    }
}
