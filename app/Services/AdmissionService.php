<?php

namespace App\Services;

use App\Models\Admin\ActivityLog;
use App\Models\Tenant\Pendaftar;
use App\Models\Tenant\Program;
use App\Models\Tenant\Setting;
use App\Models\Tenant\StudentDocument;
use App\Models\Tenant\StudentParent;
use App\Models\Tenant\StudentStatusLog;
use App\Repositories\Contracts\PendaftarRepositoryInterface;
use Illuminate\Support\Facades\DB;

class AdmissionService
{
    protected PendaftarRepositoryInterface $pendaftarRepo;

    public function __construct(PendaftarRepositoryInterface $pendaftarRepo)
    {
        $this->pendaftarRepo = $pendaftarRepo;
    }

    /**
     * Calculate automatic payment breakdown & total transfer snapshot.
     */
    public function calculatePaymentSnapshot($programId): array
    {
        $program = Program::find($programId);
        $programName = $program?->name ?? 'Program Belajar';
        $programCode = $program?->code ?? '';

        $isKb = false;
        if ($program) {
            $codeUpper = strtoupper($program->code);
            $nameUpper = strtoupper($program->name);
            if (str_contains($codeUpper, 'KB') || str_contains($codeUpper, 'PG') || str_contains($nameUpper, 'KELOMPOK BERMAIN') || str_contains($nameUpper, 'PLAYGROUP')) {
                $isKb = true;
            }
        } elseif ($programId === '1' || $programId === 1 || $programId === 'pg') {
            $isKb = true;
        }

        // 1. Get Fee Structure from Setting
        $feeSetting = Setting::where('key', 'ppdb_fee_structure')->value('value');
        $fees = $feeSetting ? json_decode($feeSetting, true) : null;

        $entryFee = $isKb ? 2800000 : 3950000;
        $infaqAmount = $isKb ? 550000 : 750000;

        if ($fees && is_array($fees)) {
            $levelKey = $isKb ? 'kb' : 'tk';
            if (isset($fees[$levelKey])) {
                if (isset($fees[$levelKey]['total'])) {
                    $entryFee = (float) $fees[$levelKey]['total'];
                } elseif (isset($fees[$levelKey]['items']) && is_array($fees[$levelKey]['items'])) {
                    $entryFee = array_sum(array_column($fees[$levelKey]['items'], 'amount'));
                }

                if (isset($fees[$levelKey]['items']) && is_array($fees[$levelKey]['items'])) {
                    foreach ($fees[$levelKey]['items'] as $item) {
                        if (isset($item['name']) && stripos($item['name'], 'infaq') !== false) {
                            $infaqAmount = (float) $item['amount'];
                            break;
                        }
                    }
                }
            }
        }

        // 2. Form Fee (0 if not added to total transfer)
        $formFee = 0;

        // 3. Get Active Wave & Cashback Percentage from Setting
        $waveSetting = Setting::where('key', 'ppdb_waves')->value('value');
        $waves = $waveSetting ? json_decode($waveSetting, true) : null;

        $activeWave = null;
        if (is_array($waves)) {
            foreach ($waves as $w) {
                if (! empty($w['is_active'])) {
                    $activeWave = $w;
                    break;
                }
            }
            if (! $activeWave && count($waves) > 0) {
                $activeWave = $waves[0];
            }
        }

        $activeWaveName = $activeWave['name'] ?? 'Gelombang 1';
        $cashbackPercent = 50;

        if ($activeWave) {
            if (isset($activeWave['cashback_percent']) && is_numeric($activeWave['cashback_percent'])) {
                $cashbackPercent = (float) $activeWave['cashback_percent'];
            } elseif (isset($activeWave['cashback_percentage']) && is_numeric($activeWave['cashback_percentage'])) {
                $cashbackPercent = (float) $activeWave['cashback_percentage'];
            } elseif (isset($activeWave['discount']) && is_numeric($activeWave['discount']) && (float) $activeWave['discount'] <= 100) {
                $cashbackPercent = (float) $activeWave['discount'];
            } else {
                $waveNameLower = strtolower($activeWave['name'] ?? '');
                $badgeText = strtolower($activeWave['badge'] ?? '');
                $noteText = strtolower($activeWave['note'] ?? '');

                if (str_contains($badgeText, '50') || str_contains($noteText, '50') || str_contains($waveNameLower, 'gelombang 1') || str_contains($waveNameLower, 'gel 1') || str_contains($waveNameLower, 'gel i') || str_contains($waveNameLower, 'early bird')) {
                    $cashbackPercent = 50;
                } elseif (str_contains($badgeText, '40') || str_contains($noteText, '40') || str_contains($waveNameLower, 'gelombang 2') || str_contains($waveNameLower, 'gel 2') || str_contains($waveNameLower, 'gel ii') || str_contains($waveNameLower, 'reguler')) {
                    $cashbackPercent = 40;
                } elseif (str_contains($badgeText, '30') || str_contains($noteText, '30') || str_contains($waveNameLower, 'gelombang 3') || str_contains($waveNameLower, 'gel 3') || str_contains($waveNameLower, 'gel iii')) {
                    $cashbackPercent = 30;
                }
            }
        }

        $discountAmount = round(($cashbackPercent / 100) * $infaqAmount);
        $totalTransfer = max(0, $entryFee - $discountAmount);

        $entryFeeLabel = $isKb ? 'Biaya Masuk Kelompok Bermain (KB)' : ($programName ? 'Biaya Masuk '.$programName : 'Biaya Masuk Taman Kanak-Kanak (TK A & TK B)');
        $discountLabel = 'Cashback Infaq Pendidikan ('.$activeWaveName.' - '.$cashbackPercent.'%)';

        $breakdown = [
            'program_name' => $programName,
            'program_code' => $programCode,
            'is_kb' => $isKb,
            'entry_fee_label' => $entryFeeLabel,
            'entry_fee' => $entryFee,
            'infaq_amount' => $infaqAmount,
            'cashback_percent' => $cashbackPercent,
            'form_fee_label' => 'Biaya Form Pendaftaran',
            'form_fee' => $formFee,
            'discount_label' => $discountLabel,
            'discount_amount' => $discountAmount,
            'total_transfer_amount' => $totalTransfer,
            'wave_name' => $activeWaveName,
            'bank_name' => 'Bank Syariah Indonesia (BSI)',
            'bank_account_number' => '7122107207',
            'bank_account_holder' => 'Rumi Salam Muhaimin',
        ];

        return [
            'entry_fee' => $entryFee,
            'infaq_amount' => $infaqAmount,
            'cashback_percent' => $cashbackPercent,
            'form_fee' => $formFee,
            'discount_amount' => $discountAmount,
            'total_transfer_amount' => $totalTransfer,
            'wave_name' => $activeWaveName,
            'payment_breakdown' => $breakdown,
        ];
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

            // Calculate Payment Snapshot
            $snapshot = $this->calculatePaymentSnapshot($data['program_id']);

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
                'entry_fee' => $snapshot['entry_fee'],
                'form_fee' => $snapshot['form_fee'],
                'discount_amount' => $snapshot['discount_amount'],
                'total_transfer_amount' => $snapshot['total_transfer_amount'],
                'wave_name' => $snapshot['wave_name'],
                'payment_breakdown' => $snapshot['payment_breakdown'],
            ]);

            // 3. Create Parents Data
            $parentTypes = ['father', 'mother', 'guardian'];
            foreach ($parentTypes as $type) {
                if (isset($data['parents'][$type]) && ! empty($data['parents'][$type]['name'])) {
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

            // Calculate Payment Snapshot if not set or program updated
            $snapshot = $this->calculatePaymentSnapshot($data['program_id']);

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
                'entry_fee' => $pendaftar->entry_fee > 0 ? $pendaftar->entry_fee : $snapshot['entry_fee'],
                'form_fee' => $pendaftar->form_fee > 0 ? $pendaftar->form_fee : $snapshot['form_fee'],
                'discount_amount' => $pendaftar->discount_amount !== null ? $pendaftar->discount_amount : $snapshot['discount_amount'],
                'total_transfer_amount' => $pendaftar->total_transfer_amount > 0 ? $pendaftar->total_transfer_amount : $snapshot['total_transfer_amount'],
                'wave_name' => $pendaftar->wave_name ?: $snapshot['wave_name'],
                'payment_breakdown' => $pendaftar->payment_breakdown ?: $snapshot['payment_breakdown'],
            ]);

            // 2. Update Parents Data
            StudentParent::where('pendaftar_id', $pendaftar->id)->delete();
            $parentTypes = ['father', 'mother', 'guardian'];
            foreach ($parentTypes as $type) {
                if (isset($data['parents'][$type]) && ! empty($data['parents'][$type]['name'])) {
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
