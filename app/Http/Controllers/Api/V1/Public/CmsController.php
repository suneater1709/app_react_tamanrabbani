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
use Illuminate\Support\Facades\Storage;

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
     * Download the official PPDB poster with proper named filename.
     */
    public function downloadPoster()
    {
        $setting = Setting::where('key', 'ppdb_poster')->first();
        if (! $setting || ! $setting->value) {
            return response()->json([
                'success' => false,
                'message' => 'Poster PPDB belum diunggah.',
            ], 404);
        }

        $path = $setting->value;
        $ext = pathinfo($path, PATHINFO_EXTENSION) ?: 'jpg';
        $downloadName = 'Poster -PPDB-tamanrabbani.'.$ext;

        if (Storage::disk('public')->exists($path)) {
            return Storage::disk('public')->download($path, $downloadName, [
                'Content-Disposition' => 'attachment; filename="'.$downloadName.'"',
            ]);
        }

        if (file_exists(public_path($path))) {
            return response()->download(public_path($path), $downloadName);
        }

        return redirect($path);
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

        $extracurriculars = Extracurricular::where('is_active', true)
            ->orderBy('order', 'asc')
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
                'name' => 'Gelombang 1',
                'period' => 'Oktober s.d November 2026',
                'badge' => 'Cashback 50%',
                'note' => '* Cashback 50% dari Infaq Pendidikan',
                'discount' => 50,
                'cashback_percent' => 50,
                'is_active' => true,
            ],
            [
                'id' => '2',
                'name' => 'Gelombang 2',
                'period' => 'Desember s.d Januari 2027',
                'badge' => 'Cashback 40%',
                'note' => '* Cashback 40% dari Infaq Pendidikan',
                'discount' => 40,
                'cashback_percent' => 40,
                'is_active' => false,
            ],
            [
                'id' => '3',
                'name' => 'Gelombang 3',
                'period' => 'Februari s.d April 2027',
                'badge' => 'Cashback 30%',
                'note' => '* Cashback 30% dari Infaq Pendidikan',
                'discount' => 30,
                'cashback_percent' => 30,
                'is_active' => false,
            ],
        ];

        $defaultFees = [
            'kb' => [
                'name' => 'Kelompok Bermain (KB)',
                'title' => 'Kelompok Bermain (KB)',
                'age' => 'Usia 3 - 4 Tahun',
                'total' => 2800000,
                'items' => [
                    ['name' => 'Infaq Pendidikan', 'amount' => 550000],
                    ['name' => 'Perlengkapan (1 tahun)', 'amount' => 850000],
                    ['name' => 'Kegiatan (1 tahun)', 'amount' => 1000000],
                    ['name' => 'Seragam', 'amount' => 400000],
                ],
            ],
            'tk' => [
                'name' => 'Taman Kanak-Kanak (TK A & TK B)',
                'title' => 'Taman Kanak-Kanak (TK A & TK B)',
                'age' => 'Usia 4 - 6 Tahun',
                'total' => 3950000,
                'items' => [
                    ['name' => 'Infaq Pendidikan', 'amount' => 750000],
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

        $poster = $settings->get('ppdb_poster');
        $posterUrl = null;
        if ($poster) {
            if (str_starts_with($poster, 'http://') || str_starts_with($poster, 'https://') || str_starts_with($poster, '/')) {
                $posterUrl = $poster;
            } else {
                $posterUrl = '/storage/'.ltrim($poster, '/');
            }
        }

        $phone = $settings->get('school_phone', '0816503293');
        $waDigits = preg_replace('/^0|^62/', '', preg_replace('/\D/', '', $phone));
        $whatsappUrl = 'https://wa.me/62'.($waDigits ?: '816503293');

        return response()->json([
            'success' => true,
            'data' => [
                'school_logo' => $logoUrl,
                'logo_landing' => $logoUrl,
                'school_name' => $settings->get('school_name', 'KB-TK IT Taman Robbani Sidoarjo'),
                'school_address' => $settings->get('school_address', 'Jl. Mangkurejo 41, Kwangsan, Sedati, Sidoarjo'),
                'school_phone' => $phone,
                'school_email' => $settings->get('school_email', 'tamanrobbani23@gmail.com'),
                'whatsapp_url' => $whatsappUrl,
                'ppdb_poster' => $posterUrl,
                'ppdb_poster_path' => $poster,
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
