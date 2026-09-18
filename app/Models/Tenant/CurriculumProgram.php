<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CurriculumProgram extends Model
{
    use HasFactory;

    protected $connection = 'mysql';

    protected $table = 'curriculum_programs';

    protected $fillable = [
        'category',
        'title',
        'description',
        'time_allocation',
        'order',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'order' => 'integer',
    ];
}
