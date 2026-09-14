import React, { useState } from 'react';
import { Download, FileSpreadsheet, ShieldAlert } from 'lucide-react';

export default function Export() {
    const [downloading, setDownloading] = useState(false);

    const handleDownload = () => {
        setDownloading(true);
        // Direct browser redirect to triggering stream download
        const token = localStorage.getItem('admin_token');
        if (token) {
            window.location.href = `/api/v1/admin/exports/excel?api_token=${token}`;
        } else {
            window.location.href = '/api/v1/admin/exports/excel';
        }
        setTimeout(() => setDownloading(false), 2000);
    };

    return (
        <div className="max-w-xl mx-auto py-8">
            <div className="bg-white rounded-xl border border-slate-200/60 p-8 shadow-sm flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mb-6 shadow-inner">
                    <FileSpreadsheet size={32} />
                </div>
                
                <h2 className="text-2xl font-display font-bold text-slate-800 mb-2">Ekspor Database PPDB</h2>
                <p className="text-slate-500 text-sm mb-6 max-w-md">
                    Unduh seluruh data profil calon siswa beserta kontak orang tua dan pilihan program dalam format file spreadsheet Excel (.CSV).
                </p>

                <div className="bg-amber-50/50 border border-amber-100 p-4 rounded-lg text-left text-xs text-amber-800 mb-8 space-y-2 max-w-md">
                    <h4 className="font-bold flex items-center gap-1.5"><ShieldAlert size={14} /> Catatan Format Data:</h4>
                    <p className="leading-relaxed">
                        Data dikompilasi dengan encoding UTF-8 BOM dan pembatas titik koma (;) untuk memastikan digit angka NIK/Nomor HP tidak terpotong saat dibuka langsung di Microsoft Excel atau LibreOffice.
                    </p>
                </div>

                <button
                    onClick={handleDownload}
                    disabled={downloading}
                    className="w-full sm:w-auto px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm rounded-lg transition-all flex items-center justify-center gap-2 shadow disabled:opacity-50"
                >
                    <Download size={16} />
                    <span>{downloading ? 'Sedang Mengunduh...' : 'Unduh File Excel / CSV'}</span>
                </button>
            </div>
        </div>
    );
}
