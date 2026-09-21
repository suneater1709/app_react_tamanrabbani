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
        'instructor',
        'schedule',
        'description',
        'order',
        'is_active',
    ];

    protected $casts = [
        'order' => 'integer',
        'is_active' => 'boolean',
    ];

    protected $appends = [
        'title',
    ];

    public function getTitleAttribute(): string
    {
        return $this->attributes['name'] ?? '';
    }

    public function setTitleAttribute(?string $value): void
    {
        $this->attributes['name'] = $value;
    }
}
