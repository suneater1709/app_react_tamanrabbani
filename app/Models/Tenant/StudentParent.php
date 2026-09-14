<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StudentParent extends Model
{
    use HasFactory;

    protected $connection = 'mysql';
    protected $table = 'parents';

    protected $fillable = [
        'pendaftar_id',
        'type', // 'father', 'mother', 'guardian'
        'name',
        'occupation',
        'education',
        'phone',
        'email',
        'income',
    ];

    public function pendaftar()
    {
        return $this->belongsTo(Pendaftar::class, 'pendaftar_id');
    }
}
