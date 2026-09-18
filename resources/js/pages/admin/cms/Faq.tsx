import React, { useEffect, useState } from 'react';
import { adminApi } from '../../../services/api';
import { scrollToTop } from '../../../lib/utils';
import { 
    Plus, Edit2, Trash2, X, HelpCircle, CheckCircle2, 
    Search, Filter, Eye, EyeOff, AlertCircle, Sparkles 
} from 'lucide-react';

interface FaqItem {
    id: number;
    question: string;
    answer: string;
    category?: string;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
}

const CATEGORY_OPTIONS = [
    'Umum',
    'Persyaratan & Berkas',
    'Biaya & Pembayaran',
    'Jadwal & Waktu Belajar',
    'Fasilitas & Kurikulum'
];

export default function Faq() {
    const [faqs, setFaqs] = useState<FaqItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');

    const [modalOpen, setModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<FaqItem | null>(null);

    // Form states
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [category, setCategory] = useState('Umum');
    const [isActive, setIsActive] = useState(true);

    const [formError, setFormError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const fetchFaqs = () => {
        setLoading(true);
        adminApi.getAdminFaqs()
            .then((res) => {
                if (res.success) {
                    setFaqs(res.data || []);
                }
            })
            .catch((err) => console.error(err))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchFaqs();
    }, []);

    // Lock background body scroll when modal is open
    useEffect(() => {
        if (modalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [modalOpen]);

    const openCreateModal = () => {
        setEditingItem(null);
        setQuestion('');
        setAnswer('');
        setCategory('Umum');
        setIsActive(true);
        setFormError(null);
        setModalOpen(true);
    };

    const openEditModal = (item: FaqItem) => {
        setEditingItem(item);
        setQuestion(item.question);
        setAnswer(item.answer);
        setCategory(item.category || 'Umum');
        setIsActive(item.is_active !== false);
        setFormError(null);
        setModalOpen(true);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);

        if (!question.trim()) {
            setFormError('Pertanyaan FAQ wajib diisi.');
            return;
        }

        if (!answer.trim()) {
            setFormError('Jawaban FAQ wajib diisi.');
            return;
        }

        setSaving(true);
        const payload = {
            question: question.trim(),
            answer: answer.trim(),
            category,
            is_active: isActive
        };

        const apiCall = editingItem
            ? adminApi.updateFaq(editingItem.id, payload)
            : adminApi.createFaq(payload);

        apiCall
            .then((res) => {
                if (res.success) {
                    setSuccessMsg(editingItem ? 'FAQ berhasil diperbarui.' : 'FAQ baru berhasil ditambahkan.');
                    setModalOpen(false);
                    fetchFaqs();
                    scrollToTop();
                    setTimeout(() => setSuccessMsg(null), 3000);
                }
            })
            .catch((err) => {
                console.error(err);
                setFormError(err.response?.data?.message || 'Gagal menyimpan data FAQ.');
            })
            .finally(() => setSaving(false));
    };

    const handleDelete = (id: number) => {
        if (!confirm('Apakah Anda yakin ingin menghapus pertanyaan FAQ ini?')) return;

        adminApi.deleteFaq(id)
            .then((res) => {
                if (res.success) {
                    setSuccessMsg('Pertanyaan FAQ berhasil dihapus.');
                    fetchFaqs();
                    scrollToTop();
                    setTimeout(() => setSuccessMsg(null), 3000);
                }
            })
            .catch((err) => console.error(err));
    };

    const handleToggleStatus = (item: FaqItem) => {
        adminApi.updateFaq(item.id, {
            question: item.question,
            answer: item.answer,
            category: item.category,
            is_active: !item.is_active
        })
            .then((res) => {
                if (res.success) {
                    fetchFaqs();
                }
            })
            .catch((err) => console.error(err));
    };

    // Filter list
    const filteredFaqs = faqs.filter((item) => {
        const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
        const matchesSearch = 
            item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.answer.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCat && matchesSearch;
    });

    return (
        <div className="space-y-6">
            {/* Header Box */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                            <HelpCircle size={20} />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800">CMS Tanya Jawab (FAQ)</h2>
                    </div>
                    <p className="text-slate-500 text-xs mt-1.5 ml-11">
                        Kelola daftar pertanyaan yang sering ditanyakan orang tua murid seputar PPDB, kurikulum, dan fasilitas sekolah.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={openCreateModal}
                    className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-sm cursor-pointer whitespace-nowrap self-start sm:self-auto"
                >
                    <Plus size={16} /> Tambah FAQ
                </button>
            </div>

            {/* Notification alert */}
            {successMsg && (
                <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm font-medium rounded-xl flex items-center gap-2">
                    <CheckCircle2 size={18} />
                    <span>{successMsg}</span>
                </div>
            )}

            {/* Filter & Search Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                    <button
                        type="button"
                        onClick={() => setSelectedCategory('all')}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                            selectedCategory === 'all'
                                ? 'bg-teal-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                        Semua ({faqs.length})
                    </button>
                    {CATEGORY_OPTIONS.map((cat) => {
                        const count = faqs.filter(f => f.category === cat).length;
                        return (
                            <button
                                key={cat}
                                type="button"
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                                    selectedCategory === cat
                                        ? 'bg-teal-600 text-white shadow-xs'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                {cat} {count > 0 && `(${count})`}
                            </button>
                        );
                    })}
                </div>

                <div className="relative w-full md:w-64">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Cari pertanyaan / kata kunci..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-medium"
                    />
                </div>
            </div>

            {/* FAQ List Cards */}
            {loading ? (
                <div className="text-center py-16">
                    <div className="w-8 h-8 border-3 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    <span className="text-slate-400 text-xs">Memuat daftar FAQ...</span>
                </div>
            ) : filteredFaqs.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200/60 p-12 text-center text-slate-500 shadow-sm">
                    Tidak ada data FAQ yang sesuai dengan filter atau kata kunci.
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredFaqs.map((item, idx) => (
                        <div
                            key={item.id}
                            className="bg-white rounded-2xl border border-slate-200/70 p-5 shadow-xs hover:shadow-md transition duration-200 space-y-3"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-start gap-3">
                                    <span className="w-7 h-7 rounded-lg bg-teal-50 text-teal-800 text-xs font-extrabold flex items-center justify-center flex-shrink-0 mt-0.5">
                                        Q{idx + 1}
                                    </span>
                                    <div>
                                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                            <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 text-xxs font-bold rounded-md">
                                                {item.category || 'Umum'}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => handleToggleStatus(item)}
                                                className={`px-2 py-0.5 rounded-md text-xxs font-extrabold flex items-center gap-1 cursor-pointer transition ${
                                                    item.is_active !== false
                                                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                                        : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                                                }`}
                                            >
                                                {item.is_active !== false ? (
                                                    <>
                                                        <Eye size={11} /> Tampil di Web
                                                    </>
                                                ) : (
                                                    <>
                                                        <EyeOff size={11} /> Disembunyikan
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                        <h3 className="font-bold text-slate-800 text-sm sm:text-base leading-snug">
                                            {item.question}
                                        </h3>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => openEditModal(item)}
                                        className="p-2 bg-slate-50 hover:bg-teal-50 text-slate-600 hover:text-teal-700 rounded-xl transition cursor-pointer"
                                        title="Edit FAQ"
                                    >
                                        <Edit2 size={15} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(item.id)}
                                        className="p-2 bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-700 rounded-xl transition cursor-pointer"
                                        title="Hapus FAQ"
                                    >
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            </div>

                            {/* Answer Preview */}
                            <div className="ml-10 bg-slate-50/70 p-4 rounded-xl border border-slate-100 text-xs sm:text-sm text-slate-600 leading-relaxed">
                                <span className="font-bold text-teal-700 block mb-1">Jawaban:</span>
                                <p className="whitespace-pre-line">{item.answer}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal Tambah / Edit FAQ */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 my-8">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                                    <HelpCircle size={18} />
                                </div>
                                <h3 className="font-bold text-slate-800 text-base sm:text-lg">
                                    {editingItem ? 'Edit Pertanyaan FAQ' : 'Tambah Pertanyaan FAQ Baru'}
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setModalOpen(false)}
                                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {formError && (
                            <div className="p-3.5 bg-rose-50 border border-rose-100 text-rose-700 text-xs font-semibold rounded-xl mb-4 flex items-center gap-2">
                                <AlertCircle size={16} />
                                <span>{formError}</span>
                            </div>
                        )}

                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-xxs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                    Kategori FAQ *
                                </label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-slate-200 bg-slate-50 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                                >
                                    {CATEGORY_OPTIONS.map((c) => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xxs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                    Pertanyaan (Question) *
                                </label>
                                <input
                                    type="text"
                                    value={question}
                                    onChange={(e) => setQuestion(e.target.value)}
                                    placeholder="Contoh: Berapa usia minimal untuk masuk Playgroup (KB)?"
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xxs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                    Jawaban Lengkap (Answer) *
                                </label>
                                <textarea
                                    rows={5}
                                    value={answer}
                                    onChange={(e) => setAnswer(e.target.value)}
                                    placeholder="Tuliskan jawaban yang ramah, informatif, dan jelas bagi calon wali murid..."
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 leading-relaxed"
                                />
                            </div>

                            <div className="flex items-center gap-3 pt-2">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={isActive}
                                    onChange={(e) => setIsActive(e.target.checked)}
                                    className="w-4 h-4 accent-teal-600 rounded cursor-pointer"
                                />
                                <label htmlFor="is_active" className="text-xs font-bold text-slate-700 cursor-pointer">
                                    Publikasikan langsung ke halaman website publik (Aktif)
                                </label>
                            </div>

                            <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl transition shadow-sm disabled:opacity-50 cursor-pointer"
                                >
                                    {saving ? 'Menyimpan...' : editingItem ? 'Simpan Perubahan' : 'Terbitkan FAQ'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
