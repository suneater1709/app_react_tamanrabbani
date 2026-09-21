import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { adminApi } from '../../services/api';
import { scrollToTop } from '../../lib/utils';
import { 
    Search, Eye, CheckCircle, RefreshCcw, AlertTriangle, FileCheck, FileText, 
    User, Users, Calendar, Download, ShieldCheck, HelpCircle, Clock, X, 
    ExternalLink, Loader2, ArrowLeft, Receipt, Wallet, ZoomIn, ZoomOut, 
    RotateCcw, FileQuestion, CheckCircle2, AlertCircle
} from 'lucide-react';

interface Program {
    name: string;
    code: string;
}

interface Parent {
    id: number;
    type: 'father' | 'mother' | 'guardian';
    name: string;
    occupation: string | null;
    education: string | null;
    phone: string | null;
    email: string | null;
    income: string | null;
}

interface Document {
    id: number;
    document_type: 'birth_certificate' | 'family_card' | 'photo' | 'payment_receipt';
    file_path: string;
}

interface StatusLog {
    id: number;
    old_status: string;
    new_status: string;
    notes: string | null;
    created_at: string;
    changed_by_user: { name: string } | null;
}

interface Dossier {
    id: number;
    registration_number: string;
    full_name: string;
    nickname: string;
    nik: string;
    gender: 'L' | 'P';
    birth_place: string;
    birth_date: string;
    religion: string;
    address: string;
    previous_school: string | null;
    status: 'pending' | 'revision' | 'accepted' | 'rejected';
    verifier_notes: string | null;
    created_at: string;
    program: Program;
    parents: Parent[];
    documents: Document[];
    status_logs: StatusLog[];
    entry_fee?: number | null;
    form_fee?: number | null;
    discount_amount?: number | null;
    total_transfer_amount?: number | null;
    wave_name?: string | null;
    payment_breakdown?: any;
}

interface ApplicantSummary {
    id: number;
    registration_number: string;
    full_name: string;
    status: string;
}

const REQUIRED_DOC_TYPES = [
    { type: 'birth_certificate', label: 'Akta Kelahiran' },
    { type: 'family_card', label: 'Kartu Keluarga' },
    { type: 'photo', label: 'Pas Foto' },
    { type: 'payment_receipt', label: 'Bukti Pembayaran' },
] as const;

