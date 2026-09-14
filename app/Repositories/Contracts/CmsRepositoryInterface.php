<?php

namespace App\Repositories\Contracts;

interface CmsRepositoryInterface
{
    public function getSliders();
    public function getSchoolProfile(string $key);
    public function updateSchoolProfile(string $key, string $value);
    public function getFaqs(bool $onlyActive);
    public function getAnnouncements(bool $onlyActive);
    public function getNews(bool $onlyPublished, int $perPage);
    public function getNewsBySlug(string $slug);
    public function getGallery(string $category);
    public function saveContact(array $data);
}
