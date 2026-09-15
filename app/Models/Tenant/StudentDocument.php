<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StudentDocument extends Model
{
    use HasFactory;

    protected $connection = 'mysql';

    protected $table = 'student_documents';

    protected $fillable = [
        'pendaftar_id',
        'document_type', // 'birth_certificate', 'family_card', 'photo'
        'file_path',
        'file_size',
    ];

    public function pendaftar()
    {
        return $this->belongsTo(Pendaftar::class, 'pendaftar_id');
    }
}
