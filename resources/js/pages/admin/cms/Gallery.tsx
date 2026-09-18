import React, { useEffect, useState } from 'react';
import { adminApi } from '../../../services/api';
import { scrollToTop } from '../../../lib/utils';
import { Plus, Trash2, X, Upload, CheckCircle2, ShieldAlert } from 'lucide-react';

interface GalleryItem {
    id: number;
    title: string;
    image: string;
    category: string;
    caption: string | null;
}

export default function Gallery() {
    const [gallery, setGallery] = useState<GalleryItem[]>([]);
    const [loading, setLoading] = useState(true);

    const [modalOpen, setModalOpen] = useState(false);
    
    // Form states
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('general');
    const [caption, setCaption] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);

    const [formError, setFormError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const fetchGallery = () => {
        setLoading(true);
        adminApi.getAdminGallery()
            .then((res) => {
                if (res.success) setGallery(res.data || []);
            })
            .catch((err) => console.error(err))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchGallery();
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

    const openUploadModal = () => {
        setTitle('');
        setCategory('general');
        setCaption('');
        setImageFile(null);
        setFormError(null);
        setModalOpen(true);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);

        if (!title.trim() || !category) {
            setFormError('Judul dan kategori wajib diisi.');
            return;
        }

        if (!imageFile) {
            setFormError('File foto wajib diunggah.');
            return;
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('category', category);
        formData.append('caption', caption);
        formData.append('image', imageFile);

        adminApi.createGallery(formData)
            .then((res) => {
                if (res.success) {
                    setSuccessMsg('Foto berhasil diunggah ke galeri.');
                    setModalOpen(false);
                    fetchGallery();
                    scrollToTop();
                    setTimeout(() => setSuccessMsg(null), 3000);
                }
            })
            .catch((err) => {
                console.error(err);
                setFormError('Gagal mengunggah foto. Pastikan ukuran file di bawah 3MB.');
            });
    };

    const handleDelete = (id: number) => {
        if (!confirm('Apakah Anda yakin ingin menghapus foto ini dari galeri?')) return;

        adminApi.deleteGallery(id)
            .then((res) => {
                if (res.success) {
                    setSuccessMsg('Foto berhasil dihapus.');
                    fetchGallery();
                    scrollToTop();
                    setTimeout(() => setSuccessMsg(null), 3000);
                }
            })
            .catch((err) => console.error(err));
    };

    // Helper categories
    const getCategoryLabel = (cat: string) => {
        if (cat === 'fasilitas') return 'Fasilitas';
        if (cat === 'kegiatan') return 'Kegiatan';
        return 'Umum';
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white rounded-xl border border-slate-200/60 p-6 shadow-sm">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">CMS Galeri Foto</h2>
                    <p className="text-slate-500 text-xs mt-1">Mengelola kumpulan foto kegiatan dan fasilitas sekolah untuk konsumsi publik.</p>
                </div>
                <button
                    onClick={openUploadModal}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded transition flex items-center gap-1 shadow"
                >
                    <Plus size={14} /> Unggah Foto
                </button>
            </div>

            {successMsg && (
                <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm font-medium rounded-lg flex items-center gap-2">
                    <CheckCircle2 size={18} />
                    <span>{successMsg}</span>
                </div>
            )}

            {/* Photo list grid */}
            {loading ? (
                <div className="text-center py-16">
                    <div className="w-8 h-8 border-3 border-slate-700 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    <span className="text-slate-400 text-xs">Memuat galeri...</span>
                </div>
            ) : gallery.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200/60 p-12 text-center text-slate-500 shadow-sm">
                    Belum ada foto galeri ditambahkan.
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {gallery.map((item) => (
                        <div key={item.id} className="bg-white rounded-xl border border-slate-200/60 overflow-hidden shadow-sm flex flex-col justify-between group relative">
                            <div className="h-48 overflow-hidden relative">
                                <img
                                    src={(item as any).image_url || (item.image.startsWith('http') ? item.image : item.image.startsWith('/storage') ? item.image : `/storage/${item.image}`)}
                                    alt={item.title}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = '/images/books_abc.png';
                                    }}
                                />
                                <div className="absolute top-2 left-2 px-2 py-0.5 bg-slate-900/85 text-white font-bold text-xxs rounded">
                                    {getCategoryLabel(item.category)}
                                </div>
                            </div>
                            <div className="p-4 flex-grow flex flex-col justify-between gap-3">
                                <div>
                                    <h4 className="font-bold text-slate-800 text-xs sm:text-sm truncate">{item.title}</h4>
                                    {item.caption && <p className="text-xxs text-slate-400 mt-0.5 truncate">{item.caption}</p>}
                                </div>
                                <div className="flex justify-end border-t border-slate-50 pt-3">
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded transition inline-flex"
                                    >
                                        <Trash2 size={13} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Upload Photo Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-lg max-w-md w-full overflow-hidden">
                        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-bold text-slate-800 text-md">Unggah Foto Baru</h3>
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
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Judul Foto *</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full px-3 py-1.5 border rounded-lg text-sm"
                                    placeholder="Contoh: Bermain Outdoor"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Kategori Foto *</label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full px-3 py-1.5 border rounded-lg text-sm bg-white"
                                >
                                    <option value="general">Umum</option>
                                    <option value="fasilitas">Fasilitas Sekolah</option>
                                    <option value="kegiatan">Kegiatan Siswa</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Keterangan / Caption</label>
                                <input
                                    type="text"
                                    value={caption}
                                    onChange={(e) => setCaption(e.target.value)}
                                    className="w-full px-3 py-1.5 border rounded-lg text-sm"
                                    placeholder="Caption singkat foto..."
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Pilih File Foto * (Max 3MB)</label>
                                <div className="border border-dashed border-slate-200 p-6 rounded-lg text-center relative bg-slate-50 cursor-pointer flex flex-col items-center justify-center hover:border-teal-500 transition">
                                    <Upload className="text-slate-400 mb-1" size={24} />
                                    <span className="text-xxs text-slate-400">Pilih berkas gambar JPG/PNG</span>
                                    <input
                                        type="file"
                                        onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        accept="image/*"
                                    />
                                    {imageFile && (
                                        <div className="mt-2 text-xxs font-semibold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full truncate max-w-full">
                                            {imageFile.name}
                                        </div>
                                    )}
                                </div>
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
                                    Unggah
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
