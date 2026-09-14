import React, { useEffect, useState } from 'react';
import { adminApi } from '../../../services/api';
import { scrollToTop } from '../../../lib/utils';
import { Plus, Edit2, Trash2, X, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface ProgramItem {
    id: number;
    name: string;
    code: string;
    description: string | null;
    is_active: boolean;
}

export default function Program() {
    const [programs, setPrograms] = useState<ProgramItem[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Modal states
    const [modalOpen, setModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<ProgramItem | null>(null);

    // Form inputs
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [description, setDescription] = useState('');
    const [isActive, setIsActive] = useState(true);

    const [formError, setFormError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const fetchPrograms = () => {
        setLoading(true);
        adminApi.getAdminPrograms()
            .then((res) => {
                if (res.success) setPrograms(res.data || []);
            })
            .catch((err) => console.error(err))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchPrograms();
    }, []);

    const openCreateModal = () => {
        setEditingItem(null);
        setName('');
        setCode('');
        setDescription('');
        setIsActive(true);
        setFormError(null);
        setModalOpen(true);
    };

    const openEditModal = (item: ProgramItem) => {
        setEditingItem(item);
        setName(item.name);
        setCode(item.code);
        setDescription(item.description || '');
        setIsActive(item.is_active);
        setFormError(null);
        setModalOpen(true);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);

        if (!name.trim() || !code.trim()) {
            setFormError('Nama dan kode program wajib diisi.');
            return;
        }

        const payload = {
            name,
            code,
            description,
            is_active: isActive ? 1 : 0
        };

        const apiCall = editingItem
            ? adminApi.updateProgram(editingItem.id, payload)
            : adminApi.createProgram(payload);

        apiCall
            .then((res) => {
                if (res.success) {
                    setSuccessMsg(editingItem ? 'Program berhasil diperbarui.' : 'Program baru berhasil ditambahkan.');
                    setModalOpen(false);
                    fetchPrograms();
                    scrollToTop();
                    setTimeout(() => setSuccessMsg(null), 3000);
                }
            })
            .catch((err) => {
                console.error(err);
                if (err.response?.data?.errors?.code) {
                    setFormError('Kode program sudah terdaftar.');
                } else {
                    setFormError('Terjadi kesalahan saat menyimpan program.');
                }
            });
    };

    const handleDelete = (id: number) => {
        if (!confirm('Apakah Anda yakin ingin menghapus program ini?')) return;

        adminApi.deleteProgram(id)
            .then((res) => {
                if (res.success) {
                    setSuccessMsg('Program berhasil dihapus.');
                    fetchPrograms();
                    scrollToTop();
                    setTimeout(() => setSuccessMsg(null), 3000);
                }
            })
            .catch((err) => console.error(err));
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white rounded-xl border border-slate-200/60 p-6 shadow-sm">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">CMS Program Kelas</h2>
                    <p className="text-slate-500 text-xs mt-1">Mengelola jenjang kelas belajar aktif di KB-TK IT Taman Robbani Sidoarjo.</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded transition flex items-center gap-1 shadow"
                >
                    <Plus size={14} /> Tambah Program
                </button>
            </div>

            {successMsg && (
                <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm font-medium rounded-lg flex items-center gap-2">
                    <CheckCircle2 size={18} />
                    <span>{successMsg}</span>
                </div>
            )}

            {/* List */}
            <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="text-center py-16">
                        <div className="w-8 h-8 border-3 border-slate-700 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                        <span className="text-slate-400 text-xs">Memuat program kelas...</span>
                    </div>
                ) : programs.length === 0 ? (
                    <div className="text-center py-16 text-slate-500">Belum ada program kelas ditambahkan.</div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 text-xs text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100">
                                <th className="p-4 pl-6">Kode</th>
                                <th className="p-4">Nama Program</th>
                                <th className="p-4">Deskripsi / Persyaratan</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 pr-6 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {programs.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50/50">
                                    <td className="p-4 pl-6 font-bold text-slate-700 tracking-wide">{item.code}</td>
                                    <td className="p-4 font-bold text-slate-800">{item.name}</td>
                                    <td className="p-4 text-slate-500 max-w-xs truncate">{item.description || '-'}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-0.5 text-xxs font-extrabold uppercase rounded-full border ${
                                            item.is_active ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-slate-100 text-slate-400 border-slate-200'
                                        }`}>
                                            {item.is_active ? 'Aktif' : 'Nonaktif'}
                                        </span>
                                    </td>
                                    <td className="p-4 pr-6 text-right space-x-2">
                                        <button
                                            onClick={() => openEditModal(item)}
                                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded transition inline-flex"
                                        >
                                            <Edit2 size={13} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded transition inline-flex"
                                        >
                                            <Trash2 size={13} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Program Edit/Create Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-lg max-w-md w-full overflow-hidden">
                        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-bold text-slate-800 text-md">{editingItem ? 'Edit Program' : 'Tambah Program Baru'}</h3>
                            <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
                        </div>
                        
                        <form onSubmit={handleSave} className="p-5 space-y-4">
                            {formError && (
                                <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 text-xs font-semibold rounded flex items-center gap-1.5">
                                    <ShieldAlert size={14} />
                                    <span>{formError}</span>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Kode Program *</label>
                                <input
                                    type="text"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    className="w-full px-3 py-1.5 border rounded-lg text-sm"
                                    placeholder="Contoh: KB-A"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nama Program *</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-3 py-1.5 border rounded-lg text-sm"
                                    placeholder="Contoh: Kelompok Bermain A"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Deskripsi / Kriteria Umur</label>
                                <textarea
                                    rows={3}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full px-3 py-1.5 border rounded-lg text-sm"
                                    placeholder="Syarat umur pendaftar..."
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={isActive}
                                    onChange={(e) => setIsActive(e.target.checked)}
                                    className="accent-teal-600"
                                />
                                <label htmlFor="is_active" className="text-xs font-semibold text-slate-650 cursor-pointer">
                                    Aktifkan program ini untuk pendaftaran PPDB
                                </label>
                            </div>

                            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded transition"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded transition shadow"
                                >
                                    Simpan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
