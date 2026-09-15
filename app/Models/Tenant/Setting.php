<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    use HasFactory;

    protected $connection = 'mysql';

    protected $table = 'settings';

    protected $fillable = [
        'key',
        'value',
    ];
}
