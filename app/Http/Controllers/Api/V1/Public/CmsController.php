<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Models\Tenant\CurriculumProgram;
use App\Models\Tenant\Extracurricular;
use App\Models\Tenant\Gallery;
use App\Models\Tenant\Program;
use App\Models\Tenant\Setting;
use App\Repositories\Contracts\CmsRepositoryInterface;
use App\Services\CmsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CmsController extends Controller
{
    protected CmsService $cmsService;

    protected CmsRepositoryInterface $cmsRepo;

    public function __construct(CmsService $cmsService, CmsRepositoryInterface $cmsRepo)
    {
        $this->cmsService = $cmsService;
        $this->cmsRepo = $cmsRepo;
    }

    /**
     * Get home landing page aggregated CMS data.
     */
    public function home(): JsonResponse
    {
        $data = $this->cmsService->getPublicLandingData();

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    /**
     * Get all active learning programs.
     */
    public function programs(): JsonResponse
    {
        $programs = Program::where('is_active', true)->get();

        return response()->json([
            'success' => true,
            'data' => $programs,
        ]);
    }

    /**
     * Get 5-category curriculum programs and extracurriculars.
     */
    public function curriculumPrograms(): JsonResponse
    {
        $programs = CurriculumProgram::where('is_active', true)
            ->orderBy('order', 'asc')
            ->orderBy('id', 'asc')
            ->get();

        $extracurriculars = Extracurricular::orderBy('order', 'asc')
            ->orderBy('id', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'programs' => $programs,
                'extracurriculars' => $extracurriculars,
            ],
        ]);
    }

    /**
     * Get paginated published news articles.
     */
    public function news(Request $request): JsonResponse
    {
        $perPage = $request->query('per_page', 6);
        $news = $this->cmsRepo->getNews(true, $perPage);

        return response()->json([
            'success' => true,
            'data' => $news,
        ]);
    }

    /**
     * Get a single news article by its slug.
     */
    public function newsDetail(string $slug): JsonResponse
    {
        $article = $this->cmsRepo->getNewsBySlug($slug);

        if (! $article || ! $article->is_published) {
            return response()->json([
                'success' => false,
                'message' => 'Artikel tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $article,
        ]);
    }

    /**
     * Get all active FAQs.
     */
    public function faqs(): JsonResponse
    {
        $faqs = $this->cmsRepo->getFaqs(true);

        return response()->json([
            'success' => true,
            'data' => $faqs,
        ]);
    }

    /**
     * Get photo gallery items, optional category filter.
     */
    public function galleries(Request $request): JsonResponse
    {
        $category = $request->query('category', 'all');
        $gallery = $this->cmsRepo->getGallery($category);

        return response()->json([
            'success' => true,
            'data' => $gallery,
        ]);
    }

    /**
     * Get public site settings (like logos, contact info, school address).
     */
    public function settings(): JsonResponse
    {
        $settings = Setting::all()->pluck('value', 'key');
        $logo = $settings->get('school_logo') ?: $settings->get('logo_landing');

        $defaultWaves = [
            [
                'id' => '1',
                'name' => 'Gelombang 1 (Early Bird)',
                'period' => 'Juli s.d September 2026',
                'badge' => 'Diskon Rp 400.000',
                'note' => '* Potongan Uang Pangkal Sebesar Rp 400.000!',
                'is_active' => true,
            ],
            [
                'id' => '2',
                'name' => 'Gelombang 2 (Reguler)',
                'period' => 'Oktober s.d Desember 2026',
                'badge' => '',
                'note' => '',
                'is_active' => false,
            ],
            [
                'id' => '3',
                'name' => 'Gelombang 3 (Sisa Kuota)',
                'period' => 'Januari s.d Juni 2027',
                'badge' => '',
                'note' => '* Dibuka apabila kuota kelas masih tersedia.',
                'is_active' => false,
            ],
        ];

        $defaultFees = [
            'kb' => [
                'name' => 'Kelompok Bermain (KB)',
                'items' => [
                    ['name' => 'Infaq Pendidikan', 'amount' => 550000],
                    ['name' => 'Perlengkapan (1 tahun)', 'amount' => 850000],
                    ['name' => 'Kegiatan (1 tahun)', 'amount' => 1000000],
                    ['name' => 'Seragam', 'amount' => 400000],
                ],
            ],
            'tk' => [
                'name' => 'Taman Kanak-Kanak (TK A & TK B)',
                'items' => [
                    ['name' => 'Infaq Pendidikan (2 tahun)', 'amount' => 750000],
                    ['name' => 'Perlengkapan (1 tahun)', 'amount' => 1050000],
                    ['name' => 'Kegiatan (1 tahun)', 'amount' => 1500000],
                    ['name' => 'Seragam', 'amount' => 650000],
                ],
            ],
        ];

        $rawWaves = $settings->get('ppdb_waves');
        $waves = $rawWaves ? json_decode($rawWaves, true) : $defaultWaves;
        if (! is_array($waves)) {
            $waves = $defaultWaves;
        }

        $rawFees = $settings->get('ppdb_fee_structure');
        $fees = $rawFees ? json_decode($rawFees, true) : $defaultFees;
        if (! is_array($fees)) {
            $fees = $defaultFees;
        }

        $logoUrl = null;
        if ($logo) {
            if (str_starts_with($logo, 'http://') || str_starts_with($logo, 'https://') || str_starts_with($logo, '/')) {
                $logoUrl = $logo;
            } else {
                $logoUrl = '/storage/'.ltrim($logo, '/');
            }
        }

        return response()->json([
            'success' => true,
            'data' => [
                'school_logo' => $logoUrl,
                'logo_landing' => $logoUrl,
                'school_name' => $settings->get('school_name', 'KB-TK IT Taman Robbani Sidoarjo'),
                'school_address' => $settings->get('school_address', 'Jl. Mangkurejo 41, Kwangsan, Sedati, Sidoarjo'),
                'school_phone' => $settings->get('school_phone', '087752439572'),
                'school_email' => $settings->get('school_email', 'tamanrobbani23@gmail.com'),
                'whatsapp_url' => 'https://wa.me/6287752439572',
                'ppdb_badge_text' => $settings->get('ppdb_badge_text', 'Penerimaan Murid Baru (PPDB) 2026/2027 Dibuka!'),
                'ppdb_academic_year' => $settings->get('ppdb_academic_year', '2026/2027'),
                'ppdb_is_open' => filter_var($settings->get('ppdb_is_open', '1'), FILTER_VALIDATE_BOOLEAN),
                'ppdb_form_fee' => $settings->get('ppdb_form_fee', 'Rp 100.000'),
                'ppdb_waves' => $waves,
                'ppdb_fee_structure' => $fees,
            ],
        ]);
    }
}
