<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SchoolProfile extends Model
{
    use HasFactory;

    protected $connection = 'mysql';
    protected $table = 'school_profiles';

    protected $fillable = [
        'key',
        'value',
    ];
}
