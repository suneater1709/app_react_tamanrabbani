<?php

namespace App\Services;

use App\Repositories\Contracts\CmsRepositoryInterface;

class CmsService
{
    protected CmsRepositoryInterface $cmsRepo;

    public function __construct(CmsRepositoryInterface $cmsRepo)
    {
        $this->cmsRepo = $cmsRepo;
    }

    /**
     * Get aggregated data packages for the public school landing page.
     */
    public function getPublicLandingData(): array
    {
        return [
            'sliders' => $this->cmsRepo->getSliders(),
            'faqs' => $this->cmsRepo->getFaqs(true),
            'announcements' => $this->cmsRepo->getAnnouncements(true),
            'history' => $this->cmsRepo->getSchoolProfile('history'),
            'vision' => $this->cmsRepo->getSchoolProfile('vision'),
            'mission' => $this->cmsRepo->getSchoolProfile('mission'),
            'welcome_message' => $this->cmsRepo->getSchoolProfile('welcome_message'),
            'hero_tagline' => $this->cmsRepo->getSchoolProfile('hero_tagline') ?: "Berkarakter Qur'an",
            'about_video_url' => $this->cmsRepo->getSchoolProfile('about_video_url') ?: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        ];
    }

    /**
     * Save customer support inquiries.
     */
    public function submitContactMessage(array $data)
    {
        return $this->cmsRepo->saveContact($data);
    }
}
