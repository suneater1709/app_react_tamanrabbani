<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Tenant\StudentDocument;
use App\Repositories\Contracts\PendaftarRepositoryInterface;
use App\Services\AdmissionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class VerificationController extends Controller
{
    protected AdmissionService $admissionService;

    protected PendaftarRepositoryInterface $pendaftarRepo;

    public function __construct(AdmissionService $admissionService, PendaftarRepositoryInterface $pendaftarRepo)
    {
        $this->admissionService = $admissionService;
        $this->pendaftarRepo = $pendaftarRepo;
    }

    /**
     * List paginated applicants with search query and status filters.
     */
    public function index(Request $request): JsonResponse
    {
        $filters = [
            'search' => $request->query('search'),
            'status' => $request->query('status', 'all'),
            'program_id' => $request->query('program_id'),
            'per_page' => $request->query('per_page', 10),
        ];

        $list = $this->pendaftarRepo->getFilteredList($filters);

        return response()->json([
            'success' => true,
            'data' => $list,
        ]);
    }

    /**
     * Retrieve complete dossiers of a single applicant.
     */
    public function show(int $id): JsonResponse
    {
        // Load with all associated assets
        $pendaftar = $this->pendaftarRepo->find($id);

        if (! $pendaftar) {
            return response()->json([
                'success' => false,
                'message' => 'Data pendaftar tidak ditemukan.',
            ], 404);
        }

        // Lazy load relationships cleanly
        $pendaftar->load(['program', 'parents', 'documents', 'statusLogs.changedByUser']);

        return response()->json([
            'success' => true,
            'data' => $pendaftar,
        ]);
    }

    /**
     * Update verification status & logs of an applicant dossier.
     */
    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:pending,revision,accepted',
            'notes' => 'required|string|min:5',
        ], [
            'status.required' => 'Status verifikasi wajib ditentukan.',
            'status.in' => 'Pilihan status tidak valid.',
            'notes.required' => 'Catatan verifikasi wajib diisi.',
            'notes.min' => 'Catatan verifikasi minimal berisi 5 karakter.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $adminUser = $request->user();

        $existingPendaftar = $this->pendaftarRepo->find($id);
        if (! $existingPendaftar) {
            return response()->json([
                'success' => false,
                'message' => 'Data pendaftar tidak ditemukan.',
            ], 404);
        }

        if ($existingPendaftar->status === 'accepted') {
            return response()->json([
                'success' => false,
                'message' => 'Status pendaftaran sudah diterima dan tidak dapat diubah lagi.',
            ], 422);
        }

        try {
            $pendaftar = $this->admissionService->updateStatus(
                $id,
                $request->status,
                $request->notes,
                $adminUser->id,
                $request->ip(),
                $request->userAgent()
            );

            return response()->json([
                'success' => true,
                'message' => 'Status verifikasi pendaftar berhasil diperbarui.',
                'data' => $pendaftar,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan sistem saat memperbarui status.',
            ], 500);
        }
    }

    /**
     * Delete an applicant record.
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $this->pendaftarRepo->delete($id);

            return response()->json([
                'success' => true,
                'message' => 'Data pendaftar berhasil dihapus.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus data pendaftar.',
            ], 500);
        }
    }

    /**
     * Preview / stream applicant document securely for authenticated admin.
     */
    public function previewDocument(int $id)
    {
        $document = StudentDocument::find($id);

        if (! $document) {
            return response()->json([
                'success' => false,
                'message' => 'Dokumen tidak ditemukan.',
            ], 404);
        }

        $fullPath = storage_path('app/public/'.$document->file_path);
        if (! file_exists($fullPath)) {
            $fullPath = storage_path('app/'.$document->file_path);
        }
        if (! file_exists($fullPath)) {
            $fullPath = public_path('storage/'.$document->file_path);
        }

        if (! file_exists($fullPath)) {
            return response()->json([
                'success' => false,
                'message' => 'File dokumen fisik tidak ditemukan di server.',
            ], 404);
        }

        $mimeType = mime_content_type($fullPath) ?: 'application/octet-stream';

        return response()->file($fullPath, [
            'Content-Type' => $mimeType,
            'Content-Disposition' => 'inline; filename="'.basename($fullPath).'"',
        ]);
    }
}