export default function Verification() {
    const location = useLocation();
    const navigate = useNavigate();

    const handleBack = () => {
        if (window.history.length > 1) {
            navigate(-1);
        } else {
            navigate('/admin/pendaftar');
        }
    };
    
    // List state
    const [applicants, setApplicants] = useState<ApplicantSummary[]>([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [listLoading, setListLoading] = useState(true);

    // Selected dossier details
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [dossier, setDossier] = useState<Dossier | null>(null);
    const [dossierLoading, setDossierLoading] = useState(false);

    // Verification action form inputs
    const [actionStatus, setActionStatus] = useState<string>('pending');
    const [actionNotes, setActionNotes] = useState<string>('');
    const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
    const [actionErrorMsg, setActionErrorMsg] = useState<string | null>(null);
    const [actionSubmitting, setActionSubmitting] = useState(false);

    // Document Preview Modal State
    const [previewDoc, setPreviewDoc] = useState<{
        id: number;
        title: string;
        url: string;
        isPdf: boolean;
        fileName: string;
    } | null>(null);
    const [previewLoadingId, setPreviewLoadingId] = useState<number | null>(null);
    const [previewError, setPreviewError] = useState<string | null>(null);
    const [zoomScale, setZoomScale] = useState<number>(1);

    const handlePreviewDocument = async (doc: Document) => {
        setPreviewLoadingId(doc.id);
        setPreviewError(null);

        try {
            const blob = await adminApi.getDocumentBlob(doc.id);
            const isPdf = blob.type.includes('pdf') || doc.file_path.toLowerCase().endsWith('.pdf');
            const url = URL.createObjectURL(blob);
            const fileName = doc.file_path.split('/').pop() || 'dokumen';

            setZoomScale(1);
            setPreviewDoc({
                id: doc.id,
                title: getDocLabel(doc.document_type),
                url,
                isPdf,
                fileName,
            });
        } catch (err: any) {
            console.error('Gagal memuat dokumen:', err);
            let message = 'Gagal memuat berkas dokumen. Pastikan file ada di server dan Anda memiliki akses admin.';
            
            // Extract error message from blob error response if applicable
            if (err.response?.data instanceof Blob) {
                try {
                    const text = await err.response.data.text();
                    const json = JSON.parse(text);
                    if (json.message) message = json.message;
                } catch {
                    // ignore JSON parse error
                }
            } else if (err.response?.data?.message) {
                message = err.response.data.message;
            }

            setPreviewError(message);
            setTimeout(() => setPreviewError(null), 6000);
        } finally {
            setPreviewLoadingId(null);
        }
    };

    const handleClosePreview = () => {
        if (previewDoc?.url) {
            URL.revokeObjectURL(previewDoc.url);
        }
        setPreviewDoc(null);
        setZoomScale(1);
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && previewDoc) {
                handleClosePreview();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [previewDoc]);

    // Initial load from list or state redirect
    useEffect(() => {
        const stateSelectedId = location.state?.selectedId;
        if (stateSelectedId) {
            setSelectedId(Number(stateSelectedId));
        }
    }, [location.state]);

    // Lock background body scroll when preview modal is open
    useEffect(() => {
        if (previewDoc) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [previewDoc]);

    // Fetch left-side list
    const fetchList = () => {
        setListLoading(true);
        adminApi.getApplicants({ search, status: statusFilter, per_page: 50 })
            .then((res) => {
                if (res.success) {
                    const dataList = res.data.data || [];
                    setApplicants(dataList);
                    // Automatically select first item if none is selected
                    if (dataList.length > 0 && !selectedId) {
                        setSelectedId(dataList[0].id);
                    }
                }
            })
            .catch((err) => console.error(err))
            .finally(() => setListLoading(false));
    };

    useEffect(() => {
        fetchList();
    }, [search, statusFilter]);

    // Fetch dossier details when selectedId changes
    useEffect(() => {
        if (!selectedId) return;
        setDossierLoading(true);
        setActionSuccessMsg(null);
        setActionErrorMsg(null);
        setPreviewError(null);

        adminApi.getApplicantDetail(selectedId)
            .then((res) => {
                if (res.success) {
                    setDossier(res.data);
                    setActionStatus(res.data.status);
                    setActionNotes(res.data.verifier_notes || '');
                }
            })
            .catch((err) => console.error(err))
            .finally(() => setDossierLoading(false));
    }, [selectedId]);

    const handleActionSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedId || !dossier) return;

        if (actionNotes.trim().length < 5) {
            setActionErrorMsg('Catatan verifikasi minimal berisi 5 karakter.');
            return;
        }

        setActionSubmitting(true);
        setActionSuccessMsg(null);
        setActionErrorMsg(null);

        adminApi.updateApplicantStatus(selectedId, actionStatus, actionNotes)
            .then((res) => {
                if (res.success) {
                    setActionSuccessMsg('Status berkas berhasil diperbarui.');
                    // Refresh current dossier details
                    setDossier((d) => d ? { ...d, status: actionStatus as any, verifier_notes: actionNotes } : null);
                    // Refresh left side list to reflect new status
                    fetchList();
                    // Refetch dossier to load the new status history logs
                    adminApi.getApplicantDetail(selectedId).then((r) => {
                        if (r.success) setDossier(r.data);
                    });
                    scrollToTop();
                }
            })
            .catch((err) => {
                console.error(err);
                if (err.response?.data?.message) {
                    setActionErrorMsg(err.response.data.message);
                } else {
                    setActionErrorMsg('Terjadi kesalahan server saat memperbarui status.');
                }
                scrollToTop();
            })
            .finally(() => setActionSubmitting(false));
    };

    // Helper: Map status labels
    const getStatusBadge = (status: string) => {
        if (status === 'accepted') return 'bg-emerald-100 text-emerald-800 border-emerald-300';
        if (status === 'rejected') return 'bg-rose-100 text-rose-800 border-rose-300';
        if (status === 'revision') return 'bg-purple-100 text-purple-800 border-purple-300';
        return 'bg-amber-100 text-amber-800 border-amber-300';
    };

    const getStatusText = (status: string) => {
        if (status === 'accepted') return 'Diterima';
        if (status === 'rejected') return 'Ditolak';
        if (status === 'revision') return 'Revisi';
        return 'Pending';
    };

    const getDocLabel = (type: string) => {
        if (type === 'birth_certificate') return 'Akta Kelahiran';
        if (type === 'family_card') return 'Kartu Keluarga';
        if (type === 'photo') return 'Pas Foto';
        if (type === 'payment_receipt') return 'Bukti Pembayaran';
        return type;
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 w-full lg:h-[calc(100vh-130px)] items-stretch text-left">
            {/* LEFT PANEL: Applicant List */}
            <aside className="w-full lg:w-80 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col flex-shrink-0 overflow-hidden h-[420px] lg:h-full">
                {/* Search / Filter box */}
                <div className="p-4 border-b border-slate-100 space-y-3 bg-slate-50/50">
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                            <Search size={14} />
                        </span>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-teal-500/20 focus:border-teal-500 bg-white"
                            placeholder="Cari nama, NIK..."
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-600 bg-white focus:ring-1 focus:ring-teal-500/20 focus:border-teal-500 cursor-pointer"
                    >
                        <option value="all">Semua Status</option>
                        <option value="pending">Pending</option>
                        <option value="revision">Revisi</option>
                        <option value="rejected">Ditolak</option>
                        <option value="accepted">Diterima</option>
                    </select>
                </div>

                {/* List items */}
                <div className="flex-1 overflow-y-auto no-scrollbar divide-y divide-slate-100">
                    {listLoading ? (
                        <div className="text-center py-8 text-xs text-slate-400">Memuat berkas...</div>
                    ) : applicants.length === 0 ? (
                        <div className="text-center py-8 text-xs text-slate-400">Tidak ada pendaftar.</div>
                    ) : (
                        applicants.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setSelectedId(item.id)}
                                className={`w-full text-left p-4 transition-colors flex flex-col gap-1.5 cursor-pointer ${
                                    selectedId === item.id ? 'bg-teal-50/60 border-l-4 border-teal-600' : 'hover:bg-slate-50/70'
                                }`}
                            >
                                <div className="flex justify-between items-center w-full">
                                    <span className="text-xxs font-bold text-slate-400 tracking-wider font-mono">{item.registration_number}</span>
                                    <span className={`px-2 py-0.5 text-xxs font-extrabold uppercase rounded-full border ${getStatusBadge(item.status)}`}>
                                        {getStatusText(item.status)}
                                    </span>
                                </div>
                                <h4 className="font-semibold text-slate-800 text-xs sm:text-sm truncate w-full">{item.full_name}</h4>
                            </button>
                        ))
                    )}
                </div>
            </aside>

            {/* RIGHT PANEL: Dossier Details & Actions */}
            <div className="flex-1 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 sm:p-8 overflow-y-auto no-scrollbar lg:h-full flex flex-col justify-between">
                {dossierLoading ? (
                    <div className="flex flex-col items-center justify-center h-64 lg:h-full gap-4">
                        <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-slate-500 text-sm font-medium">Memuat berkas dossier siswa...</p>
                    </div>
                ) : !dossier ? (
                    <div className="flex flex-col items-center justify-center h-64 lg:h-full text-slate-400">
                        <HelpCircle size={48} className="mb-2 text-slate-300" />
                        <p className="text-sm">Silakan pilih berkas pendaftar di panel sebelah kiri.</p>
                    </div>
                ) : (
                    <div className="space-y-6 w-full pb-6">
                        {/* Inline Document Error Notification */}
                        {previewError && (
                            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-2xl flex items-center justify-between gap-3 shadow-xs animate-in fade-in duration-200">
                                <div className="flex items-center gap-2">
                                    <AlertCircle size={16} className="text-rose-600 flex-shrink-0" />
                                    <span>{previewError}</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setPreviewError(null)}
                                    className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        )}

                        {/* Title Header */}
                        <div className="bg-slate-50/60 rounded-xl border border-slate-200/80 p-5 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="flex items-start gap-4">
                                <button
                                    type="button"
                                    onClick={handleBack}
                                    className="p-2 mt-0.5 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition shadow-2xs flex items-center justify-center cursor-pointer"
                                    title="Kembali ke halaman sebelumnya"
                                >
                                    <ArrowLeft size={16} />
                                </button>
                                <div>
                                    <span className="text-xxs font-bold text-slate-400 tracking-widest font-mono uppercase">Berkas Calon Siswa</span>
                                    <h2 className="text-xl sm:text-2xl font-display font-bold text-slate-800">{dossier.full_name} {dossier.nickname ? `(${dossier.nickname})` : ''}</h2>
                                    <span className="text-xs text-slate-500 font-semibold">{dossier.program.name}</span>
                                </div>
                            </div>
                            <span className={`px-3 py-1.5 text-xs font-extrabold uppercase rounded-full border ${getStatusBadge(dossier.status)}`}>
                                Status: {getStatusText(dossier.status)}
                            </span>
                        </div>

                        {/* Split info panels */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* A. Personal Details Card */}
                            <div className="bg-slate-50/40 rounded-xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs">
                                <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-200 pb-2">
                                    <User size={16} className="text-teal-600" /> Profil Siswa
                                </h3>
                                <div className="space-y-2.5 text-xs leading-relaxed text-slate-600">
                                    <p><strong>NIK:</strong> <span className="font-mono">{dossier.nik}</span></p>
                                    <p><strong>Jenis Kelamin:</strong> {dossier.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</p>
                                    <p><strong>Tempat, Tgl Lahir:</strong> {dossier.birth_place}, {new Date(dossier.birth_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                    <p><strong>Agama:</strong> {dossier.religion}</p>
                                    <p><strong>Asal Sekolah Sebelumnya:</strong> {dossier.previous_school || '-'}</p>
                                    <p><strong>Alamat Rumah:</strong> {dossier.address}</p>
                                </div>
                            </div>

                            {/* B. Parents Profiles Card */}
                            <div className="bg-slate-50/40 rounded-xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs">
                                <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-200 pb-2">
                                    <Users size={16} className="text-teal-600" /> Kontak Orang Tua
                                </h3>
                                <div className="space-y-3">
                                    {dossier.parents.map((p) => (
                                        <div key={p.id} className="text-xs leading-relaxed text-slate-600">
                                            <h4 className="font-bold text-slate-800 capitalize mb-1">{p.type === 'father' ? 'Ayah' : p.type === 'mother' ? 'Ibu' : 'Wali'}</h4>
                                            <p className="pl-3">Nama: {p.name}</p>
                                            <p className="pl-3">Pekerjaan: {p.occupation || '-'}</p>
                                            <p className="pl-3">Pendidikan: {p.education || '-'}</p>
                                            <p className="pl-3">Telepon: {p.phone || '-'}</p>
                                            <p className="pl-3">Email: {p.email || '-'}</p>
                                            <p className="pl-3">Penghasilan: {p.income || '-'}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* C. Payment Breakdown Snapshot Card */}
                        {(() => {
                            const isKb = dossier.program?.code === 'KB' || dossier.program?.name?.toLowerCase().includes('bermain');
                            const defaultEntry = isKb ? 2800000 : 3950000;
                            const entryFee = Number(dossier.entry_fee || dossier.payment_breakdown?.entry_fee || defaultEntry);
                            const formFee = Number(dossier.form_fee || dossier.payment_breakdown?.form_fee || 100000);
                            const discountAmount = Number(dossier.discount_amount || dossier.payment_breakdown?.discount_amount || (dossier.wave_name?.includes('3') ? 0 : 400000));
                            const totalTransfer = Number(dossier.total_transfer_amount || dossier.payment_breakdown?.total_transfer_amount || (entryFee + formFee - discountAmount));
                            const waveName = dossier.wave_name || dossier.payment_breakdown?.wave_name || 'Gelombang 1 (Early Bird)';

                            return (
                                <div className="bg-slate-50/40 rounded-xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs">
                                    <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center justify-between border-b border-slate-200 pb-2">
                                        <span className="flex items-center gap-2">
                                            <Receipt size={16} className="text-teal-600" /> Rincian Tagihan Pembayaran PPDB
                                        </span>
                                        <span className="text-xxs font-bold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200/60">
                                            {waveName}
                                        </span>
                                    </h3>
                                    <div className="bg-white rounded-xl p-4 border border-slate-200 text-xs space-y-2">
                                        <div className="flex justify-between items-center text-slate-600">
                                            <span>+ Biaya Masuk ({dossier.program?.name || 'Jenjang'}):</span>
                                            <span className="font-semibold text-slate-800">
                                                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(entryFee)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-slate-600">
                                            <span>+ Biaya Form Pendaftaran:</span>
                                            <span className="font-semibold text-slate-800">
                                                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(formFee)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-emerald-700">
                                            <span>− Diskon Potongan Uang Pangkal ({waveName}):</span>
                                            <span className="font-semibold">
                                                − {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(discountAmount)}
                                            </span>
                                        </div>
                                        <div className="pt-2.5 border-t border-slate-100 flex justify-between items-center">
                                            <span className="font-extrabold uppercase text-slate-800 text-xs">Total Transfer Wajib:</span>
                                            <span className="text-base font-black text-teal-700 font-mono">
                                                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(totalTransfer)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}

                        {/* D. Clickable Documents Upload Card with 4 Complete Slots */}
                        <div className="bg-slate-50/40 rounded-xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs">
                            <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-200 pb-2">
                                <FileText size={16} className="text-teal-600" /> Berkas Dokumen Pendukung
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {REQUIRED_DOC_TYPES.map((req) => {
                                    const doc = dossier.documents.find((d) => d.document_type === req.type);
                                    if (!doc) {
                                        return (
                                            <div
                                                key={req.type}
                                                className="p-4 border border-dashed border-slate-200 rounded-xl bg-slate-50/60 flex items-center gap-3 text-xs text-slate-400"
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-slate-200/70 text-slate-400 flex items-center justify-center flex-shrink-0">
                                                    <FileQuestion size={16} />
                                                </div>
                                                <div className="truncate flex-1">
                                                    <span className="block font-bold text-slate-500">{req.label}</span>
                                                    <span className="block text-[11px] text-slate-400 font-medium mt-0.5">
                                                        Belum diunggah
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    }

                                    const isLoadingThis = previewLoadingId === doc.id;
                                    return (
                                        <button
                                            key={doc.id}
                                            type="button"
                                            onClick={() => handlePreviewDocument(doc)}
                                            disabled={isLoadingThis}
                                            className="p-4 border border-slate-200 hover:border-teal-500 hover:bg-teal-50/40 rounded-xl bg-white flex items-center gap-3 transition-all text-xs font-semibold text-slate-700 text-left group shadow-2xs cursor-pointer w-full"
                                        >
                                            {isLoadingThis ? (
                                                <Loader2 className="text-teal-600 animate-spin flex-shrink-0" size={18} />
                                            ) : (
                                                <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                                                    <Eye size={16} />
                                                </div>
                                            )}
                                            <div className="truncate flex-1">
                                                <span className="block font-bold text-slate-800 group-hover:text-teal-700 transition-colors">{getDocLabel(doc.document_type)}</span>
                                                <span className="block text-[11px] text-teal-600 font-medium truncate mt-0.5">
                                                    {isLoadingThis ? 'Memuat berkas...' : 'Lihat Berkas (Preview)'}
                                                </span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* E. Verification Actions Form */}
                        <div className="bg-slate-50/40 rounded-xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs">
                            <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-200 pb-2">
                                <FileCheck size={16} className="text-teal-600" /> Evaluasi & Verifikasi Berkas
                            </h3>
                            <form onSubmit={handleActionSubmit} className="space-y-4">
                                {actionSuccessMsg && (
                                    <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-xl">
                                        {actionSuccessMsg}
                                    </div>
                                )}
                                {actionErrorMsg && (
                                    <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl">
                                        {actionErrorMsg}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Tentukan Keputusan *</label>
                                        <select
                                            value={actionStatus}
                                            onChange={(e) => setActionStatus(e.target.value)}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm bg-white focus:outline-none focus:ring-1 focus:ring-teal-500 disabled:bg-slate-100 disabled:text-slate-500"
                                            disabled={dossier.status === 'accepted'}
                                        >
                                            <option value="pending">Belum Diproses (Pending)</option>
                                            <option value="revision">Kembalikan untuk Revisi Berkas</option>
                                            <option value="rejected">Tolak Pendaftaran (Ditolak)</option>
                                            <option value="accepted">Terima Pendaftaran</option>
                                        </select>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Catatan Verifikator *</label>
                                        <textarea
                                            rows={2}
                                            value={actionNotes}
                                            onChange={(e) => setActionNotes(e.target.value)}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 disabled:bg-slate-100 disabled:text-slate-500"
                                            placeholder="Masukkan catatan alasan keputusan verifikasi..."
                                            disabled={dossier.status === 'accepted'}
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end pt-2">
                                    {dossier.status === 'accepted' ? (
                                        <div className="px-5 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs">
                                            <CheckCircle size={14} /> ✅ Sudah Diterima — Keputusan Final
                                        </div>
                                    ) : (
                                        <button
                                            type="submit"
                                            disabled={actionSubmitting}
                                            className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-xl transition flex items-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
                                        >
                                            <ShieldCheck size={14} /> Simpan Keputusan
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>

                        {/* F. History Timeline Log list */}
                        <div className="bg-slate-50/40 rounded-xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs">
                            <h3 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-200 pb-2">
                                <Clock size={16} className="text-teal-600" /> Riwayat Perubahan Berkas
                            </h3>
                            <div className="relative border-l border-slate-200 ml-4 space-y-6">
                                {dossier.status_logs.map((log) => (
                                    <div key={log.id} className="relative pl-8">
                                        <div className="absolute left-0 -translate-x-[9px] top-1 w-4.5 h-4.5 rounded-full border-2 border-slate-350 bg-white" />
                                        <div>
                                            <div className="flex justify-between text-xxs text-slate-400 mb-0.5 font-semibold">
                                                <span>{log.changed_by_user ? `Oleh: ${log.changed_by_user.name}` : 'Sistem'}</span>
                                                <span>{new Date(log.created_at).toLocaleString('id-ID')}</span>
                                            </div>
                                            <h4 className="font-bold text-slate-800 text-xs uppercase">
                                                Status: {getStatusText(log.new_status)}
                                            </h4>
                                            {log.notes && <p className="text-xs text-slate-500 italic mt-0.5">"{log.notes}"</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Interactive Document Preview Modal with Zoom & Download */}
            {previewDoc && dossier && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-3 sm:p-6 animate-in fade-in duration-200"
                    onClick={handleClosePreview}
                >
                    <div 
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 flex-wrap gap-3">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
                                    <FileText size={18} />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                                        {previewDoc.title}
                                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-teal-400 font-semibold border border-slate-700">
                                            {previewDoc.isPdf ? 'PDF' : 'Gambar'}
                                        </span>
                                    </h3>
                                    <p className="text-xs text-slate-400">
                                        Pendaftar: <span className="text-white font-medium">{dossier.full_name} ({dossier.registration_number})</span>
                                    </p>
                                </div>
                            </div>

                            {/* Actions & Zoom Controls */}
                            <div className="flex items-center gap-2">
                                {!previewDoc.isPdf && (
                                    <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700 mr-2">
                                        <button
                                            type="button"
                                            onClick={() => setZoomScale((s) => Math.max(0.5, s - 0.25))}
                                            className="p-1.5 hover:bg-slate-700 rounded text-slate-300 hover:text-white transition cursor-pointer"
                                            title="Perkecil"
                                        >
                                            <ZoomOut size={14} />
                                        </button>
                                        <span className="text-xxs font-mono text-slate-300 px-1 font-bold min-w-[36px] text-center">
                                            {Math.round(zoomScale * 100)}%
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => setZoomScale((s) => Math.min(3, s + 0.25))}
                                            className="p-1.5 hover:bg-slate-700 rounded text-slate-300 hover:text-white transition cursor-pointer"
                                            title="Perbesar"
                                        >
                                            <ZoomIn size={14} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setZoomScale(1)}
                                            className="p-1.5 hover:bg-slate-700 rounded text-slate-300 hover:text-white transition cursor-pointer"
                                            title="Reset Ukuran"
                                        >
                                            <RotateCcw size={14} />
                                        </button>
                                    </div>
                                )}

                                <a
                                    href={previewDoc.url}
                                    download={previewDoc.fileName}
                                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                                    title="Unduh File"
                                >
                                    <Download size={14} />
                                    <span className="hidden sm:inline">Unduh</span>
                                </a>
                                <a
                                    href={previewDoc.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                                    title="Buka di Tab Baru"
                                >
                                    <ExternalLink size={14} />
                                    <span className="hidden sm:inline">Tab Baru</span>
                                </a>
                                <button
                                    type="button"
                                    onClick={handleClosePreview}
                                    className="w-8 h-8 rounded-lg bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white flex items-center justify-center transition-colors ml-2 cursor-pointer"
                                    title="Tutup (Esc)"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Modal Body: iframe for PDF, img with zoom for Images */}
                        <div className="flex-1 bg-slate-100 p-3 sm:p-4 overflow-auto flex items-center justify-center min-h-[400px] max-h-[75vh]">
                            {previewDoc.isPdf ? (
                                <iframe
                                    src={previewDoc.url}
                                    className="w-full h-full min-h-[70vh] rounded-xl border border-slate-300 bg-white shadow-inner"
                                    title={`Preview ${previewDoc.title}`}
                                />
                            ) : (
                                <div className="flex items-center justify-center w-full h-full p-4 overflow-auto">
                                    <img
                                        src={previewDoc.url}
                                        alt={previewDoc.title}
                                        style={{ transform: `scale(${zoomScale})`, transformOrigin: 'center center', transition: 'transform 0.15s ease' }}
                                        className="max-w-full max-h-[70vh] object-contain rounded-xl shadow-md bg-white border border-slate-200"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-3 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                            <span>Nama File: <strong className="text-slate-700 font-mono">{previewDoc.fileName}</strong></span>
                            <span className="text-slate-400">Tekan <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-xxs font-mono">ESC</kbd> untuk menutup</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
