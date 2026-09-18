import React, { useEffect, useState } from 'react';
import { adminApi } from '../../../services/api';
import { scrollToTop } from '../../../lib/utils';
import { 
    Plus, Edit2, Trash2, X, Upload, Eye, CheckCircle2, 
    ShieldAlert, ChevronLeft, ChevronRight, FileText, ExternalLink, Image as ImageIcon 
} from 'lucide-react';

interface NewsItem {
    id: number;
    title: string;
    slug: string;
    content: string;
    image: string | null;
    image_url?: string | null;
    content_type?: 'image' | 'file' | 'link';
    file_path?: string | null;
    file_url?: string | null;
    external_link?: string | null;
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
    const [contentType, setContentType] = useState<'image' | 'file' | 'link'>('image');
    const [content, setContent] = useState('');
    const [externalLink, setExternalLink] = useState('');
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [isPublished, setIsPublished] = useState(true);
    const [seoTitle, setSeoTitle] = useState('');
    const [seoDescription, setSeoDescription] = useState('');

    const [formError, setFormError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

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
        setTitle('');
        setContentType('image');
        setContent('');
        setExternalLink('');
        setPdfFile(null);
        setImageFile(null);
        setIsPublished(true);
        setSeoTitle('');
        setSeoDescription('');
        setFormError(null);
        setModalOpen(true);
    };

    const openEditModal = (item: NewsItem) => {
        setEditingItem(item);
        setTitle(item.title);
        setContentType(item.content_type || 'image');
        setContent(item.content || '');
        setExternalLink(item.external_link || '');
        setPdfFile(null);
        setImageFile(null);
        setIsPublished(item.is_published);
        setSeoTitle(item.seo_title || '');
        setSeoDescription(item.seo_description || '');
        setFormError(null);
        setModalOpen(true);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);

        if (!title.trim()) {
            setFormError('Judul berita wajib diisi.');
            return;
        }

        if (contentType === 'link' && !externalLink.trim()) {
            setFormError('Alamat tautan eksternal (URL) wajib diisi.');
            return;
        }

