import React, { useEffect, useState } from 'react';
import { adminApi } from '../../../services/api';
import { scrollToTop } from '../../../lib/utils';
import { Plus, Edit2, Trash2, X, Upload, Eye, CheckCircle2, ShieldAlert, ChevronLeft, ChevronRight } from 'lucide-react';

interface NewsItem {
    id: number;
    title: string;
    slug: string;
    content: string;
    image: string | null;
    is_published: boolean;
    seo_title: string | null;
    seo_description: string | null;
    created_at: string;
}

export default function News() {
    const [newsList, setNewsList] = useState<NewsItem[]>([]);
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [loading, setLoading] = useState(true);

    const [modalOpen, setModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<NewsItem | null>(null);

    // Form states
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isPublished, setIsPublished] = useState(true);
    const [seoTitle, setSeoTitle] = useState('');
    const [seoDescription, setSeoDescription] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);

    const [formError, setFormError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const fetchNews = () => {
        setLoading(true);
        adminApi.getAdminNews(page)
            .then((res) => {
                if (res.success) {
                    setNewsList(res.data.data || []);
                    setLastPage(res.data.last_page || 1);
                }
            })
            .catch((err) => console.error(err))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchNews();
    }, [page]);

    const openCreateModal = () => {
        setEditingItem(null);
        setTitle('');
        setContent('');
        setIsPublished(true);
        setSeoTitle('');
        setSeoDescription('');
        setImageFile(null);
        setFormError(null);
        setModalOpen(true);
    };

    const openEditModal = (item: NewsItem) => {
        setEditingItem(item);
        setTitle(item.title);
        setContent(item.content);
        setIsPublished(item.is_published);
        setSeoTitle(item.seo_title || '');
        setSeoDescription(item.seo_description || '');
        setImageFile(null);
        setFormError(null);
        setModalOpen(true);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);

        if (!title.trim() || !content.trim()) {
            setFormError('Judul berita dan isi konten wajib diisi.');
            return;
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', content);
        formData.append('is_published', isPublished ? '1' : '0');
        if (seoTitle) formData.append('seo_title', seoTitle);
        if (seoDescription) formData.append('seo_description', seoDescription);
        if (imageFile) formData.append('image', imageFile);
        if (editingItem) formData.append('_method', 'PUT');

        const apiCall = editingItem
            ? adminApi.updateNews(editingItem.id, formData)
            : adminApi.createNews(formData);

        apiCall
            .then((res) => {
                if (res.success) {
                    setSuccessMsg(editingItem ? 'Artikel berhasil diperbarui.' : 'Artikel baru berhasil diterbitkan.');
                    setModalOpen(false);
                    fetchNews();
                    scrollToTop();
                    setTimeout(() => setSuccessMsg(null), 3000);
                }
            })
            .catch((err) => {
                console.error(err);
                setFormError('Gagal menyimpan berita. Periksa ukuran berkas cover (Max 2MB).');
            });
    };

    const handleDelete = (id: number) => {
        if (!confirm('Apakah Anda yakin ingin menghapus artikel berita ini?')) return;

        adminApi.deleteNews(id)
            .then((res) => {
                if (res.success) {
                    setSuccessMsg('Artikel berita berhasil dihapus.');
                    fetchNews();
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
                    <h2 className="text-xl font-bold text-slate-800">CMS Berita Sekolah</h2>
                    <p className="text-slate-500 text-xs mt-1">Mengelola tulisan artikel pengumuman dan berita sekolah di portal publik.</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded transition flex items-center gap-1 shadow"
                >
                    <Plus size={14} /> Tulis Berita
                </button>
            </div>

            {successMsg && (
                <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm font-medium rounded-lg flex items-center gap-2">
                    <CheckCircle2 size={18} />
                    <span>{successMsg}</span>
                </div>
            )}

            {/* Grid list */}
            {loading ? (
                <div className="text-center py-16">
                    <div className="w-8 h-8 border-3 border-slate-700 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    <span className="text-slate-400 text-xs">Memuat daftar berita...</span>
                </div>
            ) : newsList.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200/60 p-12 text-center text-slate-500 shadow-sm">
                    Belum ada artikel berita yang dipublikasikan.
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {newsList.map((item) => (
                            <div key={item.id} className="bg-white rounded-xl border border-slate-200/60 overflow-hidden shadow-sm flex flex-col justify-between">
                                <div className="p-5 flex gap-4">
                                    {item.image && (
                                        <div className="w-24 h-20 bg-slate-100 rounded overflow-hidden flex-shrink-0">
                                            <img
                                                src={(item as any).image_url || (item.image.startsWith('http') ? item.image : item.image.startsWith('/storage') ? item.image : `/storage/${item.image}`)}
                                                alt={item.title}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = '/images/toy_train_hero.png';
                                                }}
                                            />
                                        </div>
                                    )}
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-0.5 text-xxs font-extrabold uppercase rounded-full border ${
                                                item.is_published ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-slate-100 text-slate-400 border-slate-200'
                                            }`}>
                                                {item.is_published ? 'Published' : 'Draft'}
                                            </span>
                                            <span className="text-slate-400 text-xxs font-semibold">{new Date(item.created_at).toLocaleDateString('id-ID')}</span>
                                        </div>
                                        <h4 className="font-bold text-slate-800 text-sm line-clamp-2">{item.title}</h4>
                                    </div>
                                </div>
                                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
                                    <button
                                        onClick={() => openEditModal(item)}
                                        className="px-2.5 py-1.5 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded text-xxs font-semibold transition"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded text-xxs font-semibold transition"
                                    >
                                        Hapus
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {lastPage > 1 && (
                        <div className="bg-white rounded-xl border border-slate-200/60 p-4 flex justify-between items-center text-xs shadow-sm">
                            <button
                                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                                disabled={page === 1}
                                className="px-3 py-1.5 border bg-white rounded shadow-sm hover:bg-slate-50 disabled:opacity-50 transition"
                            >
                                Sebelumnya
                            </button>
                            <span className="text-slate-500 font-semibold">Halaman {page} dari {lastPage}</span>
                            <button
                                onClick={() => setPage((p) => Math.min(p + 1, lastPage))}
                                disabled={page === lastPage}
                                className="px-3 py-1.5 border bg-white rounded shadow-sm hover:bg-slate-50 disabled:opacity-50 transition"
                            >
                                Berikutnya
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Edit / Write News Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] flex flex-col">
                        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-bold text-slate-800 text-md">{editingItem ? 'Edit Berita' : 'Tulis Berita Baru'}</h3>
                            <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
                        </div>
                        
                        <form onSubmit={handleSave} className="p-5 space-y-4 overflow-y-auto flex-grow text-xs sm:text-sm">
                            {formError && (
                                <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 text-xs font-semibold rounded flex items-center gap-1.5">
                                    <ShieldAlert size={14} />
                                    <span>{formError}</span>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Judul Berita *</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full px-3 py-1.5 border rounded-lg text-sm"
                                    placeholder="Ketikkan judul artikel..."
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Isi Konten Berita *</label>
                                <textarea
                                    rows={8}
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    className="w-full px-3 py-1.5 border rounded-lg text-sm leading-relaxed"
                                    placeholder="Tulis konten berita lengkap di sini..."
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Cover Image input */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Cover Foto (Max 2MB)</label>
                                    <div className="border border-dashed border-slate-200 p-4 rounded-lg text-center relative bg-slate-50 cursor-pointer flex flex-col items-center justify-center min-h-24 hover:border-teal-500 transition">
                                        <Upload className="text-slate-400 mb-1" size={20} />
                                        <span className="text-xxs text-slate-400">Pilih berkas cover foto</span>
                                        <input
                                            type="file"
                                            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            accept="image/*"
                                        />
                                        {imageFile && (
                                            <div className="mt-1 text-xxs font-semibold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full truncate max-w-full">
                                                {imageFile.name}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* SEO Metadata fields */}
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">SEO Title Tag (Opsional)</label>
                                        <input
                                            type="text"
                                            value={seoTitle}
                                            onChange={(e) => setSeoTitle(e.target.value)}
                                            className="w-full px-3 py-1.5 border rounded-lg text-xs"
                                            placeholder="Judul untuk mesin pencari Google"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">SEO Description Tag (Opsional)</label>
                                        <textarea
                                            rows={2}
                                            value={seoDescription}
                                            onChange={(e) => setSeoDescription(e.target.value)}
                                            className="w-full px-3 py-1.5 border rounded-lg text-xs"
                                            placeholder="Deskripsi cuplikan Google"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="is_published"
                                    checked={isPublished}
                                    onChange={(e) => setIsPublished(e.target.checked)}
                                    className="accent-teal-600"
                                />
                                <label htmlFor="is_published" className="text-xs font-semibold text-slate-650 cursor-pointer">
                                    Publikasikan artikel ini di web publik segera
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
                                    Terbitkan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
