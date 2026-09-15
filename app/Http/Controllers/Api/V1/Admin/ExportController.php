<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Admin\ActivityLog;
use App\Models\Admin\PersonalAccessToken;
use App\Models\Tenant\Pendaftar;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ExportController extends Controller
{
    /**
     * Export all applicant dossiers to Excel (XLSX).
     */
    public function exportExcel(Request $request): Response
    {
        $adminUser = $request->user();

        // Fallback check for query parameter API token (essential for direct window downloads)
        if (! $adminUser && $request->query('api_token')) {
            $tokenModel = PersonalAccessToken::findToken($request->query('api_token'));
            if ($tokenModel) {
                $adminUser = $tokenModel->tokenable;
            }
        }

        // Abort if unauthorized
        if (! $adminUser) {
            return response()->json([
                'success' => false,
                'message' => 'Akses ditolak. Token autentikasi tidak valid.',
            ], 401);
        }

        // Log export action
        ActivityLog::create([
            'user_id' => $adminUser->id,
            'action' => 'export_applicants',
            'description' => 'Exported applicant registration database to XLSX.',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        $spreadsheet = new Spreadsheet;
        $spreadsheet->removeSheetByIndex(0);

        // --- SHEET 1: Daftar Pendaftar ---
        $sheet1 = new Worksheet($spreadsheet, 'Daftar Pendaftar');
        $spreadsheet->addSheet($sheet1);

        $columns = [
            'Nomor Registrasi',
            'Nama Lengkap',
            'Nama Panggilan',
            'NIK',
            'Jenis Kelamin',
            'Tempat Lahir',
            'Tanggal Lahir',
            'Agama',
            'Program Pilihan',
            'Asal Sekolah',
            'Alamat Lengkap',
            'Nama Ayah',
            'HP Ayah',
            'Nama Ibu',
            'HP Ibu',
            'Status PPDB',
            'Tanggal Daftar',
        ];

        $rows = [];
        Pendaftar::with(['program', 'parents'])->chunk(100, function ($applicants) use (&$rows) {
            foreach ($applicants as $app) {
                $father = $app->parents->firstWhere('type', 'father');
                $mother = $app->parents->firstWhere('type', 'mother');

                $rows[] = [
                    $app->registration_number,
                    $app->full_name,
                    $app->nickname,
                    $app->nik,
                    $app->gender === 'L' ? 'Laki-laki (L)' : 'Perempuan (P)',
                    $app->birth_place,
                    date('d/m/Y', strtotime($app->birth_date)),
                    $app->religion,
                    $app->program ? $app->program->name : '-',
                    $app->previous_school ?: '-',
                    $app->address,
                    $father ? $father->name : '-',
                    $father ? $father->phone : '-',
                    $mother ? $mother->name : '-',
                    $mother ? $mother->phone : '-',
                    strtoupper($app->status),
                    $app->created_at->format('d/m/Y H:i:s'),
                ];
            }
        });

        $this->exportToSheet($sheet1, [
            'title' => 'LAPORAN DAFTAR PENDAFTAR PPDB',
            'subtitle' => 'Tanggal Unduh: '.date('d-m-Y H:i:s'),
            'headers' => $columns,
            'rows' => $rows,
            'columnFormats' => [
                7 => 'dd/mm/yyyy',
            ],
        ]);

        // --- SHEET 2: Detail Berkas ---
        $sheet2 = new Worksheet($spreadsheet, 'Detail Berkas');
        $spreadsheet->addSheet($sheet2);

        $this->buildVerticalBlocks($sheet2);

        $sheet1->setSelectedCell('A1');
        $spreadsheet->setActiveSheetIndex(0);

        // Return as StreamedResponse
        $writer = new Xlsx($spreadsheet);
        $filename = 'ppdb_tamanrabbani_'.date('Ymd_His').'.xlsx';

        $headers = [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => 'attachment; filename="'.$filename.'"',
            'Cache-Control' => 'max-age=0',
        ];

        return new StreamedResponse(function () use ($writer) {
            $writer->save('php://output');
        }, 200, $headers);
    }

    private function exportToSheet(Worksheet $sheet, array $config)
    {
        $title = $config['title'] ?? 'Laporan';
        $subtitle = $config['subtitle'] ?? '';
        $headers = $config['headers'] ?? [];
        $rows = $config['rows'] ?? [];
        $columnFormats = $config['columnFormats'] ?? [];

        $colCount = count($headers);
        if ($colCount === 0) {
            $colCount = 1;
        }
        $maxColLetter = Coordinate::stringFromColumnIndex($colCount);

        // Baris 1: Judul Laporan
        $sheet->setCellValue('A1', $title);
        $sheet->mergeCells('A1:'.$maxColLetter.'1');
        $sheet->getStyle('A1')->applyFromArray([
            'font' => ['bold' => true, 'size' => 14],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER,
            ],
        ]);

        // Baris 2: Subjudul
        $sheet->setCellValue('A2', $subtitle);
        $sheet->mergeCells('A2:'.$maxColLetter.'2');
        $sheet->getStyle('A2')->applyFromArray([
            'font' => ['italic' => true],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER,
            ],
        ]);

        // Baris 3: Spacer (kosong)

        // Baris 4: Header Kolom
        $headerRow = 4;
        foreach ($headers as $index => $header) {
            $colLetter = Coordinate::stringFromColumnIndex($index + 1);
            $sheet->setCellValue($colLetter.$headerRow, $header);
        }

        $sheet->getStyle('A'.$headerRow.':'.$maxColLetter.$headerRow)->applyFromArray([
            'font' => ['bold' => true],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => 'F1F1F1'],
            ],
            'borders' => [
                'bottom' => ['borderStyle' => Border::BORDER_THICK],
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER,
            ],
        ]);

        $sheet->freezePane('A5');

        // Baris Data
        $currentRow = 5;
        foreach ($rows as $rowIndex => $row) {
            if (count($row) !== count($headers)) {
                Log::warning('Export Excel: Panjang baris ke-'.($rowIndex + 1).' tidak sama dengan panjang header.');
            }

            foreach ($row as $colIndex => $cellValue) {
                $colLetter = Coordinate::stringFromColumnIndex($colIndex + 1);
                $sheet->setCellValue($colLetter.$currentRow, $cellValue);

                $align = Alignment::HORIZONTAL_LEFT;
                if (is_numeric($cellValue)) {
                    $align = Alignment::HORIZONTAL_RIGHT;
                }
                if (in_array(strtolower((string) $cellValue), ['pending', 'accepted', 'revision', 'rejected'])) {
                    $align = Alignment::HORIZONTAL_CENTER;
                }

                $sheet->getStyle($colLetter.$currentRow)->getAlignment()->setHorizontal($align);

                $colNumber = $colIndex + 1;
                if (isset($columnFormats[$colNumber])) {
                    $sheet->getStyle($colLetter.$currentRow)
                        ->getNumberFormat()
                        ->setFormatCode($columnFormats[$colNumber]);
                }
            }
            $currentRow++;
        }

        if (count($rows) > 0) {
            $sheet->getStyle('A5:'.$maxColLetter.($currentRow - 1))->applyFromArray([
                'borders' => [
                    'allBorders' => ['borderStyle' => Border::BORDER_THIN],
                ],
            ]);
        }

        for ($i = 1; $i <= $colCount; $i++) {
            $colLetter = Coordinate::stringFromColumnIndex($i);
            $sheet->getColumnDimension($colLetter)->setAutoSize(true);
        }
    }

    private function buildVerticalBlocks(Worksheet $sheet)
    {
        $sheet->setCellValue('A1', 'DETAIL BERKAS PENDAFTAR (BLOK VERTIKAL)');
        $sheet->mergeCells('A1:B1');
        $sheet->getStyle('A1')->applyFromArray([
            'font' => ['bold' => true, 'size' => 14],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER,
            ],
        ]);

        $currentRow = 3;

        Pendaftar::with(['program', 'parents'])->chunk(100, function ($applicants) use ($sheet, &$currentRow) {
            foreach ($applicants as $app) {
                $sheet->setCellValue('A'.$currentRow, 'No Reg: '.$app->registration_number.' — Nama: '.$app->full_name);
                $sheet->mergeCells('A'.$currentRow.':B'.$currentRow);
                $sheet->getStyle('A'.$currentRow.':B'.$currentRow)->applyFromArray([
                    'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
                    'fill' => [
                        'fillType' => Fill::FILL_SOLID,
                        'startColor' => ['rgb' => '059669'], // emerald-600
                    ],
                    'alignment' => [
                        'horizontal' => Alignment::HORIZONTAL_CENTER,
                    ],
                ]);
                $currentRow++;

                $father = $app->parents->firstWhere('type', 'father');
                $mother = $app->parents->firstWhere('type', 'mother');

                $dataPairs = [
                    ['Biodata Siswa', ''],
                    ['Nama Lengkap', $app->full_name],
                    ['Jenis Kelamin', $app->gender === 'L' ? 'Laki-laki (L)' : 'Perempuan (P)'],
                    ['Tempat/Tanggal Lahir', $app->birth_place.', '.date('d/m/Y', strtotime($app->birth_date))],
                    ['No HP Wali', $father ? $father->phone : ($mother ? $mother->phone : '-')],
                    ['Alamat', $app->address],
                    ['Sekolah Asal', $app->previous_school ?: '-'],
                    ['Program Pilihan', $app->program ? $app->program->name : '-'],
                    ['Agama', $app->religion],
                    ['Biodata Orang Tua', ''],
                    ['Ayah Kandung', $father ? $father->name.' ('.($father->occupation ?: 'Tidak bekerja').')' : '-'],
                    ['Ibu Kandung', $mother ? $mother->name.' ('.($mother->occupation ?: 'Tidak bekerja').')' : '-'],
                    ['Kontak Ayah/Ibu', 'Ayah: '.($father ? $father->phone : '-').' / Ibu: '.($mother ? $mother->phone : '-')],
                    ['Email', $father ? $father->email : ($mother ? $mother->email : '-')],
                    ['Status PPDB', strtoupper($app->status)],
                    ['Catatan Tambahan', $app->verifier_notes ?: '-'],
                ];

                $startRow = $currentRow;

                foreach ($dataPairs as $pair) {
                    $sheet->setCellValue('A'.$currentRow, $pair[0]);
                    $sheet->setCellValue('B'.$currentRow, $pair[1]);

                    if ($pair[1] === '') {
                        $sheet->mergeCells('A'.$currentRow.':B'.$currentRow);
                        $sheet->getStyle('A'.$currentRow.':B'.$currentRow)->applyFromArray([
                            'font' => ['bold' => true, 'italic' => true],
                            'fill' => [
                                'fillType' => Fill::FILL_SOLID,
                                'startColor' => ['rgb' => 'E2E8F0'],
                            ],
                        ]);
                    } else {
                        $sheet->getStyle('A'.$currentRow)->getFont()->setBold(true);
                    }

                    $currentRow++;
                }

                $sheet->getStyle('A'.$startRow.':B'.($currentRow - 1))->applyFromArray([
                    'borders' => [
                        'allBorders' => ['borderStyle' => Border::BORDER_THIN],
                    ],
                ]);

                $currentRow += 2; // Spacer between blocks
            }
        });

        $sheet->getColumnDimension('A')->setAutoSize(true);
        $sheet->getColumnDimension('B')->setAutoSize(true);
    }
}
