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

        return response()->json([
            'success' => true,
            'data' => [
                'school_logo' => $logoUrl,
                'school_logo_path' => $unifiedLogo,
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
     * Get PPDB schedule, wave, and badge settings.
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
        ])->pluck('value', 'key');

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

        return response()->json([
            'success' => true,
            'data' => [
                'ppdb_badge_text' => $settings->get('ppdb_badge_text', 'Penerimaan Murid Baru (PPDB) 2026/2027 Dibuka!'),
                'ppdb_academic_year' => $settings->get('ppdb_academic_year', '2026/2027'),
                'ppdb_is_open' => filter_var($settings->get('ppdb_is_open', '1'), FILTER_VALIDATE_BOOLEAN),
                'ppdb_form_fee' => $settings->get('ppdb_form_fee', 'Rp 100.000'),
                'ppdb_waves' => $waves,
                'ppdb_fee_structure' => $fees,
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
}
