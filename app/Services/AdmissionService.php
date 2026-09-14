<?php

namespace App\Services;

use App\Models\Tenant\Pendaftar;
use App\Models\Tenant\StudentParent;
use App\Models\Tenant\StudentDocument;
use App\Models\Tenant\StudentStatusLog;
use App\Models\Admin\ActivityLog;
use App\Repositories\Contracts\PendaftarRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AdmissionService
{
    protected PendaftarRepositoryInterface $pendaftarRepo;

    public function __construct(PendaftarRepositoryInterface $pendaftarRepo)
    {
        $this->pendaftarRepo = $pendaftarRepo;
    }

    /**
     * Handle multi-step student registration wizard submission.
     */
    public function registerApplicant(array $data, array $files): Pendaftar
    {
        return DB::connection('mysql')->transaction(function () use ($data, $files) {
            // 1. Generate Registration Number (TR-YYYY-XXXX)
            $year = now()->format('Y');
            $count = DB::connection('mysql')
                ->table('pendaftar')
                ->whereYear('created_at', $year)
                ->count();
            
            $sequence = str_pad($count + 1, 4, '0', STR_PAD_LEFT);
            $regNumber = "TR-{$year}-{$sequence}";

            // 2. Create Pendaftar
            $pendaftar = Pendaftar::create([
                'registration_number' => $regNumber,
                'program_id' => $data['program_id'],
                'email' => $data['email'],
                'phone' => $data['phone'],
                'full_name' => $data['full_name'],
                'nickname' => $data['nickname'],
                'nik' => $data['nik'],
                'gender' => $data['gender'],
                'birth_place' => $data['birth_place'],
                'birth_date' => $data['birth_date'],
                'religion' => $data['religion'] ?? 'Islam',
                'address' => $data['address'],
                'previous_school' => $data['previous_school'] ?? null,
                'notes' => $data['notes'] ?? null,
                'status' => 'pending',
            ]);

            // 3. Create Parents Data
            $parentTypes = ['father', 'mother', 'guardian'];
            foreach ($parentTypes as $type) {
                if (isset($data['parents'][$type]) && !empty($data['parents'][$type]['name'])) {
                    StudentParent::create([
                        'pendaftar_id' => $pendaftar->id,
                        'type' => $type,
                        'name' => $data['parents'][$type]['name'],
                        'occupation' => $data['parents'][$type]['occupation'] ?? null,
                        'education' => $data['parents'][$type]['education'] ?? null,
                        'phone' => $data['parents'][$type]['phone'] ?? null,
                        'email' => $data['parents'][$type]['email'] ?? null,
                        'income' => $data['parents'][$type]['income'] ?? null,
                    ]);
                }
            }

            // 4. Handle Document Uploads
            foreach ($files as $type => $file) {
                if ($file->isValid()) {
                    $path = $file->store("documents/{$regNumber}", 'public');
                    
                    StudentDocument::create([
                        'pendaftar_id' => $pendaftar->id,
                        'document_type' => $type, // 'birth_certificate', 'family_card', 'photo'
                        'file_path' => $path,
                        'file_size' => $file->getSize(),
                    ]);
                }
            }

            // 5. Initial Status Log
            StudentStatusLog::create([
                'pendaftar_id' => $pendaftar->id,
                'old_status' => 'pending',
                'new_status' => 'pending',
                'notes' => 'Pendaftaran baru berhasil dikirim via formulir online.',
            ]);

            return $pendaftar;
        });
    }

    /**
     * Verify / transition status of an applicant.
     */
    public function updateStatus(int $id, string $status, ?string $notes, int $adminUserId, string $ipAddress, string $userAgent): Pendaftar
    {
        return DB::connection('mysql')->transaction(function () use ($id, $status, $notes, $adminUserId, $ipAddress, $userAgent) {
            $pendaftar = Pendaftar::findOrFail($id);
            $oldStatus = $pendaftar->status;

            // Update applicant status
            $pendaftar->status = $status;
            $pendaftar->verifier_notes = $notes;
            $pendaftar->save();

            // Insert status transition log
            StudentStatusLog::create([
                'pendaftar_id' => $pendaftar->id,
                'old_status' => $oldStatus,
                'new_status' => $status,
                'changed_by' => $adminUserId,
                'notes' => $notes,
            ]);

            // Insert admin activity log (Targets mysql_admin connection)
            ActivityLog::create([
                'user_id' => $adminUserId,
                'action' => 'verify_applicant',
                'description' => "Changed status of {$pendaftar->full_name} ({$pendaftar->registration_number}) from '{$oldStatus}' to '{$status}'. Notes: {$notes}",
                'model_type' => Pendaftar::class,
                'model_id' => $pendaftar->id,
                'ip_address' => $ipAddress,
                'user_agent' => $userAgent,
            ]);

            return $pendaftar;
        });
    }

    /**
     * Handle applicant data revision.
     */
    public function updateRevision(int $id, array $data, array $files): Pendaftar
    {
        return DB::connection('mysql')->transaction(function () use ($id, $data, $files) {
            $pendaftar = Pendaftar::findOrFail($id);
            $regNumber = $pendaftar->registration_number;

            // 1. Update Pendaftar
            $pendaftar->update([
                'program_id' => $data['program_id'],
                'email' => $data['email'],
                'phone' => $data['phone'],
                'full_name' => $data['full_name'],
                'nickname' => $data['nickname'],
                'nik' => $data['nik'],
                'gender' => $data['gender'],
                'birth_place' => $data['birth_place'],
                'birth_date' => $data['birth_date'],
                'religion' => $data['religion'] ?? 'Islam',
                'address' => $data['address'],
                'previous_school' => $data['previous_school'] ?? null,
                'notes' => $data['notes'] ?? null,
                'status' => 'pending',
            ]);

            // 2. Update Parents Data
            StudentParent::where('pendaftar_id', $pendaftar->id)->delete();
            $parentTypes = ['father', 'mother', 'guardian'];
            foreach ($parentTypes as $type) {
                if (isset($data['parents'][$type]) && !empty($data['parents'][$type]['name'])) {
                    StudentParent::create([
                        'pendaftar_id' => $pendaftar->id,
                        'type' => $type,
                        'name' => $data['parents'][$type]['name'],
                        'occupation' => $data['parents'][$type]['occupation'] ?? null,
                        'education' => $data['parents'][$type]['education'] ?? null,
                        'phone' => $data['parents'][$type]['phone'] ?? null,
                        'email' => $data['parents'][$type]['email'] ?? null,
                        'income' => $data['parents'][$type]['income'] ?? null,
                    ]);
                }
            }

            // 3. Handle Document Uploads (Overwrite if exists)
            foreach ($files as $type => $file) {
                if ($file->isValid()) {
                    $path = $file->store("documents/{$regNumber}", 'public');
                    
                    StudentDocument::updateOrCreate(
                        ['pendaftar_id' => $pendaftar->id, 'document_type' => $type],
                        ['file_path' => $path, 'file_size' => $file->getSize()]
                    );
                }
            }

            // 4. Status Log
            StudentStatusLog::create([
                'pendaftar_id' => $pendaftar->id,
                'old_status' => 'revision',
                'new_status' => 'pending',
                'notes' => 'Pendaftar mengirimkan revisi data/berkas.',
            ]);

            return $pendaftar;
        });
    }
}
