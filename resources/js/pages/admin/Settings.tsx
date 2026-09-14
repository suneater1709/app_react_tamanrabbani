import React, { useEffect, useState } from 'react';
import { 
    ShieldCheck, Plus, UserPlus, Image, HelpCircle, Loader2, 
    Save, Trash2, Edit, Calendar, Sparkles, CheckCircle2, 
    Tag, FileText, Check, AlertCircle, Eye, RefreshCw
} from 'lucide-react';
import axios from 'axios';
import { adminApi } from '../../services/api';
import { scrollToTop } from '../../lib/utils';

interface AdminUser {
    id: number;
    name: string;
    email: string;
    roles: { name: string }[];
}

interface WaveItem {
    id?: string;
    name: string;
    period: string;
    badge?: string;
    note?: string;
    is_active?: boolean;
}

export default function Settings() {
    // Current User checks
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);
    const [activeTab, setActiveTab] = useState<'ppdb' | 'branding' | 'admins'>('ppdb');

    // Section 1: PPDB Dates & Waves Settings
    const [ppdbBadgeText, setPpdbBadgeText] = useState('Penerimaan Murid Baru (PPDB) 2026/2027 Dibuka!');
    const [ppdbAcademicYear, setPpdbAcademicYear] = useState('2026/2027');
    const [ppdbIsOpen, setPpdbIsOpen] = useState(true);
    const [ppdbFormFee, setPpdbFormFee] = useState('Rp 100.000');
    const [ppdbWaves, setPpdbWaves] = useState<WaveItem[]>([
        {
            id: '1',
            name: 'Gelombang 1 (Early Bird)',
            period: 'Juli s.d September 2026',
            badge: 'Diskon Rp 400.000',
            note: '* Potongan Uang Pangkal Sebesar Rp 400.000!',
            is_active: true,
        },
        {
            id: '2',
            name: 'Gelombang 2 (Reguler)',
            period: 'Oktober s.d Desember 2026',
            badge: '',
            note: '',
            is_active: false,
        },
        {
            id: '3',
            name: 'Gelombang 3 (Sisa Kuota)',
            period: 'Januari s.d Juni 2027',
            badge: '',
            note: '* Dibuka apabila kuota kelas masih tersedia.',
            is_active: false,
        }
    ]);
    const [loadingPpdb, setLoadingPpdb] = useState(true);
    const [savingPpdb, setSavingPpdb] = useState(false);
    const [ppdbSuccessMsg, setPpdbSuccessMsg] = useState<string | null>(null);
    const [ppdbErrorMsg, setPpdbErrorMsg] = useState<string | null>(null);

    // Section 2: Unified logo setting state
    const [schoolLogo, setSchoolLogo] = useState('');
    const [fileLogo, setFileLogo] = useState<File | null>(null);
    const [previewLogo, setPreviewLogo] = useState('');
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [logoSuccessMsg, setLogoSuccessMsg] = useState<string | null>(null);
    const [logoErrorMsg, setLogoErrorMsg] = useState<string | null>(null);

    // Section 3: Admin list & form state
    const [admins, setAdmins] = useState<AdminUser[]>([]);
    const [loadingAdmins, setLoadingAdmins] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    
    // Modal Form Fields
    const [formName, setFormName] = useState('');
    const [formEmail, setFormEmail] = useState('');
    const [formPassword, setFormPassword] = useState('');
    const [formRole, setFormRole] = useState('admin');
    const [formError, setFormError] = useState<string | null>(null);
    const [savingAdmin, setSavingAdmin] = useState(false);
    
    // Delete validation
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [deletingAdmin, setDeletingAdmin] = useState(false);

    // Load active credentials & data
    useEffect(() => {
        const storedUser = localStorage.getItem('admin_user');
        if (storedUser) {
            const parsed = JSON.parse(storedUser);
            setCurrentUser(parsed);
            if (parsed.roles?.includes('super_admin')) {
                setIsSuperAdmin(true);
            }
        }
        fetchPpdbSettings();
        fetchLogos();
        fetchAdmins();
    }, []);

    // 1. Fetch PPDB Settings
    const fetchPpdbSettings = () => {
        setLoadingPpdb(true);
        adminApi.getPpdbSettings()
            .then((res: any) => {
                if (res.success && res.data) {
                    setPpdbBadgeText(res.data.ppdb_badge_text || 'Penerimaan Murid Baru (PPDB) 2026/2027 Dibuka!');
                    setPpdbAcademicYear(res.data.ppdb_academic_year || '2026/2027');
                    setPpdbIsOpen(res.data.ppdb_is_open ?? true);
                    setPpdbFormFee(res.data.ppdb_form_fee || 'Rp 100.000');
                    if (res.data.ppdb_waves && Array.isArray(res.data.ppdb_waves) && res.data.ppdb_waves.length > 0) {
                        setPpdbWaves(res.data.ppdb_waves);
                    }
                }
            })
            .catch(err => console.error(err))
            .finally(() => setLoadingPpdb(false));
    };

    // Save PPDB Settings
    const handleSavePpdb = async (e: React.FormEvent) => {
        e.preventDefault();
        setSavingPpdb(true);
        setPpdbSuccessMsg(null);
        setPpdbErrorMsg(null);

        try {
            const payload = {
                ppdb_badge_text: ppdbBadgeText,
                ppdb_academic_year: ppdbAcademicYear,
                ppdb_is_open: ppdbIsOpen,
                ppdb_form_fee: ppdbFormFee,
                ppdb_waves: ppdbWaves,
            };
            const res = await adminApi.updatePpdbSettings(payload);
            if (res.success) {
                setPpdbSuccessMsg('Pengaturan jadwal & gelombang PPDB berhasil disimpan! Perubahan otomatis tampil di Landing Page dan Halaman PPDB.');
                if (res.data?.ppdb_waves) {
                    setPpdbWaves(res.data.ppdb_waves);
                }
                scrollToTop();
                setTimeout(() => setPpdbSuccessMsg(null), 6000);
            }
        } catch (err: any) {
            setPpdbErrorMsg(err.response?.data?.message || 'Gagal menyimpan pengaturan PPDB.');
            scrollToTop();
        } finally {
            setSavingPpdb(false);
        }
    };

    // Wave Array Management
    const handleAddWave = () => {
        const nextIdx = ppdbWaves.length + 1;
        setPpdbWaves([
            ...ppdbWaves,
            {
                id: Date.now().toString(),
                name: `Gelombang ${nextIdx} (Lanjutan)`,
                period: 'Bulan s.d Bulan 2027',
                badge: '',
                note: '',
                is_active: false,
            }
        ]);
    };

    const handleRemoveWave = (index: number) => {
        if (ppdbWaves.length <= 1) {
            alert('Minimal harus ada 1 gelombang pendaftaran.');
            return;
        }
        setPpdbWaves(ppdbWaves.filter((_, i) => i !== index));
    };

    const handleWaveChange = (index: number, field: keyof WaveItem, value: any) => {
        const next = [...ppdbWaves];
        next[index] = { ...next[index], [field]: value };
        setPpdbWaves(next);
    };

    const handleToggleWaveActive = (index: number) => {
        const next = ppdbWaves.map((w, i) => ({
            ...w,
            is_active: i === index ? !w.is_active : w.is_active
        }));
        setPpdbWaves(next);
    };

    // 2. Fetch Active Logo Settings
    const fetchLogos = () => {
        const token = localStorage.getItem('admin_token');
        axios.get('/api/v1/admin/settings/logos', {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then((res) => {
            if (res.data.success && res.data.data) {
                const logoUrl = res.data.data.school_logo || res.data.data.logo_landing || '';
                setSchoolLogo(logoUrl);
                setPreviewLogo(logoUrl);
            }
        })
        .catch((err) => console.error(err));
    };

    // Handle Unified Logo Upload Submit
    const handleSaveLogo = async () => {
        if (!fileLogo) return;

        setUploadingLogo(true);
        setLogoSuccessMsg(null);
        setLogoErrorMsg(null);

        const token = localStorage.getItem('admin_token');
        const payload = new FormData();
        payload.append('logo', fileLogo);

        try {
            const res = await axios.post('/api/v1/admin/settings/logos/upload', payload, {
                headers: { 
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            });
            if (res.data.success) {
                setLogoSuccessMsg('Logo sekolah berhasil diperbarui! Logo ini otomatis diterapkan di Landing Page, Sidebar Admin, dan Halaman Login Admin.');
                setFileLogo(null);
                fetchLogos();
                scrollToTop();
                setTimeout(() => setLogoSuccessMsg(null), 5000);
            }
        } catch (err: any) {
            console.error(err);
            setLogoErrorMsg(err.response?.data?.message || 'Gagal mengupload logo. Pastikan format PNG/JPG/SVG dan ukuran maks 2MB.');
            scrollToTop();
        } finally {
            setUploadingLogo(false);
        }
    };

    // Trigger file change preview helper
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        if (!file) return;

        setFileLogo(file);
        setPreviewLogo(URL.createObjectURL(file));
        setLogoSuccessMsg(null);
        setLogoErrorMsg(null);
    };

    // 3. Fetch Admin Lists
    const fetchAdmins = () => {
        setLoadingAdmins(true);
        const token = localStorage.getItem('admin_token');
        axios.get('/api/v1/admin/admins', {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then((res) => {
            if (res.data.success) {
                setAdmins(res.data.data || []);
            }
        })
        .catch((err) => console.error(err))
        .finally(() => setLoadingAdmins(false));
    };

    // Handle Admin creation / edits
    const handleAdminSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);

        if (!formName || !formEmail) {
            setFormError('Nama dan alamat email wajib diisi.');
            return;
        }

        if (!editId && !formPassword) {
            setFormError('Password wajib diisi untuk administrator baru.');
            return;
        }

        setSavingAdmin(true);
        const token = localStorage.getItem('admin_token');
        const payload = {
            name: formName,
            email: formEmail,
            password: formPassword || undefined,
            role: formRole,
        };

        try {
            let res;
            if (editId) {
                res = await axios.put(`/api/v1/admin/admins/${editId}`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                res = await axios.post('/api/v1/admin/admins', payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }

            if (res.data.success) {
                setShowModal(false);
                resetForm();
                fetchAdmins();
            }
        } catch (err: any) {
            console.error(err);
            if (err.response?.data?.errors) {
                const errors = Object.values(err.response.data.errors).flat().join(' ');
                setFormError(errors);
            } else {
                setFormError(err.response?.data?.message || 'Gagal menyimpan akun admin.');
            }
        } finally {
            setSavingAdmin(false);
        }
    };

    const handleEditClick = (admin: AdminUser) => {
        setEditId(admin.id);
        setFormName(admin.name);
        setFormEmail(admin.email);
        setFormRole(admin.roles[0]?.name || 'admin');
        setFormPassword('');
        setFormError(null);
        setShowModal(true);
    };

    const handleDeleteClick = async () => {
        if (!deleteId) return;
        setDeletingAdmin(true);
        const token = localStorage.getItem('admin_token');
        try {
            const res = await axios.delete(`/api/v1/admin/admins/${deleteId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setDeleteId(null);
                fetchAdmins();
            }
        } catch (err: any) {
            alert(err.response?.data?.message || 'Gagal menghapus admin.');
        } finally {
            setDeletingAdmin(false);
        }
    };

    const resetForm = () => {
        setEditId(null);
        setFormName('');
        setFormEmail('');
        setFormPassword('');
        setFormRole('admin');
        setFormError(null);
    };

    return (
        <div className="space-y-8 text-left font-sans">
            
            {/* Header Title */}
            <div>
                <h1 className="text-2xl font-black text-slate-800 tracking-tight">Pengaturan Sistem PPDB</h1>
                <p className="text-xs text-slate-500 mt-1">
                    Kelola jadwal gelombang pendaftaran, branding sekolah, dan hak akses administrator.
                </p>
            </div>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
                <button
                    onClick={() => setActiveTab('ppdb')}
                    className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer ${
                        activeTab === 'ppdb'
                            ? 'bg-teal-600 text-white shadow-sm'
                            : 'bg-white text-slate-600 hover:bg-slate-100'
                    }`}
                >
                    <Calendar size={16} />
                    <span>Jadwal & Gelombang PPDB</span>
                </button>

                <button
                    onClick={() => setActiveTab('branding')}
                    className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer ${
                        activeTab === 'branding'
                            ? 'bg-teal-600 text-white shadow-sm'
                            : 'bg-white text-slate-600 hover:bg-slate-100'
                    }`}
                >
                    <Image size={16} />
                    <span>Branding & Logo</span>
                </button>

                <button
                    onClick={() => setActiveTab('admins')}
                    className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer ${
                        activeTab === 'admins'
                            ? 'bg-teal-600 text-white shadow-sm'
                            : 'bg-white text-slate-600 hover:bg-slate-100'
                    }`}
                >
                    <ShieldCheck size={16} />
                    <span>Manajemen Admin</span>
                </button>
            </div>

            {/* TAB 1: PPDB DATES & WAVES */}
            {activeTab === 'ppdb' && (
                <form onSubmit={handleSavePpdb} className="space-y-8">
                    
                    {ppdbSuccessMsg && (
                        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-xs font-semibold animate-fadeIn">
                            <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                            <span>{ppdbSuccessMsg}</span>
                        </div>
                    )}

                    {ppdbErrorMsg && (
                        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-xs font-semibold animate-fadeIn">
                            <AlertCircle size={18} className="text-rose-600 shrink-0" />
                            <span>{ppdbErrorMsg}</span>
                        </div>
                    )}

                    {/* Section 1A: Banner Pengumuman & Konfigurasi Umum */}
                    <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 border-none space-y-6">
                        <div>
                            <h2 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
                                <Sparkles className="text-pink-500" size={20} />
                                <span>Banner Pengumuman & Status PPDB</span>
                            </h2>
                            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                                Teks banner ini langsung muncul di bagian paling atas Landing Page dan menentukan status penerimaan aktif.
                            </p>
                        </div>

                        {/* Live Preview of Landing Page Banner */}
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                            <div>
                                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Live Preview di Landing Page:</span>
                                <div className="inline-flex items-center gap-1.5 px-4 py-2 bg-pink-50 text-pink-700 text-xs font-bold rounded-full shadow-xs">
                                    <Sparkles size={14} className="text-pink-500" />
                                    <span>{ppdbBadgeText || 'Penerimaan Murid Baru (PPDB) 2026/2027 Dibuka!'}</span>
                                </div>
                            </div>

                            <span className="text-[11px] text-slate-400 italic">
                                * Otomatis terupdate di halaman utama
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Teks Banner Pengumuman (Landing Page) *
                                </label>
                                <input
                                    type="text"
                                    value={ppdbBadgeText}
                                    onChange={(e) => setPpdbBadgeText(e.target.value)}
                                    placeholder="Contoh: Penerimaan Murid Baru (PPDB) 2026/2027 Dibuka!"
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-teal-500 focus:outline-none"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Tahun Ajaran PPDB
                                </label>
                                <input
                                    type="text"
                                    value={ppdbAcademicYear}
                                    onChange={(e) => setPpdbAcademicYear(e.target.value)}
                                    placeholder="Contoh: 2026/2027"
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-teal-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Biaya Form Pendaftaran
                                </label>
                                <input
                                    type="text"
                                    value={ppdbFormFee}
                                    onChange={(e) => setPpdbFormFee(e.target.value)}
                                    placeholder="Contoh: Rp 100.000"
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-teal-500 focus:outline-none"
                                />
                                <span className="text-[10px] text-slate-400 mt-1 block">
                                    Ditampilkan pada Syarat & Ketentuan Dokumen serta Instruksi Transfer Step 5.
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Section 1B: Manajemen Gelombang Pendaftaran */}
                    <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 border-none space-y-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                            <div>
                                <h2 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
                                    <Calendar className="text-teal-650" size={20} />
                                    <span>Jadwal Gelombang Pendaftaran (PPDB)</span>
                                </h2>
                                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                                    Kelola daftar gelombang, rentang bulan, badge potongan diskon, dan catatan keterangan untuk calon wali murid.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={handleAddWave}
                                className="px-3.5 py-2 bg-teal-50 hover:bg-teal-100 text-teal-700 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition"
                            >
                                <Plus size={16} />
                                <span>Tambah Gelombang</span>
                            </button>
                        </div>

                        {/* List of Waves */}
                        <div className="space-y-4">
                            {ppdbWaves.map((wave, idx) => (
                                <div 
                                    key={wave.id || idx} 
                                    className={`p-5 rounded-2xl border transition-all ${
                                        wave.is_active 
                                            ? 'bg-teal-50/40 border-teal-300 ring-1 ring-teal-500/20' 
                                            : 'bg-slate-50/60 border-slate-200'
                                    }`}
                                >
                                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/70">
                                        <div className="flex items-center gap-2">
                                            <span className="w-6 h-6 rounded-full bg-teal-600 text-white text-xs font-black flex items-center justify-center">
                                                {idx + 1}
                                            </span>
                                            <span className="font-extrabold text-xs sm:text-sm text-slate-800">
                                                {wave.name || `Gelombang ${idx + 1}`}
                                            </span>
                                            {wave.is_active && (
                                                <span className="text-[10px] bg-teal-600 text-white font-bold px-2.5 py-0.5 rounded-full">
                                                    Sedang Aktif
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => handleToggleWaveActive(idx)}
                                                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                                                    wave.is_active
                                                        ? 'bg-teal-600 text-white'
                                                        : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                                                }`}
                                            >
                                                {wave.is_active ? 'Aktif' : 'Set Aktif'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveWave(idx)}
                                                className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                                                title="Hapus Gelombang"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                                                Nama Gelombang *
                                            </label>
                                            <input
                                                type="text"
                                                value={wave.name}
                                                onChange={(e) => handleWaveChange(idx, 'name', e.target.value)}
                                                placeholder="Contoh: Gelombang 1 (Early Bird)"
                                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:border-teal-500 focus:outline-none font-medium"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                                                Rentang Waktu / Periode *
                                            </label>
                                            <input
                                                type="text"
                                                value={wave.period}
                                                onChange={(e) => handleWaveChange(idx, 'period', e.target.value)}
                                                placeholder="Contoh: Juli s.d September 2026"
                                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:border-teal-500 focus:outline-none font-medium"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                                                Label Badge Diskon (Opsional)
                                            </label>
                                            <input
                                                type="text"
                                                value={wave.badge || ''}
                                                onChange={(e) => handleWaveChange(idx, 'badge', e.target.value)}
                                                placeholder="Contoh: Diskon Rp 400.000"
                                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:border-teal-500 focus:outline-none font-medium"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                                                Catatan / Keterangan (Opsional)
                                            </label>
                                            <input
                                                type="text"
                                                value={wave.note || ''}
                                                onChange={(e) => handleWaveChange(idx, 'note', e.target.value)}
                                                placeholder="Contoh: * Potongan Uang Pangkal Sebesar Rp 400.000!"
                                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:border-teal-500 focus:outline-none font-medium"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Save Button */}
                        <div className="flex justify-end pt-4 border-t border-slate-100">
                            <button
                                type="submit"
                                disabled={savingPpdb}
                                className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs sm:text-sm transition flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                            >
                                {savingPpdb ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        <span>Menyimpan Pengaturan...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save size={16} />
                                        <span>Simpan Pengaturan PPDB</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            )}

            {/* TAB 2: BRANDING & LOGO */}
            {activeTab === 'branding' && (
                <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 border-none space-y-6">
                    <div>
                        <h2 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
                            <Image className="text-teal-600" size={20} />
                            <span>Branding Logo Sekolah</span>
                        </h2>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                            Upload 1 (satu) file logo resmi yang akan secara otomatis diterapkan di <strong>Landing Page</strong>, <strong>Sidebar Admin</strong>, dan <strong>Halaman Login Admin</strong>.
                        </p>
                    </div>

                    {logoSuccessMsg && (
                        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-xs font-semibold animate-fadeIn">
                            <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                            <span>{logoSuccessMsg}</span>
                        </div>
                    )}

                    {logoErrorMsg && (
                        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-xs font-semibold animate-fadeIn">
                            <AlertCircle size={18} className="text-rose-600 shrink-0" />
                            <span>{logoErrorMsg}</span>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center pt-2">
                        {/* Preview Box */}
                        <div className="flex flex-col items-center justify-center p-6 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl min-h-[220px]">
                            {previewLogo ? (
                                <div className="space-y-3 text-center">
                                    <img 
                                        src={previewLogo} 
                                        alt="School Logo Preview" 
                                        className="max-h-24 max-w-full object-contain mx-auto drop-shadow-xs" 
                                    />
                                    <span className="text-[11px] text-teal-700 font-bold block bg-teal-50 px-3 py-1 rounded-full">
                                        ✓ Logo Terpasang
                                    </span>
                                </div>
                            ) : (
                                <div className="text-center text-slate-400 space-y-2">
                                    <Image size={36} className="mx-auto text-slate-300" />
                                    <p className="text-xs">Belum ada logo yang dipilih</p>
                                </div>
                            )}
                        </div>

                        {/* Upload Controls */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                                    Pilih File Logo Baru (PNG / JPG / SVG, Maks 2MB)
                                </label>
                                <input 
                                    type="file" 
                                    accept="image/png,image/jpeg,image/svg+xml"
                                    onChange={handleFileChange}
                                    className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 cursor-pointer"
                                />
                            </div>

                            <button
                                onClick={handleSaveLogo}
                                disabled={!fileLogo || uploadingLogo}
                                className="w-full sm:w-auto px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                            >
                                {uploadingLogo ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        <span>Menyimpan Logo...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save size={16} />
                                        <span>Simpan & Terapkan Logo</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 3: MANAJEMEN ADMIN */}
            {activeTab === 'admins' && (
                <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 border-none">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                        <div>
                            <h2 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
                                <ShieldCheck className="text-teal-600" size={20} />
                                <span>Manajemen Admin</span>
                            </h2>
                            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                                Kelola akun guru dan panitia yang memiliki hak akses masuk ke dashboard admin ini.
                            </p>
                        </div>

                        {isSuperAdmin && (
                            <button
                                onClick={() => { resetForm(); setShowModal(true); }}
                                className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                            >
                                <UserPlus size={16} />
                                <span>Tambah Admin Baru</span>
                            </button>
                        )}
                    </div>

                    {loadingAdmins ? (
                        <div className="flex flex-col items-center py-10 gap-3">
                            <Loader2 className="animate-spin text-teal-600" size={24} />
                            <span className="text-xs text-slate-400">Memuat data administrator...</span>
                        </div>
                    ) : admins.length === 0 ? (
                        <div className="text-center py-12 bg-slate-50 rounded-2xl border-none">
                            <ShieldCheck size={36} className="mx-auto text-slate-300 mb-2" />
                            <p className="text-xs text-slate-500 font-semibold">Belum ada akun admin yang terdaftar.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-100 text-[11px] font-bold uppercase text-slate-400">
                                        <th className="py-3 px-4">Nama Lengkap</th>
                                        <th className="py-3 px-4">Email Login</th>
                                        <th className="py-3 px-4">Hak Akses / Peran</th>
                                        <th className="py-3 px-4 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="text-xs divide-y divide-slate-50">
                                    {admins.map((adm) => (
                                        <tr key={adm.id} className="hover:bg-slate-50/60 transition">
                                            <td className="py-3 px-4 font-bold text-slate-800">{adm.name}</td>
                                            <td className="py-3 px-4 text-slate-500">{adm.email}</td>
                                            <td className="py-3 px-4">
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                                                    adm.roles[0]?.name === 'super_admin'
                                                        ? 'bg-purple-100 text-purple-700'
                                                        : 'bg-teal-100 text-teal-700'
                                                }`}>
                                                    {adm.roles[0]?.name === 'super_admin' ? 'Super Admin' : 'Admin PPDB'}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleEditClick(adm)}
                                                        className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition cursor-pointer"
                                                        title="Edit Data Admin"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    {isSuperAdmin && currentUser?.id !== adm.id && (
                                                        <button
                                                            onClick={() => setDeleteId(adm.id)}
                                                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                                                            title="Hapus Admin"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* MODAL TAMBAH / EDIT ADMIN */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
                    <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                            <h3 className="text-base font-bold text-slate-800">
                                {editId ? 'Edit Data Administrator' : 'Tambah Administrator Baru'}
                            </h3>
                            <button 
                                onClick={() => setShowModal(false)}
                                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

                        {formError && (
                            <div className="p-3 bg-rose-50 text-rose-700 text-xs font-semibold rounded-xl">
                                {formError}
                            </div>
                        )}

                        <form onSubmit={handleAdminSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nama Lengkap *</label>
                                <input
                                    type="text"
                                    value={formName}
                                    onChange={(e) => setFormName(e.target.value)}
                                    placeholder="Nama Lengkap Guru / Panitia"
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-teal-500 focus:outline-none"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email Login *</label>
                                <input
                                    type="email"
                                    value={formEmail}
                                    onChange={(e) => setFormEmail(e.target.value)}
                                    placeholder="alamat.email@sekolah.sch.id"
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-teal-500 focus:outline-none"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                    {editId ? 'Password Baru (Kosongkan jika tidak diubah)' : 'Password *'}
                                </label>
                                <input
                                    type="password"
                                    value={formPassword}
                                    onChange={(e) => setFormPassword(e.target.value)}
                                    placeholder={editId ? '••••••••' : 'Minimal 8 karakter'}
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-teal-500 focus:outline-none"
                                    required={!editId}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Peran / Hak Akses</label>
                                <select
                                    value={formRole}
                                    onChange={(e) => setFormRole(e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-teal-500 focus:outline-none"
                                >
                                    <option value="admin">Admin PPDB (Verifikasi Pendaftaran & CMS)</option>
                                    <option value="super_admin">Super Admin (Akses Penuh & Manajemen Akun)</option>
                                </select>
                            </div>

                            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={savingAdmin}
                                    className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs cursor-pointer flex items-center gap-1.5 shadow-sm"
                                >
                                    {savingAdmin && <Loader2 size={14} className="animate-spin" />}
                                    <span>{editId ? 'Simpan Perubahan' : 'Buat Admin'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL KONFIRMASI HAPUS ADMIN */}
            {deleteId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
                    <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl space-y-4 text-center">
                        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                            <Trash2 size={24} />
                        </div>
                        <h3 className="text-base font-bold text-slate-800">Hapus Akun Administrator?</h3>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            Akun ini tidak akan bisa lagi masuk ke panel admin. Tindakan ini tidak dapat dibatalkan.
                        </p>
                        <div className="flex justify-center gap-3 pt-2">
                            <button
                                onClick={() => setDeleteId(null)}
                                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleDeleteClick}
                                disabled={deletingAdmin}
                                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs cursor-pointer flex items-center gap-1.5 shadow-sm"
                            >
                                {deletingAdmin && <Loader2 size={14} className="animate-spin" />}
                                <span>Ya, Hapus</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
