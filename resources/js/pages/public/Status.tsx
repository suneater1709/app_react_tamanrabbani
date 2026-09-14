import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Clock, ClipboardList, AlertCircle, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

const searchSchema = z.object({
    registration_number: z.string().min(5, 'Nomor registrasi wajib diisi.'),
});

type SearchFormData = z.infer<typeof searchSchema>;

interface TimelineItem {
    status: string;
    notes: string | null;
    changed_at: string;
}

interface TrackData {
    registration_number: string;
    full_name: string;
    program: string;
    program_code: string;
    created_at: string;
    status: 'pending' | 'revision' | 'accepted';
    verifier_notes: string | null;
    timeline: TimelineItem[];
}

export default function Status() {
    const [result, setResult] = useState<TrackData | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SearchFormData>({
        resolver: zodResolver(searchSchema),
    });

    const onSubmit = async (data: SearchFormData) => {
        setLoading(true);
        setErrorMsg(null);
        setResult(null);

        try {
            const res = await axios.get('/api/v1/public/admissions/track', {
                params: {
                    registration_number: data.registration_number,
                },
            });
            if (res.data.success) {
                setResult(res.data.data);
            }
        } catch (err: any) {
            console.error(err);
            if (err.response?.data?.message) {
                setErrorMsg(err.response.data.message);
            } else {
                setErrorMsg('Pencarian gagal. Hubungan koneksi terputus.');
            }
        } finally {
            setLoading(false);
        }
    };

    const getStatusStyle = (status: string) => {
        if (status === 'accepted') return 'bg-emerald-100 text-emerald-800 border border-emerald-300'; // hijau = diterima
        if (status === 'revision' || status === 'rejected') return 'bg-rose-100 text-rose-800 border border-rose-300'; // merah = revisi
        return 'bg-amber-100 text-amber-800 border border-amber-300'; // kuning = pending
    };

    const getStatusLabel = (status: string) => {
        if (status === 'accepted') return 'Diterima';
        if (status === 'revision') return 'Perlu Revisi';
        if (status === 'rejected') return 'Ditolak';
        return 'Menunggu Verifikasi (Pending)';
    };

    return (
        <div className="py-12 bg-slate-50 min-h-[80vh] text-left">
            <div className="max-w-4xl mx-auto px-4 sm:px-6">
                
                {/* Title */}
                <div className="text-center max-w-3xl mx-auto mb-10">
                    <h1 className="text-3xl font-extrabold text-slate-800">Cek Status Pendaftaran</h1>
                    <p className="mt-3 text-slate-500 text-xs sm:text-sm">
                        Masukkan nomor registrasi unik Anda untuk melacak status penyeleksian berkas panitia PPDB.
                    </p>
                </div>

                {/* Search Card Container (Gambar 5) */}
                <div className="bg-white rounded-3xl shadow-md p-6 sm:p-8 mb-8 max-w-2xl mx-auto border-none">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <label className="block text-xxs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
                                NOMOR REGISTRASI UNIK ANDA:
                            </label>
                            
                            <div className="flex flex-col sm:flex-row gap-3">
                                <input
                                    type="text"
                                    {...register('registration_number')}
                                    className="flex-1 px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-sm font-semibold tracking-wider placeholder-slate-300"
                                    placeholder="TAMAN-ROBBANI-2026-XXX"
                                />
                                
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                                >
                                    {loading ? 'Mencari...' : 'Cek Status'}
                                </button>
                            </div>
                            
                            {errors.registration_number && (
                                <p className="text-xs text-rose-500 mt-2">{errors.registration_number.message}</p>
                            )}
                        </div>

                        {errorMsg && (
                            <div className="p-3.5 bg-rose-50 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                                <AlertCircle size={16} />
                                <span>{errorMsg}</span>
                            </div>
                        )}
                    </form>
                </div>

                {/* Results Dossier */}
                {result && (
                    <div className="space-y-6">
                        
                        {/* Summary dossier block */}
                        <div className="bg-white rounded-3xl shadow-md p-6 sm:p-8 border-none">
                            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
                                <ClipboardList className="text-teal-600" size={18} /> Detail Pendaftaran
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs sm:text-sm mb-6">
                                <div className="space-y-2">
                                    <p>
                                        <strong className="text-slate-400 font-semibold block uppercase text-[10px] tracking-wider mb-0.5">Nomor Registrasi</strong> 
                                        <span className="font-display font-extrabold text-md text-slate-700 tracking-wide">{result.registration_number}</span>
                                    </p>
                                    <p>
                                        <strong className="text-slate-400 font-semibold block uppercase text-[10px] tracking-wider mb-0.5">Nama Lengkap Anak</strong> 
                                        <span className="text-slate-750 font-bold">{result.full_name}</span>
                                    </p>
                                    <p>
                                        <strong className="text-slate-400 font-semibold block uppercase text-[10px] tracking-wider mb-0.5">Pilihan Program</strong> 
                                        <span className="text-slate-750 font-semibold">{result.program} ({result.program_code})</span>
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <p>
                                        <strong className="text-slate-400 font-semibold block uppercase text-[10px] tracking-wider mb-0.5">Status Saat Ini</strong> 
                                        <span className={`px-2.5 py-1 text-xxs font-bold rounded-full uppercase ${getStatusStyle(result.status)}`}>
                                            {getStatusLabel(result.status)}
                                        </span>
                                    </p>
                                    <p>
                                        <strong className="text-slate-400 font-semibold block uppercase text-[10px] tracking-wider mb-0.5">Tanggal Registrasi</strong> 
                                        <span className="text-slate-750 font-semibold">{new Date(result.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                    </p>
                                </div>
                            </div>

                            {result.verifier_notes && (
                                <div className="p-4 bg-slate-50 rounded-xl border-none">
                                    <span className="text-xxs font-bold text-slate-400 uppercase tracking-wider block mb-1">Catatan Tim Verifikasi</span>
                                    <p className="text-xs text-slate-650 italic">"{result.verifier_notes}"</p>
                                </div>
                            )}

                            {result.status === 'revision' && (
                                <div className="mt-4 p-5 bg-amber-50 rounded-xl border border-amber-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <AlertCircle className="text-amber-600 flex-shrink-0" size={24} />
                                        <div>
                                            <h4 className="text-sm font-bold text-amber-800">Perlu Revisi Data/Berkas</h4>
                                            <p className="text-xs text-amber-700 mt-0.5">Klik tombol di samping untuk memperbaiki data dan melengkapi berkas Anda.</p>
                                        </div>
                                    </div>
                                    <Link
                                        to={`/ppdb/revisi/${result.registration_number}`}
                                        className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs transition whitespace-nowrap shadow-sm flex-shrink-0"
                                    >
                                        Perbaiki Data Sekarang
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Status log timeline */}
                        <div className="bg-white rounded-3xl shadow-md p-6 sm:p-8 border-none">
                            <h3 className="text-lg font-bold text-slate-800 mb-8 border-b border-slate-100 pb-4 flex items-center gap-2">
                                <Clock className="text-teal-600" size={18} /> Riwayat Status & Timeline
                            </h3>

                            <div className="relative border-l border-slate-200 ml-4 space-y-8 pb-4">
                                {result.timeline.map((log, idx) => {
                                    const isLast = idx === result.timeline.length - 1;
                                    return (
                                        <div key={idx} className="relative pl-8">
                                            <div className={`absolute left-0 -translate-x-[9px] top-1 w-4.5 h-4.5 rounded-full border-2 bg-white flex items-center justify-center ${
                                                isLast ? 'border-teal-500 scale-110' : 'border-slate-350'
                                            }`}>
                                                {isLast && <div className="w-1.5 h-1.5 rounded-full bg-teal-500" />}
                                            </div>

                                            <div>
                                                <span className="text-xxs font-semibold text-slate-400 block mb-1">
                                                    {new Date(log.changed_at).toLocaleString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })} WIB
                                                </span>
                                                <h4 className="font-bold text-slate-800 text-xs sm:text-sm uppercase tracking-wide">
                                                    {getStatusLabel(log.status)}
                                                </h4>
                                                {log.notes && (
                                                    <p className="text-xs text-slate-500 mt-1 leading-relaxed italic">
                                                        "{log.notes}"
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                    </div>
                )}

            </div>
        </div>
    );
}
