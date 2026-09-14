import React, { useState } from 'react';
import { Copy, Check, FileSpreadsheet, Key, Play } from 'lucide-react';

export default function GoogleSheet() {
    const [copied, setCopied] = useState(false);

    const scriptCode = `/**
 * PPDB Online KB-TK IT Taman Robbani Sidoarjo
 * Google Sheets Apps Script Sync Engine
 * 
 * Cara Penggunaan:
 * 1. Buka Google Sheets baru/lama Anda.
 * 2. Klik menu "Ekstensi" > "Apps Script".
 * 3. Hapus kode bawaan, lalu paste kode ini.
 * 4. Sesuaikan nilai PPDB_URL dan API_TOKEN di bawah.
 * 5. Klik ikon "Simpan" dan jalankan fungsi "syncApplicants".
 */

const PPDB_URL = "http://your-ppdb-domain.com/api/v1/admin/admissions?per_page=1000";
const API_TOKEN = "MASUKKAN_BEARER_TOKEN_ADMIN_DI_SINI";

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Sync PPDB')
      .addItem('Sinkronisasi Data Sekarang', 'syncApplicants')
      .addToUi();
}

function syncApplicants() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  
  // Buat header jika kosong
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      "No. Registrasi", "Nama Calon Siswa", "NIK", "Jenis Kelamin", 
      "Program", "Nama Ayah", "Nama Ibu", "Status Berkas", "Tanggal Terdaftar"
    ]);
    sheet.getRange("A1:I1").setFontWeight("bold").setBackground("#0f766e").setFontColor("#ffffff");
  }

  const options = {
    "method": "get",
    "headers": {
      "Authorization": "Bearer " + API_TOKEN,
      "Accept": "application/json",
      "X-Requested-With": "XMLHttpRequest"
    },
    "muteHttpExceptions": true
  };

  try {
    const response = UrlFetchApp.fetch(PPDB_URL, options);
    const result = JSON.parse(response.getContentText());
    
    if (result.success && result.data && result.data.data) {
      const applicants = result.data.data;
      
      // Hapus data lama di bawah header
      if (sheet.getLastRow() > 1) {
        sheet.getRange(2, 1, sheet.getLastRow() - 1, 9).clearContent();
      }
      
      // Tulis baris baru
      applicants.forEach(function(item) {
        const father = item.parents ? item.parents.find(p => p.type === 'father') : null;
        const mother = item.parents ? item.parents.find(p => p.type === 'mother') : null;
        
        sheet.appendRow([
          item.registration_number,
          item.full_name,
          "'" + item.nik, // Cegah Excel/Google Sheet memotong digit nol
          item.gender === "L" ? "Laki-laki" : "Perempuan",
          item.program ? item.program.code : "-",
          father ? father.name : "-",
          mother ? mother.name : "-",
          item.status.toUpperCase(),
          item.created_at ? item.created_at.substring(0, 10) : "-"
        ]);
      });
      
      SpreadsheetApp.getActiveSpreadsheet().toast("Berhasil memuat " + applicants.length + " pendaftar!", "Sinkronisasi Berhasil");
    } else {
      SpreadsheetApp.getUi().alert("Gagal sinkron: " + response.getContentText());
    }
  } catch (e) {
    SpreadsheetApp.getUi().alert("Error Koneksi: " + e.toString());
  }
}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(scriptCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white rounded-xl border border-slate-200/60 p-6 shadow-sm">
                <h2 className="text-xl font-bold text-slate-800 mb-2 flex items-center gap-2">
                    <FileSpreadsheet className="text-teal-600" /> Integrasi Google Sheets
                </h2>
                <p className="text-slate-500 text-xs">
                    Gunakan Google Apps Script untuk menghubungkan spreadsheet Google Sheets Anda secara langsung dengan database pendaftar PPDB Taman Robbani.
                </p>

                {/* Setup Steps */}
                <div className="mt-8 space-y-6">
                    <h3 className="text-sm font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
                        <Play size={16} className="text-teal-600" /> Panduan Langkah Konfigurasi
                    </h3>
                    
                    <ol className="list-decimal list-inside space-y-3.5 text-xs sm:text-sm text-slate-600 pl-2">
                        <li>
                            Buat Google Sheets baru di Google Drive Anda, lalu buka menu <strong>Ekstensi &rarr; Apps Script</strong>.
                        </li>
                        <li>
                            Hapus semua baris kode kosong yang ada pada file editor bawaan.
                        </li>
                        <li>
                            Salin (Copy) kode script yang disediakan di bawah ini dan tempel (Paste) ke editor Apps Script.
                        </li>
                        <li>
                            Ganti nilai variabel <code>PPDB_URL</code> dengan alamat domain server PPDB Anda dan isi <code>API_TOKEN</code> dengan token akses admin (Sanctum Token).
                        </li>
                        <li>
                            Klik ikon <strong>Simpan Projek</strong> (Disk), lalu klik <strong>Terapkan / Run</strong>. Google Sheets akan memunculkan menu baru bernama <code>Sync PPDB</code> di bar atas spreadsheet Anda!
                        </li>
                    </ol>
                </div>

                {/* Code display panel */}
                <div className="mt-8 border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="bg-slate-900 px-5 py-3 flex justify-between items-center text-xs text-white border-b border-slate-800">
                        <span className="font-semibold font-mono text-teal-400">GoogleAppsScript.gs</span>
                        <button
                            onClick={handleCopy}
                            className="flex items-center gap-1.5 px-3 py-1 bg-white/10 hover:bg-white/20 transition rounded font-semibold text-xxs"
                        >
                            {copied ? (
                                <>
                                    <Check size={12} className="text-teal-400" />
                                    <span>Tersalin</span>
                                </>
                            ) : (
                                <>
                                    <Copy size={12} />
                                    <span>Salin Kode</span>
                                </>
                            )}
                        </button>
                    </div>
                    <pre className="bg-slate-950 p-5 text-teal-300 font-mono text-xxs sm:text-xs overflow-x-auto leading-relaxed max-h-96">
                        {scriptCode}
                    </pre>
                </div>
            </div>
        </div>
    );
}
