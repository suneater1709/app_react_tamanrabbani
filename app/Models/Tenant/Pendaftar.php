<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Pendaftar extends Model
{
    use HasFactory, SoftDeletes;

    protected $connection = 'mysql';
    protected $table = 'pendaftar';

    protected $fillable = [
        'uuid',
        'registration_number',
        'program_id',
        'email',
        'phone',
        'full_name',
        'nickname',
        'nik',
        'gender',
        'birth_place',
        'birth_date',
        'religion',
        'address',
        'previous_school',
        'status',
        'verifier_notes',
        'notes',
    ];

    protected $casts = [
        'birth_date' => 'date',
    ];

    protected static function booted()
    {
        static::creating(function ($model) {
            if (empty($model->uuid)) {
                $model->uuid = (string) Str::uuid();
            }
        });
    }

    public function program()
    {
        return $this->belongsTo(Program::class, 'program_id');
    }

    public function parents()
    {
        return $this->hasMany(StudentParent::class, 'pendaftar_id');
    }

    public function documents()
    {
        return $this->hasMany(StudentDocument::class, 'pendaftar_id');
    }

    public function statusLogs()
    {
        return $this->hasMany(StudentStatusLog::class, 'pendaftar_id');
    }
}
