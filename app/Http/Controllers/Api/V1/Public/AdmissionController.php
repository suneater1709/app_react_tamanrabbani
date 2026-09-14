<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAdmissionRequest;
use App\Services\AdmissionService;
use App\Repositories\Contracts\PendaftarRepositoryInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdmissionController extends Controller
{
    protected AdmissionService $admissionService;
    protected PendaftarRepositoryInterface $pendaftarRepo;

    public function __construct(AdmissionService $admissionService, PendaftarRepositoryInterface $pendaftarRepo)
    {
        $this->admissionService = $admissionService;
        $this->pendaftarRepo = $pendaftarRepo;
    }

    /**
     * Store new student admission record.
     */
    public function store(StoreAdmissionRequest $request): JsonResponse
    {
        $validated = $request->validated();
        
        // Extract files
        $files = [];
        if ($request->hasFile('birth_certificate')) {
            $files['birth_certificate'] = $request->file('birth_certificate');
        }
        if ($request->hasFile('family_card')) {
            $files['family_card'] = $request->file('family_card');
        }
        if ($request->hasFile('photo')) {
            $files['photo'] = $request->file('photo');
        }
        if ($request->hasFile('payment_receipt')) {
            $files['payment_receipt'] = $request->file('payment_receipt');
        }

        $pendaftar = $this->admissionService->registerApplicant($validated, $files);

        return response()->json([
            'success' => true,
            'message' => 'Pendaftaran berhasil dikirim. Simpan Nomor Registrasi Anda!',
            'data' => [
                'id' => $pendaftar->id,
                'registration_number' => $pendaftar->registration_number,
                'full_name' => $pendaftar->full_name,
                'status' => $pendaftar->status,
                'uuid' => $pendaftar->uuid
            ]
        ], 201);
    }

    /**
     * Search/Track registration status by number & name.
     */
    public function track(Request $request): JsonResponse
    {
        $regNumber = $request->query('registration_number');
        $studentName = $request->query('full_name');

        if (empty($regNumber)) {
            return response()->json([
                'success' => false,
                'message' => 'Nomor registrasi wajib diisi.'
            ], 422);
        }

        $pendaftar = $this->pendaftarRepo->findByRegistrationNumber($regNumber);

        if (!$pendaftar) {
            return response()->json([
                'success' => false,
                'message' => 'Nomor registrasi tidak ditemukan.'
            ], 404);
        }

        // Case-insensitive verification check on the child's name if provided
        if (!empty($studentName)) {
            $matchName = Str::lower($studentName);
            $dbName = Str::lower($pendaftar->full_name);
            $dbNickname = Str::lower($pendaftar->nickname);

            if (!Str::contains($dbName, $matchName) && !Str::contains($dbNickname, $matchName)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data nomor registrasi dan nama anak tidak cocok.'
                ], 404);
            }
        }



        return response()->json([
            'success' => true,
            'data' => [
                'registration_number' => $pendaftar->registration_number,
                'full_name' => $pendaftar->full_name,
                'program' => $pendaftar->program->name,
                'program_code' => $pendaftar->program->code,
                'created_at' => $pendaftar->created_at->toISOString(),
                'status' => $pendaftar->status,
                'verifier_notes' => $pendaftar->verifier_notes,
                'timeline' => $pendaftar->statusLogs->map(function ($log) {
                    return [
                        'status' => $log->new_status,
                        'notes' => $log->notes,
                        'changed_at' => $log->created_at->toISOString()
                    ];
                })->sortByDesc('changed_at')->values()->all()
            ]
        ]);
    }

    /**
     * Get applicant data for revision form.
     */
    public function getForRevision(string $regNumber): JsonResponse
    {
        $pendaftar = $this->pendaftarRepo->findByRegistrationNumber($regNumber);

        if (!$pendaftar || $pendaftar->status !== 'revision') {
            return response()->json([
                'success' => false,
                'message' => 'Data tidak ditemukan atau tidak dalam status revisi.'
            ], 404);
        }

        $pendaftar->load(['parents']);

        return response()->json([
            'success' => true,
            'data' => $pendaftar
        ]);
    }

    /**
     * Update applicant data during revision.
     */
    public function updateRevision(StoreAdmissionRequest $request, string $regNumber): JsonResponse
    {
        $pendaftar = $this->pendaftarRepo->findByRegistrationNumber($regNumber);

        if (!$pendaftar || $pendaftar->status !== 'revision') {
            return response()->json([
                'success' => false,
                'message' => 'Data tidak ditemukan atau tidak dalam status revisi.'
            ], 404);
        }

        $validated = $request->validated();
        
        // Extract files
        $files = [];
        if ($request->hasFile('birth_certificate')) {
            $files['birth_certificate'] = $request->file('birth_certificate');
        }
        if ($request->hasFile('family_card')) {
            $files['family_card'] = $request->file('family_card');
        }
        if ($request->hasFile('photo')) {
            $files['photo'] = $request->file('photo');
        }
        if ($request->hasFile('payment_receipt')) {
            $files['payment_receipt'] = $request->file('payment_receipt');
        }

        $pendaftar = $this->admissionService->updateRevision($pendaftar->id, $validated, $files);

        return response()->json([
            'success' => true,
            'message' => 'Revisi data dan berkas berhasil dikirim.',
            'data' => [
                'registration_number' => $pendaftar->registration_number,
                'status' => $pendaftar->status,
            ]
        ]);
    }
}
