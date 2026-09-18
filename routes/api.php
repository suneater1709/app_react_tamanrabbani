<?php

use App\Http\Controllers\Api\V1\Admin\AdminSettingController;
use App\Http\Controllers\Api\V1\Admin\AdminUserController;
use App\Http\Controllers\Api\V1\Admin\AuthController as AdminAuthController;
use App\Http\Controllers\Api\V1\Admin\CMS\CurriculumProgramController as AdminCurriculumProgramController;
use App\Http\Controllers\Api\V1\Admin\CMS\FaqController as AdminFaqController;
use App\Http\Controllers\Api\V1\Admin\CMS\GalleryController as AdminGalleryController;
use App\Http\Controllers\Api\V1\Admin\CMS\HomeController as AdminHomeController;
use App\Http\Controllers\Api\V1\Admin\CMS\NewsController as AdminNewsController;
use App\Http\Controllers\Api\V1\Admin\CMS\ProfileController as AdminProfileController;
use App\Http\Controllers\Api\V1\Admin\CMS\ProgramController as AdminProgramController;
use App\Http\Controllers\Api\V1\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Api\V1\Admin\ExportController as AdminExportController;
use App\Http\Controllers\Api\V1\Admin\VerificationController as AdminVerificationController;
use App\Http\Controllers\Api\V1\Public\AdmissionController as PublicAdmissionController;
use App\Http\Controllers\Api\V1\Public\CmsController as PublicCmsController;
use App\Http\Controllers\Api\V1\Public\ContactController as PublicContactController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {

    // Public Routes
    Route::prefix('public')->group(function () {
        Route::get('programs', [PublicCmsController::class, 'programs']);
        Route::get('cms/curriculum-programs', [PublicCmsController::class, 'curriculumPrograms']);
        Route::get('cms/home', [PublicCmsController::class, 'home']);
        Route::get('cms/news', [PublicCmsController::class, 'news']);
        Route::get('cms/news/{slug}', [PublicCmsController::class, 'newsDetail']);
        Route::get('cms/faqs', [PublicCmsController::class, 'faqs']);
        Route::get('cms/gallery', [PublicCmsController::class, 'galleries']);
        Route::get('settings', [PublicCmsController::class, 'settings']);

        Route::post('admissions', [PublicAdmissionController::class, 'store']);
        Route::get('admissions/track', [PublicAdmissionController::class, 'track']);

        Route::get('admissions/revisi/{regNumber}', [PublicAdmissionController::class, 'getForRevision']);
        Route::post('admissions/revisi/{regNumber}', [PublicAdmissionController::class, 'updateRevision']);

        Route::post('contacts', [PublicContactController::class, 'store']);
    });

    // Admin Routes
    Route::prefix('admin')->group(function () {
        // Authentication
        Route::post('login', [AdminAuthController::class, 'login']);
        Route::get('exports/excel', [AdminExportController::class, 'exportExcel']);

        Route::middleware('auth:sanctum')->group(function () {
            Route::post('logout', [AdminAuthController::class, 'logout']);
            Route::get('me', [AdminAuthController::class, 'me']);

            // Dashboard
            Route::get('dashboard/stats', [AdminDashboardController::class, 'stats']);

            // Admission Verification
            Route::get('admissions', [AdminVerificationController::class, 'index']);
            Route::get('admissions/{id}', [AdminVerificationController::class, 'show']);
            Route::put('admissions/{id}/status', [AdminVerificationController::class, 'updateStatus']);
            Route::delete('admissions/{id}', [AdminVerificationController::class, 'destroy']);
            Route::get('admissions/documents/{id}/file', [AdminVerificationController::class, 'previewDocument']);

            // CMS Management
            Route::get('cms/home', [AdminHomeController::class, 'index']);
            Route::post('cms/home/settings', [AdminHomeController::class, 'updateSettings']);
            Route::get('cms/sliders', [AdminHomeController::class, 'sliders']);
            Route::post('cms/sliders', [AdminHomeController::class, 'storeSlider']);
            Route::post('cms/sliders/{id}', [AdminHomeController::class, 'updateSlider']);
            Route::put('cms/sliders/{id}', [AdminHomeController::class, 'updateSlider']);
            Route::patch('cms/sliders/{id}/toggle', [AdminHomeController::class, 'toggleSlider']);
            Route::delete('cms/sliders/{id}', [AdminHomeController::class, 'destroySlider']);

            Route::apiResource('cms/news', AdminNewsController::class);
            Route::apiResource('cms/gallery', AdminGalleryController::class);
            Route::apiResource('cms/faqs', AdminFaqController::class);
            Route::apiResource('cms/programs', AdminProgramController::class);
            Route::apiResource('cms/curriculum-programs', AdminCurriculumProgramController::class);
            Route::get('cms/extracurriculars', [AdminCurriculumProgramController::class, 'getExtracurriculars']);
            Route::post('cms/extracurriculars', [AdminCurriculumProgramController::class, 'storeExtracurricular']);
            Route::put('cms/extracurriculars/{id}', [AdminCurriculumProgramController::class, 'updateExtracurricular']);
            Route::delete('cms/extracurriculars/{id}', [AdminCurriculumProgramController::class, 'destroyExtracurricular']);
            Route::get('cms/profile', [AdminProfileController::class, 'index']);
            Route::put('cms/profile', [AdminProfileController::class, 'update']);

            // Data Export
            Route::post('exports/gsheet', [AdminExportController::class, 'exportGoogleSheet']);

            // Admin Management (Section A)
            Route::apiResource('admins', AdminUserController::class);

            // Settings & Logos (Section B)
            Route::get('settings/logos', [AdminSettingController::class, 'getSettings']);
            Route::post('settings/logos/upload', [AdminSettingController::class, 'uploadLogo']);
            Route::get('settings/ppdb', [AdminSettingController::class, 'getPpdbSettings']);
            Route::post('settings/ppdb', [AdminSettingController::class, 'updatePpdbSettings']);
            Route::put('settings/ppdb', [AdminSettingController::class, 'updatePpdbSettings']);
        });
    });

});
