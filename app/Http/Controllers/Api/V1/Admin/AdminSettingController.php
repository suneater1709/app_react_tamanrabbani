<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Tenant\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class AdminSettingController extends Controller
{
    /**
     * Get settings related to unified school branding logo.
     */
    public function getSettings(): JsonResponse
    {
        $unifiedLogo = Setting::where('key', 'school_logo')->first()?->value
            ?? Setting::where('key', 'logo_landing')->first()?->value
            ?? Setting::where('key', 'logo_admin_portal')->first()?->value
            ?? Setting::where('key', 'logo_admin_login')->first()?->value
            ?? '';

        $logoUrl = '';
        if ($unifiedLogo) {
            if (str_starts_with($unifiedLogo, 'http://') || str_starts_with($unifiedLogo, 'https://') || str_starts_with($unifiedLogo, '/')) {
                $logoUrl = $unifiedLogo;
            } else {
                $logoUrl = '/storage/'.ltrim($unifiedLogo, '/');
            }
        }

        $schoolName = Setting::where('key', 'school_name')->first()?->value ?? 'KB-TK IT Taman Robbani Sidoarjo';
        $schoolPhone = Setting::where('key', 'school_phone')->first()?->value ?? '0816503293';
        $schoolEmail = Setting::where('key', 'school_email')->first()?->value ?? 'tamanrobbani23@gmail.com';
        $schoolAddress = Setting::where('key', 'school_address')->first()?->value ?? 'Jl. Mangkurejo 41, Kwangsan, Sedati, Sidoarjo';

        return response()->json([
            'success' => true,
            'data' => [
                'school_logo' => $logoUrl,
                'school_logo_path' => $unifiedLogo,
                'school_name' => $schoolName,
                'school_phone' => $schoolPhone,
                'school_email' => $schoolEmail,
                'school_address' => $schoolAddress,
                // Backward compatibility keys - all pointing to single unified logo
                'logo_landing' => $logoUrl,
                'logo_admin_portal' => $logoUrl,
                'logo_admin_login' => $logoUrl,
                'logo_landing_path' => $unifiedLogo,
                'logo_admin_portal_path' => $unifiedLogo,
                'logo_admin_login_path' => $unifiedLogo,
            ],
        ]);
    }

    /**
     * Update school profile & contact settings.
     */
    public function updateSchoolProfile(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'school_name' => 'nullable|string|max:255',
            'school_phone' => 'nullable|string|max:50',
            'school_email' => 'nullable|email|max:255',
            'school_address' => 'nullable|string|max:500',
        ]);

        foreach ($validated as $key => $val) {
            if ($val !== null) {
                Setting::updateOrCreate(['key' => $key], ['value' => $val]);
            }
        }

        // Also sync contact_phone
        if (! empty($validated['school_phone'])) {
            Setting::updateOrCreate(['key' => 'contact_phone'], ['value' => $validated['school_phone']]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Informasi profil & kontak sekolah berhasil disimpan.',
            'data' => $validated,
        ]);
    }

    /**
     * Upload single unified logo that applies across Landing, Admin Portal, and Admin Login.
     */
    public function uploadLogo(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'logo' => 'required|file|mimes:png,jpg,jpeg,svg|max:2048',
        ], [
            'logo.required' => 'File logo wajib diunggah.',
            'logo.mimes' => 'Format file logo harus berupa PNG, JPG, JPEG, atau SVG.',
            'logo.max' => 'Ukuran logo tidak boleh melebihi 2MB.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $file = $request->file('logo');

        if ($file->isValid()) {
            // Delete old file if exists
            $oldSetting = Setting::where('key', 'school_logo')->first()
                ?? Setting::where('key', 'logo_landing')->first();
            if ($oldSetting && $oldSetting->value) {
                Storage::disk('public')->delete($oldSetting->value);
            }

            // Store new logo
            $path = $file->store('logos', 'public');

            // Save in database for single setting and sync all 3 places
            $keysToSync = ['school_logo', 'logo_landing', 'logo_admin_portal', 'logo_admin_login'];
            foreach ($keysToSync as $key) {
                Setting::updateOrCreate(
                    ['key' => $key],
                    ['value' => $path]
                );
            }

            $url = Storage::url($path);

            return response()->json([
                'success' => true,
                'message' => 'Logo sekolah berhasil diperbarui untuk semua halaman.',
                'data' => [
                    'key' => 'school_logo',
                    'school_logo' => $url,
                    'url' => $url,
                    'path' => $path,
                ],
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'File upload tidak valid.',
        ], 400);
    }

    /**
     * Get PPDB schedule, wave, badge, and poster settings.
     */
    public function getPpdbSettings(): JsonResponse
    {
        $settings = Setting::whereIn('key', [
            'ppdb_badge_text',
            'ppdb_academic_year',
            'ppdb_is_open',
            'ppdb_form_fee',
            'ppdb_waves',
            'ppdb_fee_structure',
            'ppdb_poster',
        ])->pluck('value', 'key');

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

        $poster = $settings->get('ppdb_poster');
        $posterUrl = '';
        if ($poster) {
            if (str_starts_with($poster, 'http://') || str_starts_with($poster, 'https://') || str_starts_with($poster, '/')) {
                $posterUrl = $poster;
            } else {
                $posterUrl = '/storage/'.ltrim($poster, '/');
            }
        }

        return response()->json([
            'success' => true,
            'data' => [
                'ppdb_badge_text' => $settings->get('ppdb_badge_text', 'Penerimaan Murid Baru (PPDB) 2026/2027 Dibuka!'),
                'ppdb_academic_year' => $settings->get('ppdb_academic_year', '2026/2027'),
                'ppdb_is_open' => filter_var($settings->get('ppdb_is_open', '1'), FILTER_VALIDATE_BOOLEAN),
                'ppdb_form_fee' => $settings->get('ppdb_form_fee', 'Rp 100.000'),
                'ppdb_waves' => $waves,
                'ppdb_fee_structure' => $fees,
                'ppdb_poster' => $posterUrl,
                'ppdb_poster_path' => $poster,
            ],
        ]);
    }

    /**
     * Update PPDB schedule, wave, fee structure, and badge settings.
     */
    public function updatePpdbSettings(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ppdb_badge_text' => 'nullable|string|max:255',
            'ppdb_academic_year' => 'nullable|string|max:50',
            'ppdb_is_open' => 'nullable|boolean',
            'ppdb_form_fee' => 'nullable|string|max:100',
            'ppdb_waves' => 'nullable|array',
            'ppdb_waves.*.id' => 'nullable|string',
            'ppdb_waves.*.name' => 'required|string|max:255',
            'ppdb_waves.*.period' => 'required|string|max:255',
            'ppdb_waves.*.badge' => 'nullable|string|max:100',
            'ppdb_waves.*.note' => 'nullable|string|max:255',
            'ppdb_waves.*.is_active' => 'nullable|boolean',
            'ppdb_fee_structure' => 'nullable|array',
        ]);

        if (array_key_exists('ppdb_badge_text', $validated)) {
            Setting::updateOrCreate(['key' => 'ppdb_badge_text'], ['value' => $validated['ppdb_badge_text']]);
        }
        if (array_key_exists('ppdb_academic_year', $validated)) {
            Setting::updateOrCreate(['key' => 'ppdb_academic_year'], ['value' => $validated['ppdb_academic_year']]);
        }
        if (array_key_exists('ppdb_is_open', $validated)) {
            Setting::updateOrCreate(['key' => 'ppdb_is_open'], ['value' => $validated['ppdb_is_open'] ? '1' : '0']);
        }
        if (array_key_exists('ppdb_form_fee', $validated)) {
            Setting::updateOrCreate(['key' => 'ppdb_form_fee'], ['value' => $validated['ppdb_form_fee']]);
        }
        if (array_key_exists('ppdb_waves', $validated)) {
            Setting::updateOrCreate(['key' => 'ppdb_waves'], ['value' => json_encode($validated['ppdb_waves'])]);
        }
        if (array_key_exists('ppdb_fee_structure', $validated)) {
            Setting::updateOrCreate(['key' => 'ppdb_fee_structure'], ['value' => json_encode($validated['ppdb_fee_structure'])]);
        }

        return $this->getPpdbSettings();
    }

    /**
     * Upload PPDB Poster / Brochure (Image or PDF).
     */
    public function uploadPpdbPoster(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'poster' => 'required|file|mimes:png,jpg,jpeg,webp,pdf|max:10240',
        ], [
            'poster.required' => 'File poster PPDB wajib diunggah.',
            'poster.mimes' => 'Format file poster harus berupa PNG, JPG, JPEG, WEBP, atau PDF.',
            'poster.max' => 'Ukuran file poster tidak boleh melebihi 10MB.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
                'message' => $validator->errors()->first(),
            ], 422);
        }

        $file = $request->file('poster');

        if ($file->isValid()) {
            // Delete old poster if exists
            $oldSetting = Setting::where('key', 'ppdb_poster')->first();
            if ($oldSetting && $oldSetting->value && ! str_starts_with($oldSetting->value, 'http') && ! str_starts_with($oldSetting->value, '/')) {
                Storage::disk('public')->delete($oldSetting->value);
            }

            // Store new poster in public/posters
            $path = $file->store('posters', 'public');

            Setting::updateOrCreate(
                ['key' => 'ppdb_poster'],
                ['value' => $path]
            );

            $url = Storage::url($path);

            return response()->json([
                'success' => true,
                'message' => 'Poster PPDB berhasil diunggah dan diperbarui.',
                'data' => [
                    'ppdb_poster' => $url,
                    'ppdb_poster_path' => $path,
                ],
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'File upload tidak valid.',
        ], 400);
    }

    /**
     * Delete PPDB Poster.
     */
    public function deletePpdbPoster(): JsonResponse
    {
        $setting = Setting::where('key', 'ppdb_poster')->first();
        if ($setting && $setting->value) {
            if (! str_starts_with($setting->value, 'http') && ! str_starts_with($setting->value, '/')) {
                Storage::disk('public')->delete($setting->value);
            }
            $setting->update(['value' => null]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Poster PPDB berhasil dihapus.',
        ]);
    }
}
