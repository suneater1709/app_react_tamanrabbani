import React, { useEffect, useState } from 'react';
import { adminApi } from '../../../services/api';
import { scrollToTop } from '../../../lib/utils';
import { 
    Plus, Edit2, Trash2, X, CheckCircle2, AlertCircle, Layers, Award, 
    School, BookOpen, GraduationCap, HeartHandshake, Activity, Sparkles, Filter 
} from 'lucide-react';

interface ClassProgramItem {
    id: number;
    name: string;
    code: string;
    description: string | null;
    is_active: boolean;
}

interface CurriculumProgramItem {
    id: number;
    title: string;
    category: 'school' | 'class' | 'akhlak' | 'quran' | 'uks';
    target_audience: string | null;
    frequency: string | null;
    description: string | null;
    order: number;
    is_active: boolean;
}

interface ExtracurricularItem {
    id: number;
    title: string;
    level: 'kb' | 'tk' | 'all';
    instructor: string | null;
    schedule: string | null;
    description: string | null;
    order: number;
    is_active: boolean;
}

export default function Program() {
    const [mainTab, setMainTab] = useState<'curriculum' | 'extra' | 'classes'>('curriculum');
    
    // 1. Curriculum State
    const [curriculumList, setCurriculumList] = useState<CurriculumProgramItem[]>([]);
    const [curriculumCategoryFilter, setCurriculumCategoryFilter] = useState<string>('all');
    const [curriculumModalOpen, setCurriculumModalOpen] = useState(false);
    const [curriculumEditing, setCurriculumEditing] = useState<CurriculumProgramItem | null>(null);
    const [curriculumForm, setCurriculumForm] = useState({
        title: '',
        category: 'school',
        target_audience: '',
        frequency: '',
        description: '',
        order: 0,
        is_active: true
    });

    // 2. Extracurricular State
    const [extraList, setExtraList] = useState<ExtracurricularItem[]>([]);
    const [extraLevelFilter, setExtraLevelFilter] = useState<string>('all');
    const [extraModalOpen, setExtraModalOpen] = useState(false);
    const [extraEditing, setExtraEditing] = useState<ExtracurricularItem | null>(null);
    const [extraForm, setExtraForm] = useState({
        title: '',
        level: 'tk',
        instructor: '',
        schedule: '',
        description: '',
        order: 0,
        is_active: true
    });

    // 3. Class Program State
    const [classList, setClassList] = useState<ClassProgramItem[]>([]);
    const [classModalOpen, setClassModalOpen] = useState(false);
    const [classEditing, setClassEditing] = useState<ClassProgramItem | null>(null);
    const [classForm, setClassForm] = useState({
        name: '',
        code: '',
        description: '',
        is_active: true
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const fetchAllData = () => {
        setLoading(true);
        Promise.all([
            adminApi.getCurriculumPrograms().catch(() => ({ success: false, data: [] })),
            adminApi.getExtracurriculars().catch(() => ({ success: false, data: [] })),
            adminApi.getAdminPrograms().catch(() => ({ success: false, data: [] })),
        ])
            .then(([curRes, extraRes, classRes]) => {
                const curData = Array.isArray(curRes?.data)
                    ? curRes.data
                    : (Array.isArray(curRes?.programs) ? curRes.programs : (Array.isArray(curRes?.data?.programs) ? curRes.data.programs : []));
                setCurriculumList(curData);

                const extraData = Array.isArray(extraRes?.data)
                    ? extraRes.data
                    : (Array.isArray(curRes?.extracurriculars) ? curRes.extracurriculars : (Array.isArray(curRes?.data?.extracurriculars) ? curRes.data.extracurriculars : []));
                setExtraList(extraData);

                const clsData = Array.isArray(classRes?.data)
                    ? classRes.data
                    : (Array.isArray(classRes?.data?.data) ? classRes.data.data : []);
                setClassList(clsData);
            })
            .catch(err => {
                console.error("Error loading program CMS data:", err);
                setCurriculumList([]);
                setExtraList([]);
                setClassList([]);
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    // Lock background body scroll when any modal is open
    useEffect(() => {
        if (curriculumModalOpen || extraModalOpen || classModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [curriculumModalOpen, extraModalOpen, classModalOpen]);

    const showSuccess = (msg: string) => {
        setSuccessMsg(msg);
        scrollToTop();
        setTimeout(() => setSuccessMsg(null), 3500);
    };

    // ==========================================
    // 1. CURRICULUM CRUD HANDLERS
    // ==========================================
    const openCreateCurriculum = () => {
        setCurriculumEditing(null);
        setCurriculumForm({
            title: '',
            category: 'school',
            target_audience: '',
            frequency: '',
            description: '',
            order: curriculumList.length,
            is_active: true
        });
        setErrorMsg(null);
        setCurriculumModalOpen(true);
    };

    const openEditCurriculum = (item: any) => {
        setCurriculumEditing(item);
        const cat = item.category === 'sekolah' ? 'school' : item.category === 'kelas' ? 'class' : item.category;
        setCurriculumForm({
            title: item.title || item.name || '',
            category: cat || 'school',
            target_audience: item.target_audience || '',
            frequency: item.frequency || item.time_allocation || '',
            description: item.description || '',
            order: item.order || 0,
            is_active: item.is_active !== undefined ? Boolean(item.is_active) : true
        });
        setErrorMsg(null);
        setCurriculumModalOpen(true);
    };

    const handleSaveCurriculum = (e: React.FormEvent) => {
        e.preventDefault();
        if (!curriculumForm.title.trim()) {
            setErrorMsg('Judul program kurikulum wajib diisi.');
            return;
        }

        setSaving(true);
        const payload = {
            ...curriculumForm,
            is_active: curriculumForm.is_active ? 1 : 0
        };

        const apiCall = curriculumEditing
            ? adminApi.updateCurriculumProgram(curriculumEditing.id, payload)
            : adminApi.createCurriculumProgram(payload);

        apiCall
            .then((res) => {
                if (res.success) {
                    showSuccess(curriculumEditing ? 'Program kurikulum berhasil diperbarui.' : 'Program kurikulum berhasil ditambahkan.');
                    setCurriculumModalOpen(false);
                    fetchAllData();
                }
            })
            .catch((err) => {
                console.error(err);
                setErrorMsg('Gagal menyimpan program kurikulum.');
            })
            .finally(() => setSaving(false));
    };

    const handleDeleteCurriculum = (id: number) => {
        if (!confirm('Apakah Anda yakin ingin menghapus program kurikulum ini?')) return;
        adminApi.deleteCurriculumProgram(id)
            .then((res) => {
                if (res.success) {
                    showSuccess('Program kurikulum berhasil dihapus.');
                    fetchAllData();
                }
            })
            .catch(err => console.error(err));
    };

    // ==========================================
    // 2. EXTRACURRICULAR CRUD HANDLERS
    // ==========================================
    const openCreateExtra = () => {
        setExtraEditing(null);
        setExtraForm({
            title: '',
            level: 'tk',
            instructor: '',
            schedule: '',
            description: '',
            order: extraList.length,
            is_active: true
        });
        setErrorMsg(null);
        setExtraModalOpen(true);
    };

    const openEditExtra = (item: ExtracurricularItem) => {
        setExtraEditing(item);
        setExtraForm({
            title: item.title,
            level: item.level,
            instructor: item.instructor || '',
            schedule: item.schedule || '',
            description: item.description || '',
            order: item.order || 0,
            is_active: item.is_active
        });
        setErrorMsg(null);
        setExtraModalOpen(true);
    };

    const handleSaveExtra = (e: React.FormEvent) => {
        e.preventDefault();
        if (!extraForm.title.trim()) {
            setErrorMsg('Nama kegiatan ekstrakurikuler wajib diisi.');
            return;
        }

        setSaving(true);
        const payload = {
            ...extraForm,
            is_active: extraForm.is_active ? 1 : 0
        };

        const apiCall = extraEditing
            ? adminApi.updateExtracurricular(extraEditing.id, payload)
            : adminApi.createExtracurricular(payload);

        apiCall
            .then((res) => {
                if (res.success) {
                    showSuccess(extraEditing ? 'Ekstrakurikuler berhasil diperbarui.' : 'Ekstrakurikuler baru berhasil ditambahkan.');
                    setExtraModalOpen(false);
                    fetchAllData();
                }
            })
            .catch((err) => {
                console.error(err);
                setErrorMsg('Gagal menyimpan ekstrakurikuler.');
            })
            .finally(() => setSaving(false));
    };

    const handleDeleteExtra = (id: number) => {
        if (!confirm('Apakah Anda yakin ingin menghapus ekstrakurikuler ini?')) return;
        adminApi.deleteExtracurricular(id)
            .then((res) => {
                if (res.success) {
                    showSuccess('Ekstrakurikuler berhasil dihapus.');
                    fetchAllData();
                }
            })
            .catch(err => console.error(err));
    };

    // ==========================================
    // 3. CLASS PROGRAM CRUD HANDLERS
    // ==========================================
    const openCreateClass = () => {
        setClassEditing(null);
        setClassForm({ name: '', code: '', description: '', is_active: true });
        setErrorMsg(null);
        setClassModalOpen(true);
    };

    const openEditClass = (item: ClassProgramItem) => {
        setClassEditing(item);
        setClassForm({
            name: item.name,
            code: item.code,
            description: item.description || '',
            is_active: item.is_active
        });
        setErrorMsg(null);
        setClassModalOpen(true);
    };

    const handleSaveClass = (e: React.FormEvent) => {
        e.preventDefault();
        if (!classForm.name.trim() || !classForm.code.trim()) {
            setErrorMsg('Nama dan kode kelas wajib diisi.');
            return;
        }

        setSaving(true);
        const payload = {
            ...classForm,
            is_active: classForm.is_active ? 1 : 0
        };

        const apiCall = classEditing
            ? adminApi.updateProgram(classEditing.id, payload)
            : adminApi.createProgram(payload);

        apiCall
            .then((res) => {
                if (res.success) {
                    showSuccess(classEditing ? 'Jenjang kelas berhasil diperbarui.' : 'Jenjang kelas berhasil ditambahkan.');
                    setClassModalOpen(false);
                    fetchAllData();
                }
            })
            .catch((err) => {
                console.error(err);
                setErrorMsg('Gagal menyimpan jenjang kelas.');
            })
            .finally(() => setSaving(false));
    };

    const handleDeleteClass = (id: number) => {
        if (!confirm('Apakah Anda yakin ingin menghapus jenjang kelas ini?')) return;
        adminApi.deleteProgram(id)
            .then((res) => {
                if (res.success) {
                    showSuccess('Jenjang kelas berhasil dihapus.');
                    fetchAllData();
                }
            })
            .catch(err => console.error(err));
    };

    // Filters
    const filteredCurriculum = (Array.isArray(curriculumList) ? curriculumList : []).filter(c => {
        if (curriculumCategoryFilter === 'all') return true;
        const cat = c.category?.toLowerCase();
        if (curriculumCategoryFilter === 'school') return cat === 'school' || cat === 'sekolah';
        if (curriculumCategoryFilter === 'class') return cat === 'class' || cat === 'kelas';
        return cat === curriculumCategoryFilter;
    });

    const filteredExtra = (Array.isArray(extraList) ? extraList : []).filter(e => {
        if (extraLevelFilter === 'all') return true;
        return e.level?.toLowerCase() === extraLevelFilter.toLowerCase();
    });

    const getCategoryBadge = (cat: string) => {
        const c = cat?.toLowerCase();
        if (c === 'school' || c === 'sekolah') return <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 text-xxs font-bold rounded-full">Sekolah</span>;
        if (c === 'class' || c === 'kelas') return <span className="px-2.5 py-0.5 bg-teal-100 text-teal-800 text-xxs font-bold rounded-full">Kelas</span>;
        if (c === 'akhlak') return <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-xxs font-bold rounded-full">Akhlakul Karimah</span>;
        if (c === 'quran') return <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 text-xxs font-bold rounded-full">Al-Qur'an</span>;
        if (c === 'uks') return <span className="px-2.5 py-0.5 bg-rose-100 text-rose-800 text-xxs font-bold rounded-full">UKS & Kesehatan</span>;
        return <span className="px-2.5 py-0.5 bg-slate-100 text-slate-800 text-xxs font-bold rounded-full">{cat}</span>;
    };

    return (
        <div className="space-y-6">
            {/* Top Navigation / Header */}
            <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">CMS Program Kurikulum & Ekstrakurikuler</h2>
                        <p className="text-slate-500 text-xs mt-1">
                            Kelola 5 Kategori Kurikulum Terpadu, Ekstrakurikuler Minat Bakat, dan Jenjang Kelas PPDB.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        {mainTab === 'curriculum' && (
                            <button
                                onClick={openCreateCurriculum}
                                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-xl transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                            >
                                <Plus size={15} /> Tambah Program Kurikulum
                            </button>
                        )}
                        {mainTab === 'extra' && (
                            <button
                                onClick={openCreateExtra}
                                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-xl transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                            >
                                <Plus size={15} /> Tambah Ekstrakurikuler
                            </button>
                        )}
                        {mainTab === 'classes' && (
                            <button
                                onClick={openCreateClass}
                                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs rounded-xl transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                            >
                                <Plus size={15} /> Tambah Jenjang Kelas
                            </button>
                        )}
                    </div>
                </div>

                {/* Main Tabs */}
                <div className="flex items-center gap-2 border-t pt-4">
                    <button
                        onClick={() => setMainTab('curriculum')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                            mainTab === 'curriculum'
                                ? 'bg-teal-50 text-teal-800 ring-1 ring-teal-600/30'
                                : 'text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                        <Layers size={15} />
                        <span>5 Kategori Kurikulum ({curriculumList.length})</span>
                    </button>
                    <button
                        onClick={() => setMainTab('extra')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                            mainTab === 'extra'
                                ? 'bg-purple-50 text-purple-800 ring-1 ring-purple-600/30'
                                : 'text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                        <Award size={15} />
                        <span>Ekstrakurikuler ({extraList.length})</span>
                    </button>
                    <button
                        onClick={() => setMainTab('classes')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                            mainTab === 'classes'
                                ? 'bg-slate-100 text-slate-800 ring-1 ring-slate-400/30'
                                : 'text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                        <GraduationCap size={15} />
                        <span>Jenjang Kelas PPDB ({classList.length})</span>
                    </button>
                </div>
            </div>

            {successMsg && (
                <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm font-medium rounded-xl flex items-center gap-2">
                    <CheckCircle2 size={18} />
                    <span>{successMsg}</span>
                </div>
            )}

            {/* TAB 1: 5 KATEGORI KURIKULUM */}
            {mainTab === 'curriculum' && (
                <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden space-y-4 p-6">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2 overflow-x-auto pb-1">
                            <span className="text-xxs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                <Filter size={12} /> Kategori:
                            </span>
                            {[
                                { id: 'all', label: 'Semua Kategori' },
                                { id: 'school', label: 'Program Sekolah' },
                                { id: 'class', label: 'Program Kelas' },
                                { id: 'akhlak', label: 'Akhlakul Karimah' },
                                { id: 'quran', label: "Al-Qur'an" },
                                { id: 'uks', label: 'UKS & Kesehatan' },
                            ].map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setCurriculumCategoryFilter(cat.id)}
                                    className={`px-3 py-1.5 rounded-lg text-xxs font-bold transition cursor-pointer ${
                                        curriculumCategoryFilter === cat.id
                                            ? 'bg-teal-600 text-white'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                        <span className="text-xxs text-slate-400">Total: <strong>{filteredCurriculum.length}</strong> program</span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 text-xs text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100">
                                    <th className="p-3 pl-4">No</th>
                                    <th className="p-3">Kategori</th>
                                    <th className="p-3">Judul Program</th>
                                    <th className="p-3">Sasaran & Frekuensi</th>
                                    <th className="p-3">Deskripsi</th>
                                    <th className="p-3">Status</th>
                                    <th className="p-3 pr-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} className="text-center py-12 text-slate-400">Memuat data kurikulum...</td>
                                    </tr>
                                ) : filteredCurriculum.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="text-center py-12 text-slate-400">Belum ada program di kategori ini.</td>
                                    </tr>
                                ) : (
                                    filteredCurriculum.map((item, idx) => (
                                        <tr key={item.id} className="hover:bg-slate-50/60 transition">
                                            <td className="p-3 pl-4 font-bold text-slate-400">{idx + 1}</td>
                                            <td className="p-3">{getCategoryBadge(item.category)}</td>
                                            <td className="p-3 font-bold text-slate-800">{item.title || (item as any).name}</td>
                                            <td className="p-3 text-xxs text-slate-500 space-y-0.5">
                                                {item.target_audience && <div>🎯 {item.target_audience}</div>}
                                                {(item.frequency || (item as any).time_allocation) && <div>⏰ {item.frequency || (item as any).time_allocation}</div>}
                                            </td>
                                            <td className="p-3 text-slate-500 max-w-xs truncate">{item.description || '-'}</td>
                                            <td className="p-3">
                                                <span className={`px-2 py-0.5 rounded-full text-xxs font-bold ${
                                                    item.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                                                }`}>
                                                    {item.is_active ? 'Aktif' : 'Nonaktif'}
                                                </span>
                                            </td>
                                            <td className="p-3 pr-4 text-right space-x-2">
                                                <button
                                                    onClick={() => openEditCurriculum(item)}
                                                    className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition"
                                                    title="Edit"
                                                >
                                                    <Edit2 size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteCurriculum(item.id)}
                                                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                                    title="Hapus"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB 2: EKSTRAKURIKULER */}
            {mainTab === 'extra' && (
                <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden space-y-4 p-6">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <span className="text-xxs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                <Filter size={12} /> Jenjang:
                            </span>
                            {[
                                { id: 'all', label: 'Semua Jenjang' },
                                { id: 'kb', label: 'Playgroup (KB)' },
                                { id: 'tk', label: 'Taman Kanak-Kanak (TK)' },
                            ].map(lvl => (
                                <button
                                    key={lvl.id}
                                    onClick={() => setExtraLevelFilter(lvl.id)}
                                    className={`px-3 py-1.5 rounded-lg text-xxs font-bold transition cursor-pointer ${
                                        extraLevelFilter === lvl.id
                                            ? 'bg-purple-600 text-white'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                                >
                                    {lvl.label}
                                </button>
                            ))}
                        </div>
                        <span className="text-xxs text-slate-400">Total: <strong>{filteredExtra.length}</strong> ekskul</span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 text-xs text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100">
                                    <th className="p-3 pl-4">No</th>
                                    <th className="p-3">Jenjang</th>
                                    <th className="p-3">Nama Ekstrakurikuler</th>
                                    <th className="p-3">Pembina & Jadwal</th>
                                    <th className="p-3">Deskripsi</th>
                                    <th className="p-3">Status</th>
                                    <th className="p-3 pr-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} className="text-center py-12 text-slate-400">Memuat data ekstrakurikuler...</td>
                                    </tr>
                                ) : filteredExtra.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="text-center py-12 text-slate-400">Belum ada kegiatan ekstrakurikuler.</td>
                                    </tr>
                                ) : (
                                    filteredExtra.map((item, idx) => (
                                        <tr key={item.id} className="hover:bg-slate-50/60 transition">
                                            <td className="p-3 pl-4 font-bold text-slate-400">{idx + 1}</td>
                                            <td className="p-3">
                                                <span className={`px-2.5 py-0.5 rounded-full text-xxs font-bold ${
                                                    String(item.level).toLowerCase() === 'kb' ? 'bg-amber-100 text-amber-800' : 'bg-purple-100 text-purple-800'
                                                }`}>
                                                    {String(item.level).toLowerCase() === 'kb' ? 'Kelompok Bermain' : String(item.level).toLowerCase() === 'tk' ? 'Taman Kanak-Kanak' : 'Semua'}
                                                </span>
                                            </td>
                                            <td className="p-3 font-bold text-slate-800">{item.title || (item as any).name}</td>
                                            <td className="p-3 text-xxs text-slate-500 space-y-0.5">
                                                {item.instructor && <div>👤 {item.instructor}</div>}
                                                {item.schedule && <div>⏰ {item.schedule}</div>}
                                            </td>
                                            <td className="p-3 text-slate-500 max-w-xs truncate">{item.description || '-'}</td>
                                            <td className="p-3">
                                                <span className={`px-2 py-0.5 rounded-full text-xxs font-bold ${
                                                    item.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                                                }`}>
                                                    {item.is_active ? 'Aktif' : 'Nonaktif'}
                                                </span>
                                            </td>
                                            <td className="p-3 pr-4 text-right space-x-2">
                                                <button
                                                    onClick={() => openEditExtra(item)}
                                                    className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition"
                                                    title="Edit"
                                                >
                                                    <Edit2 size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteExtra(item.id)}
                                                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                                    title="Hapus"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB 3: JENJANG KELAS PPDB */}
            {mainTab === 'classes' && (
                <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden p-6">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 text-xs text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100">
                                <th className="p-3 pl-4">Kode</th>
                                <th className="p-3">Nama Jenjang Kelas</th>
                                <th className="p-3">Deskripsi</th>
                                <th className="p-3">Status</th>
                                <th className="p-3 pr-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-12 text-slate-400">Memuat jenjang kelas...</td>
                                </tr>
                            ) : classList.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-12 text-slate-400">Belum ada jenjang kelas.</td>
                                </tr>
                            ) : (
                                classList.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50/60 transition">
                                        <td className="p-3 pl-4 font-mono font-bold text-teal-700">{item.code}</td>
                                        <td className="p-3 font-bold text-slate-800">{item.name}</td>
                                        <td className="p-3 text-slate-500 max-w-sm truncate">{item.description || '-'}</td>
                                        <td className="p-3">
                                            <span className={`px-2 py-0.5 rounded-full text-xxs font-bold ${
                                                item.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                                            }`}>
                                                {item.is_active ? 'Aktif' : 'Nonaktif'}
                                            </span>
                                        </td>
                                        <td className="p-3 pr-4 text-right space-x-2">
                                            <button
                                                onClick={() => openEditClass(item)}
                                                className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition"
                                                title="Edit"
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClass(item.id)}
                                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                                title="Hapus"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* MODAL 1: CURRICULUM FORM */}
            {curriculumModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                    <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5">
                        <div className="flex justify-between items-center border-b pb-3">
                            <h3 className="font-bold text-slate-800 text-base">
                                {curriculumEditing ? 'Edit Program Kurikulum' : 'Tambah Program Kurikulum'}
                            </h3>
                            <button onClick={() => setCurriculumModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>

                        {errorMsg && (
                            <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                                <AlertCircle size={16} />
                                <span>{errorMsg}</span>
                            </div>
                        )}

                        <form onSubmit={handleSaveCurriculum} className="space-y-4 text-xs">
                            <div>
                                <label className="block font-bold text-slate-700 mb-1">Kategori Kurikulum</label>
                                <select
                                    value={curriculumForm.category}
                                    onChange={(e) => setCurriculumForm({ ...curriculumForm, category: e.target.value as any })}
                                    className="w-full px-3 py-2 border rounded-xl"
                                >
                                    <option value="school">Program Sekolah</option>
                                    <option value="class">Program Kelas</option>
                                    <option value="akhlak">Program Akhlakul Karimah</option>
                                    <option value="quran">Program Al-Qur'an</option>
                                    <option value="uks">Program UKS & Kesehatan</option>
                                </select>
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1">Judul / Nama Program</label>
                                <input
                                    type="text"
                                    value={curriculumForm.title}
                                    onChange={(e) => setCurriculumForm({ ...curriculumForm, title: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-xl"
                                    placeholder="Contoh: Pembelajaran Tematik Terpadu"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Sasaran Anak / Kelas</label>
                                    <input
                                        type="text"
                                        value={curriculumForm.target_audience}
                                        onChange={(e) => setCurriculumForm({ ...curriculumForm, target_audience: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-xl"
                                        placeholder="Contoh: Semua Kelompok / TK-B"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Frekuensi / Waktu</label>
                                    <input
                                        type="text"
                                        value={curriculumForm.frequency}
                                        onChange={(e) => setCurriculumForm({ ...curriculumForm, frequency: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-xl"
                                        placeholder="Contoh: Setiap Hari / Per Semester"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1">Deskripsi Singkat Program</label>
                                <textarea
                                    rows={3}
                                    value={curriculumForm.description}
                                    onChange={(e) => setCurriculumForm({ ...curriculumForm, description: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-xl"
                                    placeholder="Penjelasan ringkas kegiatan..."
                                />
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="cur_active"
                                    checked={curriculumForm.is_active}
                                    onChange={(e) => setCurriculumForm({ ...curriculumForm, is_active: e.target.checked })}
                                    className="rounded text-teal-600"
                                />
                                <label htmlFor="cur_active" className="font-semibold text-slate-700 cursor-pointer">
                                    Aktif dan Tampilkan di Halaman Program Public
                                </label>
                            </div>

                            <div className="flex justify-end gap-2 pt-4 border-t">
                                <button
                                    type="button"
                                    onClick={() => setCurriculumModalOpen(false)}
                                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl"
                                >
                                    {saving ? 'Menyimpan...' : 'Simpan Program'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 2: EXTRACURRICULAR FORM */}
            {extraModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                    <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5">
                        <div className="flex justify-between items-center border-b pb-3">
                            <h3 className="font-bold text-slate-800 text-base">
                                {extraEditing ? 'Edit Ekstrakurikuler' : 'Tambah Ekstrakurikuler'}
                            </h3>
                            <button onClick={() => setExtraModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveExtra} className="space-y-4 text-xs">
                            <div>
                                <label className="block font-bold text-slate-700 mb-1">Jenjang Tingkatan</label>
                                <select
                                    value={extraForm.level}
                                    onChange={(e) => setExtraForm({ ...extraForm, level: e.target.value as any })}
                                    className="w-full px-3 py-2 border rounded-xl"
                                >
                                    <option value="tk">Jenjang TK (Taman Kanak-Kanak)</option>
                                    <option value="kb">Jenjang KB (Kelompok Bermain)</option>
                                    <option value="all">Semua Jenjang (KB & TK)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1">Nama Kegiatan Ekstrakurikuler</label>
                                <input
                                    type="text"
                                    value={extraForm.title}
                                    onChange={(e) => setExtraForm({ ...extraForm, title: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-xl"
                                    placeholder="Contoh: Tahfidz Cilik Intensif"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Pembina / Pengajar</label>
                                    <input
                                        type="text"
                                        value={extraForm.instructor}
                                        onChange={(e) => setExtraForm({ ...extraForm, instructor: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-xl"
                                        placeholder="Contoh: Ustadz Pembina Tahfidz"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Jadwal Pelaksanaan</label>
                                    <input
                                        type="text"
                                        value={extraForm.schedule}
                                        onChange={(e) => setExtraForm({ ...extraForm, schedule: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-xl"
                                        placeholder="Contoh: Setiap Kamis (11.30 - 12.30)"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1">Deskripsi Manfaat Kegiatan</label>
                                <textarea
                                    rows={3}
                                    value={extraForm.description}
                                    onChange={(e) => setExtraForm({ ...extraForm, description: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-xl"
                                    placeholder="Penjelasan manfaat untuk perkembangan anak..."
                                />
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="extra_active"
                                    checked={extraForm.is_active}
                                    onChange={(e) => setExtraForm({ ...extraForm, is_active: e.target.checked })}
                                    className="rounded text-purple-600"
                                />
                                <label htmlFor="extra_active" className="font-semibold text-slate-700 cursor-pointer">
                                    Aktif dan Tampilkan di Website
                                </label>
                            </div>

                            <div className="flex justify-end gap-2 pt-4 border-t">
                                <button
                                    type="button"
                                    onClick={() => setExtraModalOpen(false)}
                                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl"
                                >
                                    {saving ? 'Menyimpan...' : 'Simpan Ekstrakurikuler'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 3: CLASS FORM */}
            {classModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
                        <div className="flex justify-between items-center border-b pb-3">
                            <h3 className="font-bold text-slate-800 text-base">
                                {classEditing ? 'Edit Jenjang Kelas' : 'Tambah Jenjang Kelas'}
                            </h3>
                            <button onClick={() => setClassModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveClass} className="space-y-4 text-xs">
                            <div>
                                <label className="block font-bold text-slate-700 mb-1">Nama Kelas</label>
                                <input
                                    type="text"
                                    value={classForm.name}
                                    onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-xl"
                                    placeholder="Contoh: Taman Kanak-Kanak A (TK-A)"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1">Kode Kelas Unik</label>
                                <input
                                    type="text"
                                    value={classForm.code}
                                    onChange={(e) => setClassForm({ ...classForm, code: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-xl"
                                    placeholder="Contoh: TK-A / PG"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1">Deskripsi / Kriteria Usia</label>
                                <textarea
                                    rows={3}
                                    value={classForm.description}
                                    onChange={(e) => setClassForm({ ...classForm, description: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-xl"
                                    placeholder="Penjelasan usia masuk dan kriteria..."
                                />
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="class_active"
                                    checked={classForm.is_active}
                                    onChange={(e) => setClassForm({ ...classForm, is_active: e.target.checked })}
                                    className="rounded text-teal-600"
                                />
                                <label htmlFor="class_active" className="font-semibold text-slate-700 cursor-pointer">
                                    Aktifkan Pilihan Jenjang di Form PPDB
                                </label>
                            </div>

                            <div className="flex justify-end gap-2 pt-4 border-t">
                                <button
                                    type="button"
                                    onClick={() => setClassModalOpen(false)}
                                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl"
                                >
                                    {saving ? 'Menyimpan...' : 'Simpan Kelas'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
