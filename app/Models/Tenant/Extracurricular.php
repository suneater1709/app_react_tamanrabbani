<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Extracurricular extends Model
{
    use HasFactory;

    protected $connection = 'mysql';

    protected $table = 'extracurriculars';

    protected $fillable = [
        'level',
        'name',
        'order',
    ];

    protected $casts = [
        'order' => 'integer',
    ];
}
