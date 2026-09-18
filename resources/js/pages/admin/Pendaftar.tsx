import React, { useEffect, useState } from 'react';
import { adminApi, cmsApi } from '../../services/api';
import { Search, Eye, Trash2, Download, Inbox, AlertTriangle, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Applicant {
    id: number;
    registration_number: string;
    full_name: string;
    nik: string;
    gender: 'L' | 'P';
    program: { name: string; code: string };
    parents: { name: string; type: string }[];
    status: 'pending' | 'revision' | 'accepted' | 'rejected';
    created_at: string;
}

export default function Pendaftar() {
    const navigate = useNavigate();
    const [applicants, setApplicants] = useState<Applicant[]>([]);
    const [programs, setPrograms] = useState<{ id: number; name: string; code: string }[]>([]);
    
    // Filters
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('all');
    const [programId, setProgramId] = useState('');
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    
    const [loading, setLoading] = useState(true);
    
    // Delete states
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        cmsApi.getPrograms()
            .then((res) => {
                if (res.success) setPrograms(res.data || []);
            });
    }, []);

    const fetchApplicants = () => {
        setLoading(true);
        const params = {
            search,
            status,
            program_id: programId,
            page,
        };

        adminApi.getApplicants(params)
            .then((res) => {
                if (res.success) {
                    setApplicants(res.data.data || []);
                    setLastPage(res.data.last_page || 1);
                }
            })
            .catch((err) => console.error(err))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchApplicants();
    }, [search, status, programId, page]);

    // Lock background body scroll when delete modal is open
    useEffect(() => {
        if (deleteId !== null) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [deleteId]);

    // Format dates
    const formatDate = (dateStr: string) => {
        if (!dateStr) return '-';
        return dateStr.split('T')[0];
    };

    // Extract mother & father names
    const getParentsData = (parents: { name: string; type: string }[]) => {
        const mother = parents?.find((p) => p.type === 'mother');
        const father = parents?.find((p) => p.type === 'father');
        return {
            mother: mother ? mother.name : '-',
            father: father ? father.name : '-',
        };
    };

    // Excel Export Trigger
    const handleExport = () => {
        const token = localStorage.getItem('admin_token');
        if (token) {
            window.location.href = `/api/v1/admin/exports/excel?api_token=${token}`;
        }
    };

    // Delete Trigger
    const handleDeleteConfirm = async () => {
        if (!deleteId) return;
        setDeleting(true);
        const token = localStorage.getItem('admin_token');
        try {
            const res = await axios.delete(`/api/v1/admin/admissions/${deleteId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (res.data.success) {
                setDeleteId(null);
                fetchApplicants();
            }
        } catch (err) {
            console.error(err);
            alert('Gagal menghapus pendaftar.');
        } finally {
            setDeleting(false);
        }
    };

    // Status Badges
    const renderStatusBadge = (statusVal: string) => {
        if (statusVal === 'accepted') {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-bold rounded-full uppercase tracking-wider">
                    Diterima
                </span>
            );
        }
        if (statusVal === 'rejected') {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 bg-rose-50 text-rose-700 border border-rose-100 text-[10px] font-bold rounded-full uppercase tracking-wider">
                    Ditolak
                </span>
            );
        }
        if (statusVal === 'revision') {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 bg-purple-50 text-purple-700 border border-purple-100 text-[10px] font-bold rounded-full uppercase tracking-wider">
                    Perlu Revisi
                </span>
            );
        }
        return (
            <span className="inline-flex items-center px-2.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-100 text-[10px] font-bold rounded-full uppercase tracking-wider">
                Menunggu Verifikasi
            </span>
        );
    };

    return (
        <div className="space-y-8 text-left font-sans">
            
            {/* Filters panel with Redesigned UI */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border-none flex flex-col md:flex-row gap-4 items-center justify-between">
                
                {/* Search box without dark strokes */}
                <div className="relative w-full md:w-80">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                        <Search size={16} />
                    </span>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 bg-slate-50 rounded-xl text-slate-800 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all placeholder-slate-400"
                        placeholder="Cari nama, NIK, No. Registrasi..."
                    />
                </div>

                <div className="flex flex-wrap md:flex-nowrap gap-4 w-full md:w-auto items-center">
                    {/* Status Filter */}
                    <select
                        value={status}
                        onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                        className="px-4 py-2.5 border border-slate-200 bg-slate-50 rounded-xl text-slate-700 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all cursor-pointer"
                    >
                        <option value="all">Semua Status</option>
                        <option value="pending">Menunggu Verifikasi</option>
                        <option value="revision">Perlu Revisi</option>
                        <option value="rejected">Ditolak</option>
                        <option value="accepted">Diterima</option>
                    </select>

                    {/* Program Filter */}
                    <select
                        value={programId}
                        onChange={(e) => { setProgramId(e.target.value); setPage(1); }}
                        className="px-4 py-2.5 border border-slate-200 bg-slate-50 rounded-xl text-slate-700 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all cursor-pointer"
                    >
                        <option value="">Semua Program</option>
                        {programs.map((p) => (
                            <option key={p.id} value={p.id}>{p.code}</option>
                        ))}
                    </select>

                    {/* Excel Button */}
                    <button
                        onClick={handleExport}
                        className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-1.5 cursor-pointer ml-auto md:ml-0"
                    >
                        <Download size={16} />
                        <span>Ekspor Excel</span>
                    </button>
                </div>
            </div>

            {/* List Table */}
            <div className="bg-white rounded-2xl shadow-sm border-none overflow-hidden">
                {loading ? (
                    /* Skeleton Loading State matching modern requirements */
                    <div className="p-8 space-y-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex gap-4 animate-pulse">
                                <div className="h-10 bg-slate-100 rounded-xl w-1/4"></div>
                                <div className="h-10 bg-slate-100 rounded-xl w-2/4"></div>
                                <div className="h-10 bg-slate-100 rounded-xl w-1/4"></div>
                            </div>
                        ))}
                    </div>
                ) : applicants.length === 0 ? (
                    /* Clean Empty State with Document Icon */
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <Inbox size={48} className="text-slate-300 mb-4" />
                        <h4 className="text-slate-700 font-bold text-sm">Tidak ada data pendaftar yang cocok.</h4>
                        <p className="text-slate-400 text-xs mt-1 leading-relaxed">Coba ubah kata kunci pencarian atau filter status untuk menemukan data.</p>
                    </div>
                ) : (
                    <div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 text-[10px] text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100">
                                        <th className="p-4 pl-6">No. Reg</th>
                                        <th className="p-4">Nama Siswa</th>
                                        <th className="p-4">Program</th>
                                        <th className="p-4">Orang Tua</th>
                                        <th className="p-4">Tanggal Daftar</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4 pr-6 text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-xs">
                                    {applicants.map((app) => {
                                        const parents = getParentsData(app.parents);
                                        return (
                                            <tr key={app.id} className="hover:bg-slate-50/40 transition-colors">
                                                <td className="p-4 pl-6 font-bold tracking-wide text-slate-700">{app.registration_number}</td>
                                                <td className="p-4">
                                                    <div>
                                                        <span className="font-extrabold text-slate-800 text-sm block">{app.full_name}</span>
                                                        <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
                                                            {app.gender === 'L' ? 'Laki-Laki' : 'Perempuan'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <span className="px-2 py-0.5 border border-slate-150 text-[10px] font-bold bg-slate-50 text-slate-600 rounded-lg">
                                                        {app.program?.code || 'KB'}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <div>
                                                        <span className="font-bold text-slate-800 block">{parents.mother}</span>
                                                        <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Ayah: {parents.father}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-slate-500 font-medium">{formatDate(app.created_at)}</td>
                                                <td className="p-4">
                                                    {renderStatusBadge(app.status)}
                                                </td>
                                                <td className="p-4 pr-6 text-center">
                                                    <div className="flex gap-2 justify-center items-center">
                                                        {/* Eye Button inside small round pastel-blue */}
                                                        <Link
                                                            to="/admin/verifikasi"
                                                            state={{ selectedId: app.id }}
                                                            className="w-7 h-7 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center hover:bg-sky-100 transition shadow-xs cursor-pointer border-none"
                                                            title="Verifikasi"
                                                        >
                                                            <Eye size={14} />
                                                        </Link>
                                                        {/* Trash Button inside small round pastel-red */}
                                                        <button
                                                            onClick={() => setDeleteId(app.id)}
                                                            className="w-7 h-7 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center hover:bg-rose-100 transition shadow-xs cursor-pointer border-none"
                                                            title="Hapus"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {lastPage > 1 && (
                            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-xs">
                                <button
                                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                                    disabled={page === 1}
                                    className="px-4 py-2 border border-slate-200 bg-white rounded-xl shadow-xs hover:bg-slate-50 disabled:opacity-50 transition cursor-pointer font-bold"
                                >
                                    Sebelumnya
                                </button>
                                <span className="text-slate-500 font-bold">Halaman {page} dari {lastPage}</span>
                                <button
                                    onClick={() => setPage((p) => Math.min(p + 1, lastPage))}
                                    disabled={page === lastPage}
                                    className="px-4 py-2 border border-slate-200 bg-white rounded-xl shadow-xs hover:bg-slate-50 disabled:opacity-50 transition cursor-pointer font-bold"
                                >
                                    Berikutnya
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {deleteId !== null && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-xl text-center space-y-4 border-none">
                        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-2">
                            <AlertTriangle size={24} />
                        </div>
                        <h3 className="text-base sm:text-lg font-bold text-slate-800">Konfirmasi Hapus Data</h3>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            Apakah Anda yakin ingin menghapus data pendaftar ini? Tindakan ini bersifat permanen dan tidak dapat dibatalkan.
                        </p>
                        
                        <div className="flex gap-4 pt-4 border-t border-slate-100">
                            <button
                                onClick={() => setDeleteId(null)}
                                disabled={deleting}
                                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-250 text-slate-700 font-bold rounded-xl text-xs transition border-none cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleDeleteConfirm}
                                disabled={deleting}
                                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 border-none cursor-pointer"
                            >
                                {deleting ? (
                                    <>
                                        <Loader2 size={12} className="animate-spin" />
                                        <span>Menghapus...</span>
                                    </>
                                ) : (
                                    <span>Hapus</span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
