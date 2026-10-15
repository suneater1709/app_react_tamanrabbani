<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class Setting extends Model
{
    use HasFactory;

    protected $connection = 'mysql';

    protected $table = 'settings';

    protected $fillable = [
        'key',
        'value',
    ];

    protected static function booted(): void
    {
        static::saved(function ($model) {
            Cache::forget('public_site_settings_payload');
            Cache::forget('setting_ppdb_fee_structure');
            Cache::forget('setting_ppdb_waves');
        });

        static::deleted(function ($model) {
            Cache::forget('public_site_settings_payload');
            Cache::forget('setting_ppdb_fee_structure');
            Cache::forget('setting_ppdb_waves');
        });
    }
}
