import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileQuestion, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 px-4 text-center">
            <div className="w-20 h-20 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mb-6 shadow-inner animate-pulse">
                <FileQuestion size={40} />
            </div>
            
            <h1 className="text-6xl font-display font-extrabold text-slate-800">404</h1>
            <h2 className="text-xl font-bold text-slate-700 mt-3">Halaman Tidak Ditemukan</h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-2 max-w-md leading-relaxed">
                Maaf, halaman yang Anda cari tidak dapat ditemukan atau telah dipindahkan ke alamat lain.
            </p>

            <div className="mt-8 flex flex-wrap gap-3 justify-center items-center">
                <button
                    onClick={() => navigate(-1)}
                    className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs sm:text-sm rounded-xl transition-all flex items-center gap-1.5 cursor-pointer border-none"
                >
                    <ArrowLeft size={16} />
                    <span>Kembali</span>
                </button>
                <Link
                    to="/"
                    className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs sm:text-sm rounded-xl transition-all flex items-center gap-1.5 shadow-xs"
                >
                    <Home size={16} />
                    <span>Ke Beranda</span>
                </Link>
            </div>
        </div>
    );
}
