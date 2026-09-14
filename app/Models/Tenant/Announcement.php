<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Announcement extends Model
{
    use HasFactory;

    protected $connection = 'mysql';
    protected $table = 'announcements';

    protected $fillable = [
        'title',
        'content',
        'is_active',
        'publish_date',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'publish_date' => 'date',
    ];
}
