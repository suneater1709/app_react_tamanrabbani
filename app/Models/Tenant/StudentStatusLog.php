<?php

namespace App\Models\Tenant;

use App\Models\Admin\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StudentStatusLog extends Model
{
    use HasFactory;

    protected $connection = 'mysql';

    protected $table = 'student_status_logs';

    protected $fillable = [
        'pendaftar_id',
        'old_status',
        'new_status',
        'changed_by', // admin user id from other db
        'notes',
    ];

    public function pendaftar()
    {
        return $this->belongsTo(Pendaftar::class, 'pendaftar_id');
    }

    // Cross-database relationship
    public function changedByUser()
    {
        return $this->belongsTo(User::class, 'changed_by');
    }
}