        setSaving(true);
        const formData = new FormData();
        formData.append('title', title);
        formData.append('content_type', contentType);
        formData.append('content', content);
        formData.append('is_published', isPublished ? '1' : '0');
        if (externalLink) formData.append('external_link', externalLink);
        if (pdfFile) {
            formData.append('pdf_file', pdfFile);
            formData.append('file', pdfFile);
        }
        if (imageFile) formData.append('image', imageFile);
        if (seoTitle) formData.append('seo_title', seoTitle);
        if (seoDescription) formData.append('seo_description', seoDescription);
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
                    setTimeout(() => setSuccessMsg(null), 3500);
                }
            })
            .catch((err) => {
                console.error(err);
                setFormError(err.response?.data?.message || 'Gagal menyimpan berita. Periksa ukuran berkas (Cover max 2MB, PDF max 10MB).');
            })
            .finally(() => setSaving(false));
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">CMS Berita & Pengumuman</h2>
                    <p className="text-slate-500 text-xs mt-1">
                        Kelola berita standar bergambar, unggahan dokumen resmi (PDF), dan tautan publikasi eksternal.
                    </p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                    <Plus size={15} /> Tulis Berita / Dokumen
                </button>
            </div>

            {successMsg && (
                <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm font-medium rounded-xl flex items-center gap-2">
                    <CheckCircle2 size={18} />
                    <span>{successMsg}</span>
                </div>
            )}

            {/* Grid list */}
            {loading ? (
                <div className="text-center py-16">
                    <div className="w-8 h-8 border-3 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    <span className="text-slate-400 text-xs">Memuat daftar berita...</span>
                </div>
            ) : newsList.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200/60 p-12 text-center text-slate-500 shadow-sm">
                    Belum ada artikel berita atau dokumen yang dipublikasikan.
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {newsList.map((item) => {
                            const isPdf = item.content_type === 'file';
                            const isLink = item.content_type === 'link';

                            return (
                                <div key={item.id} className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden shadow-sm flex flex-col justify-between hover:border-teal-300 transition">
                                    <div className="p-5 flex gap-4">
                                        <div className="w-24 h-22 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100 flex items-center justify-center">
                                            {item.image ? (
                                                <img
                                                    src={(item as any).image_url || (item.image.startsWith('http') ? item.image : item.image.startsWith('/storage') ? item.image : `/storage/${item.image}`)}
                                                    alt={item.title}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = '/images/toy_train_hero.png';
                                                    }}
                                                />
                                            ) : isPdf ? (
                                                <FileText size={32} className="text-rose-500" />
                                            ) : isLink ? (
                                                <ExternalLink size={32} className="text-blue-500" />
                                            ) : (
                                                <ImageIcon size={32} className="text-slate-300" />
                                            )}
                                        </div>

                                        <div className="space-y-1.5 flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center gap-1.5">
                                                {/* Content type badge */}
                                                {isPdf ? (
                                                    <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-xxs font-extrabold rounded-full flex items-center gap-1">
                                                        <FileText size={10} /> PDF
                                                    </span>
                                                ) : isLink ? (
                                                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xxs font-extrabold rounded-full flex items-center gap-1">
                                                        <ExternalLink size={10} /> Link
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-0.5 bg-teal-100 text-teal-800 text-xxs font-extrabold rounded-full flex items-center gap-1">
                                                        <ImageIcon size={10} /> Gambar
                                                    </span>
                                                )}

                                                <span className={`px-2 py-0.5 text-xxs font-bold rounded-full ${
                                                    item.is_published ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                                                }`}>
                                                    {item.is_published ? 'Published' : 'Draft'}
                                                </span>
                                                <span className="text-slate-400 text-xxs font-semibold">
                                                    {new Date(item.created_at).toLocaleDateString('id-ID')}
                                                </span>
                                            </div>

                                            <h4 className="font-bold text-slate-800 text-sm line-clamp-2">{item.title}</h4>
                                            
                                            {isLink && item.external_link && (
                                                <p className="text-xxs text-blue-600 truncate">{item.external_link}</p>
                                            )}
                                            {isPdf && item.file_path && (
                                                <p className="text-xxs text-rose-600 truncate">📄 File: {item.file_path.split('/').pop()}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="p-3.5 bg-slate-50/80 border-t border-slate-100 flex justify-end gap-2">
                                        <button
                                            onClick={() => openEditModal(item)}
                                            className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold transition cursor-pointer"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-xs font-semibold transition cursor-pointer"
                                        >
                                            Hapus
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Pagination */}
                    {lastPage > 1 && (
                        <div className="bg-white rounded-2xl border border-slate-200/60 p-4 flex justify-between items-center text-xs shadow-sm">
                            <button
                                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                                disabled={page === 1}
                                className="px-3 py-1.5 border bg-white rounded-lg shadow-xs hover:bg-slate-50 disabled:opacity-50 transition cursor-pointer"
                            >
                                Sebelumnya
                            </button>
                            <span className="text-slate-500 font-semibold">Halaman {page} dari {lastPage}</span>
                            <button
                                onClick={() => setPage((p) => Math.min(p + 1, lastPage))}
                                disabled={page === lastPage}
                                className="px-3 py-1.5 border bg-white rounded-lg shadow-xs hover:bg-slate-50 disabled:opacity-50 transition cursor-pointer"
                            >
                                Berikutnya
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Edit / Write News Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
                        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-bold text-slate-800 text-base">
                                {editingItem ? 'Edit Berita / Dokumen' : 'Tulis Berita / Unggah Dokumen Baru'}
                            </h3>
                            <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto flex-grow text-xs sm:text-sm">
                            {formError && (
                                <div className="p-3.5 bg-rose-50 border border-rose-100 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                                    <ShieldAlert size={16} />
                                    <span>{formError}</span>
                                </div>
                            )}

                            {/* Content Type Selector Tabs */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">Tipe Konten Berita</label>
                                <div className="grid grid-cols-3 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setContentType('image')}
                                        className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition cursor-pointer ${
                                            contentType === 'image'
                                                ? 'bg-teal-50 border-teal-500 text-teal-800 font-bold'
                                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                                        }`}
                                    >
                                        <ImageIcon size={18} />
                                        <span className="text-xs">Berita Standar (Gambar)</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setContentType('file')}
                                        className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition cursor-pointer ${
                                            contentType === 'file'
                                                ? 'bg-rose-50 border-rose-500 text-rose-800 font-bold'
                                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                                        }`}
                                    >
                                        <FileText size={18} />
                                        <span className="text-xs">Dokumen Resmi (PDF)</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setContentType('link')}
                                        className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition cursor-pointer ${
                                            contentType === 'link'
                                                ? 'bg-blue-50 border-blue-500 text-blue-800 font-bold'
                                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                                        }`}
                                    >
                                        <ExternalLink size={18} />
                                        <span className="text-xs">Tautan Eksternal</span>
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Judul Artikel / Dokumen *</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full px-3.5 py-2 border rounded-xl text-sm focus:ring-1 focus:ring-teal-500"
                                    placeholder="Ketikkan judul artikel..."
                                    required
                                />
                            </div>

                            {/* Type Specific Fields */}
                            {contentType === 'link' && (
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Alamat Tautan Sumber (URL) *</label>
                                    <input
                                        type="url"
                                        value={externalLink}
                                        onChange={(e) => setExternalLink(e.target.value)}
                                        className="w-full px-3.5 py-2 border rounded-xl text-sm focus:ring-1 focus:ring-teal-500"
                                        placeholder="https://example.com/artikel-terkait"
                                        required
                                    />
                                </div>
                            )}

                            {contentType === 'file' && (
                                <div className="p-4 bg-rose-50/50 rounded-xl border border-rose-100 space-y-2">
                                    <label className="block text-xs font-bold text-rose-900">Upload Berkas PDF (Maks 10MB)</label>
                                    <div className="relative border border-dashed border-rose-300 rounded-xl p-4 text-center bg-white cursor-pointer hover:border-rose-500 transition">
                                        <FileText className="text-rose-500 mx-auto mb-1" size={24} />
                                        <span className="text-xxs text-slate-500 block">Pilih berkas dokumen PDF</span>
                                        <input
                                            type="file"
                                            onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            accept="application/pdf"
                                        />
                                        {pdfFile && (
                                            <div className="mt-2 text-xxs font-bold text-rose-700 bg-rose-100 px-3 py-1 rounded-full inline-block truncate max-w-full">
                                                {pdfFile.name} ({(pdfFile.size / 1024 / 1024).toFixed(2)} MB)
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    {contentType === 'file' ? 'Ringkasan / Catatan Dokumen' : contentType === 'link' ? 'Keterangan Tautan' : 'Isi Konten Berita *'}
                                </label>
                                <textarea
                                    rows={contentType === 'image' ? 6 : 4}
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    className="w-full px-3.5 py-2 border rounded-xl text-sm leading-relaxed focus:ring-1 focus:ring-teal-500"
                                    placeholder="Tulis konten penjelasan lengkap di sini..."
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Cover Image input */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Cover Foto Thumbnail (Max 2MB)</label>
                                    <div className="border border-dashed border-slate-300 p-4 rounded-xl text-center relative bg-slate-50 cursor-pointer flex flex-col items-center justify-center min-h-24 hover:border-teal-500 transition">
                                        <Upload className="text-slate-400 mb-1" size={20} />
                                        <span className="text-xxs text-slate-500">Pilih berkas cover foto</span>
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
                                        <label className="block text-xs font-bold text-slate-700 mb-1">SEO Title Tag (Opsional)</label>
                                        <input
                                            type="text"
                                            value={seoTitle}
                                            onChange={(e) => setSeoTitle(e.target.value)}
                                            className="w-full px-3 py-1.5 border rounded-lg text-xs"
                                            placeholder="Judul untuk mesin pencari Google"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">SEO Description Tag (Opsional)</label>
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
                                <label htmlFor="is_published" className="text-xs font-semibold text-slate-700 cursor-pointer">
                                    Publikasikan artikel/dokumen ini di web publik segera
                                </label>
                            </div>

                            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                                >
                                    {saving ? 'Menyimpan...' : 'Terbitkan Sekarang'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
