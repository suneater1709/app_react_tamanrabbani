<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class News extends Model
{
    use HasFactory;

    protected $connection = 'mysql';

    protected $table = 'news';

    protected $fillable = [
        'title',
        'slug',
        'content',
        'content_type',
        'image',
        'file_path',
        'external_link',
        'is_published',
        'seo_title',
        'seo_description',
    ];

    protected $casts = [
        'is_published' => 'boolean',
    ];

    protected $appends = ['image_url', 'file_url'];

    public function getImageUrlAttribute(): ?string
    {
        if (! $this->image) {
            return null;
        }
        if (str_starts_with($this->image, 'http://') || str_starts_with($this->image, 'https://') || str_starts_with($this->image, '/')) {
            return $this->image;
        }

        return '/storage/'.ltrim($this->image, '/');
    }

    public function getFileUrlAttribute(): ?string
    {
        if (! $this->file_path) {
            return null;
        }
        if (str_starts_with($this->file_path, 'http://') || str_starts_with($this->file_path, 'https://') || str_starts_with($this->file_path, '/')) {
            return $this->file_path;
        }

        return '/storage/'.ltrim($this->file_path, '/');
    }
}
