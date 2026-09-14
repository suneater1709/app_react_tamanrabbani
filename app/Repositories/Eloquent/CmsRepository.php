<?php

namespace App\Repositories\Eloquent;

use App\Models\Tenant\Slider;
use App\Models\Tenant\SchoolProfile;
use App\Models\Tenant\Faq;
use App\Models\Tenant\Announcement;
use App\Models\Tenant\News;
use App\Models\Tenant\Gallery;
use App\Models\Tenant\Contact;
use App\Repositories\Contracts\CmsRepositoryInterface;

class CmsRepository implements CmsRepositoryInterface
{
    public function getSliders()
    {
        return Slider::where('is_active', true)->orderBy('order', 'asc')->get();
    }

    public function getSchoolProfile(string $key)
    {
        $profile = SchoolProfile::where('key', $key)->first();
        return $profile ? $profile->value : null;
    }

    public function updateSchoolProfile(string $key, string $value)
    {
        return SchoolProfile::updateOrCreate(['key' => $key], ['value' => $value]);
    }

    public function getFaqs(bool $onlyActive = true)
    {
        $query = Faq::query();
        if ($onlyActive) {
            $query->where('is_active', true);
        }
        return $query->orderBy('created_at', 'desc')->get();
    }

    public function getAnnouncements(bool $onlyActive = true)
    {
        $query = Announcement::query();
        if ($onlyActive) {
            $query->where('is_active', true);
        }
        return $query->orderBy('publish_date', 'desc')->get();
    }

    public function getNews(bool $onlyPublished = true, int $perPage = 10)
    {
        $query = News::query();
        if ($onlyPublished) {
            $query->where('is_published', true);
        }
        return $query->orderBy('created_at', 'desc')->paginate($perPage);
    }

    public function getNewsBySlug(string $slug)
    {
        return News::where('slug', $slug)->first();
    }

    public function getGallery(string $category = 'all')
    {
        $query = Gallery::query();
        if ($category !== 'all' && !empty($category)) {
            $query->where('category', $category);
        }
        return $query->orderBy('created_at', 'desc')->get();
    }

    public function saveContact(array $data)
    {
        return Contact::create($data);
    }
}
