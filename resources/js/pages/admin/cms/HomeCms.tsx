import React, { useState, useEffect } from 'react';
import { adminApi } from '../../../services/api';
import { scrollToTop } from '../../../lib/utils';
import { 
    Sliders, Video, Plus, Edit2, Trash2, CheckCircle, Eye, 
    AlertCircle, Sparkles, MoveUp, MoveDown, ToggleLeft, ToggleRight, 
    Upload, X, RefreshCw, Play, ExternalLink, Image as ImageIcon, Loader2
} from 'lucide-react';

interface SliderItem {
    id: number;
    title: string;
    subtitle: string | null;
    image: string;
    image_url?: string | null;
    link_url: string | null;
    order: number;
    is_active: boolean;
    created_at?: string;
}

export default function HomeCms() {
    const [activeTab, setActiveTab] = useState<'sliders' | 'video'>('sliders');
    
    // Sliders state
    const [sliders, setSliders] = useState<SliderItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [sliderModalOpen, setSliderModalOpen] = useState(false);
    const [editingSlider, setEditingSlider] = useState<SliderItem | null>(null);
    const [sliderTitle, setSliderTitle] = useState('');
    const [sliderSubtitle, setSliderSubtitle] = useState('');
    const [sliderOrder, setSliderOrder] = useState<number>(0);
    const [sliderActive, setSliderActive] = useState(true);
    const [sliderImageFile, setSliderImageFile] = useState<File | null>(null);
    const [sliderImagePreview, setSliderImagePreview] = useState<string | null>(null);
    const [submittingSlider, setSubmittingSlider] = useState(false);
    
    // Settings state (Tagline & YouTube Video)
    const [heroTagline, setHeroTagline] = useState("Berkarakter Qur'an");
    const [aboutVideoUrl, setAboutVideoUrl] = useState("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    const [savingSettings, setSavingSettings] = useState(false);
    
    // Feedback
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Fetch Home CMS data
    const fetchData = () => {
        setLoading(true);
        adminApi.getHomeCms()
            .then((res) => {
                if (res.success && res.data) {
                    setSliders(res.data.sliders || []);
                    if (res.data.hero_tagline) setHeroTagline(res.data.hero_tagline);
                    if (res.data.about_video_url) setAboutVideoUrl(res.data.about_video_url);
                }
            })
            .catch((err) => {
                console.error(err);
                setErrorMessage('Gagal memuat data CMS Beranda.');
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Helper: Extract YouTube ID
    const getYouTubeEmbedUrl = (url: string) => {
        if (!url) return '';
        try {
            let videoId = '';
            if (url.includes('youtube.com/watch')) {
                const match = url.match(/[?&]v=([^&]+)/);
                if (match) videoId = match[1];
            } else if (url.includes('youtu.be/')) {
                const match = url.match(/youtu\.be\/([^?&/]+)/);
                if (match) videoId = match[1];
            } else if (url.includes('youtube.com/embed/')) {
                const match = url.match(/youtube\.com\/embed\/([^?&/]+)/);
                if (match) videoId = match[1];
            } else if (url.includes('youtube.com/shorts/')) {
                const match = url.match(/youtube\.com\/shorts\/([^?&/]+)/);
                if (match) videoId = match[1];
            } else {
                videoId = url.trim();
            }
            if (videoId) {
                return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`;
            }
        } catch (e) {
            console.error('Error parsing YouTube URL', e);
        }
        return '';
    };

    // Open Modal for Add/Edit
    const handleOpenAddModal = () => {
        setEditingSlider(null);
        setSliderTitle('');
        setSliderSubtitle('');
        setSliderOrder(sliders.length + 1);
        setSliderActive(true);
        setSliderImageFile(null);
        setSliderImagePreview(null);
        setErrorMessage(null);
        setSliderModalOpen(true);
    };

    const handleOpenEditModal = (item: SliderItem) => {
        setEditingSlider(item);
        setSliderTitle(item.title);
        setSliderSubtitle(item.subtitle || '');
        setSliderOrder(item.order);
        setSliderActive(item.is_active);
        setSliderImageFile(null);
        setSliderImagePreview(item.image_url || item.image);
        setErrorMessage(null);
        setSliderModalOpen(true);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSliderImageFile(file);
            setSliderImagePreview(URL.createObjectURL(file));
        }
    };

    // Save Slider
    const handleSaveSlider = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!sliderTitle.trim()) {
            setErrorMessage('Judul / label foto slider wajib diisi.');
            return;
        }

        if (!editingSlider && !sliderImageFile) {
            setErrorMessage('Silakan pilih file foto untuk slider baru.');
            return;
        }

        setSubmittingSlider(true);
        setErrorMessage(null);

        const formData = new FormData();
        formData.append('title', sliderTitle);
        formData.append('subtitle', sliderSubtitle);
        formData.append('order', sliderOrder.toString());
        formData.append('is_active', sliderActive ? '1' : '0');
        if (sliderImageFile) {
            formData.append('image', sliderImageFile);
        }

        try {
            if (editingSlider) {
                await adminApi.updateSlider(editingSlider.id, formData);
                setSuccessMessage('Foto slider berhasil diperbarui.');
            } else {
                await adminApi.createSlider(formData);
                setSuccessMessage('Foto slider baru berhasil ditambahkan.');
            }
            setSliderModalOpen(false);
            fetchData();
            setTimeout(() => setSuccessMessage(null), 4000);
        } catch (err: any) {
            console.error(err);
            setErrorMessage(err.response?.data?.message || 'Gagal menyimpan foto slider.');
        } finally {
            setSubmittingSlider(false);
        }
    };

    // Toggle Slider Active
    const handleToggleSlider = async (id: number) => {
        try {
            await adminApi.toggleSlider(id);
            setSliders(sliders.map(s => s.id === id ? { ...s, is_active: !s.is_active } : s));
        } catch (err) {
            console.error(err);
            alert('Gagal mengubah status aktif slider.');
        }
    };

    // Delete Slider
    const handleDeleteSlider = async (id: number) => {
        if (!window.confirm('Apakah Anda yakin ingin menghapus foto slider ini?')) return;
        try {
            await adminApi.deleteSlider(id);
            setSliders(sliders.filter(s => s.id !== id));
            setSuccessMessage('Foto slider berhasil dihapus.');
            setTimeout(() => setSuccessMessage(null), 4000);
        } catch (err) {
            console.error(err);
            alert('Gagal menghapus foto slider.');
        }
    };

    // Save YouTube Video & Tagline Settings
    const handleSaveSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        setSavingSettings(true);
        setErrorMessage(null);
        setSuccessMessage(null);

        try {
            await adminApi.updateHomeSettings({
                hero_tagline: heroTagline,
                about_video_url: aboutVideoUrl,
            });
            setSuccessMessage('Pengaturan Video Tentang Kami dan Tagline Beranda berhasil disimpan!');
            scrollToTop();
            setTimeout(() => setSuccessMessage(null), 4000);
        } catch (err: any) {
            console.error(err);
            setErrorMessage(err.response?.data?.message || 'Gagal menyimpan pengaturan beranda.');
            scrollToTop();
        } finally {
            setSavingSettings(false);
        }
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
                <div>
                    <h1 className="text-xl sm:text-2xl font-display font-extrabold text-slate-800 flex items-center gap-2">
                        <Sliders size={24} className="text-teal-600" />
                        CMS Beranda (Landing Page)
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                        Kelola foto slider beranda otomatis dan video YouTube bagian Tentang Kami.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={fetchData}
                        disabled={loading}
                        className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition flex items-center gap-1.5 text-xs font-bold cursor-pointer"
                        title="Segarkan data"
                    >
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                        <span className="hidden sm:inline">Segarkan</span>
                    </button>
                    {activeTab === 'sliders' && (
                        <button
                            type="button"
                            onClick={handleOpenAddModal}
                            className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm transition cursor-pointer"
                        >
                            <Plus size={16} />
                            <span>Tambah Foto Slider</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Alert Messages */}
            {successMessage && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-2xs">
                    <CheckCircle size={18} className="text-emerald-600 flex-shrink-0" />
                    <span>{successMessage}</span>
                </div>
            )}
            {errorMessage && (
                <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-2xs">
                    <AlertCircle size={18} className="text-rose-600 flex-shrink-0" />
                    <span>{errorMessage}</span>
                </div>
            )}

            {/* Tab Navigation */}
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <button
                    type="button"
                    onClick={() => setActiveTab('sliders')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        activeTab === 'sliders'
                            ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                            : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                >
                    <ImageIcon size={16} />
                    <span>1. Foto Slider Hero Beranda ({sliders.length})</span>
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab('video')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        activeTab === 'video'
                            ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                            : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                >
                    <Video size={16} />
                    <span>2. Video YouTube Tentang Kami & Tagline</span>
                </button>
            </div>

            {/* TAB 1: SLIDERS CONTENT */}
            {activeTab === 'sliders' && (
                <div className="space-y-6">
                    {loading ? (
                        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center flex flex-col items-center justify-center gap-3">
                            <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-slate-500 text-xs sm:text-sm font-medium">Memuat daftar foto slider...</p>
                        </div>
                    ) : sliders.length === 0 ? (
                        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center flex flex-col items-center justify-center gap-3">
                            <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
                                <ImageIcon size={28} />
                            </div>
                            <h3 className="font-bold text-slate-800 text-sm">Belum ada foto slider yang ditambahkan</h3>
                            <p className="text-slate-500 text-xs max-w-md">
                                Tambahkan foto slider untuk menampilkan slide foto otomatis di bagian atas (Hero) halaman utama Beranda.
                            </p>
                            <button
                                type="button"
                                onClick={handleOpenAddModal}
                                className="mt-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 cursor-pointer"
                            >
                                <Plus size={16} /> Tambah Foto Sekarang
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {sliders.map((slider) => (
                                <div 
                                    key={slider.id} 
                                    className={`bg-white rounded-2xl border transition-all overflow-hidden shadow-xs hover:shadow-md flex flex-col ${
                                        slider.is_active ? 'border-slate-200/90' : 'border-slate-200 opacity-60 bg-slate-50/50'
                                    }`}
                                >
                                    {/* Image Preview Container */}
                                    <div className="h-48 w-full bg-slate-100 relative overflow-hidden group">
                                        <img
                                            src={slider.image_url || slider.image}
                                            alt={slider.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            onError={(e) => {
                                                (e.target as HTMLElement).setAttribute('src', '/images/toy_train_hero.png');
                                            }}
                                        />
                                        
                                        {/* Order Badge */}
                                        <div className="absolute top-3 left-3 px-2.5 py-1 bg-slate-900/80 backdrop-blur-xs text-white text-xxs font-extrabold rounded-lg shadow-sm">
                                            Urutan: #{slider.order}
                                        </div>

                                        {/* Active Status Badge */}
                                        <div className="absolute top-3 right-3">
                                            <span className={`px-2.5 py-1 text-xxs font-extrabold rounded-lg shadow-sm uppercase ${
                                                slider.is_active 
                                                    ? 'bg-emerald-500 text-white' 
                                                    : 'bg-rose-500 text-white'
                                            }`}>
                                                {slider.is_active ? 'Aktif' : 'Non-aktif'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Slider Card Info */}
                                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                                        <div>
                                            <h4 className="font-bold text-slate-800 text-sm leading-snug line-clamp-1">
                                                {slider.title}
                                            </h4>
                                            {slider.subtitle && (
                                                <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                                                    {slider.subtitle}
                                                </p>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                                            <button
                                                type="button"
                                                onClick={() => handleToggleSlider(slider.id)}
                                                className={`text-xxs font-bold px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1.5 cursor-pointer ${
                                                    slider.is_active
                                                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                                                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                                                }`}
                                            >
                                                {slider.is_active ? <ToggleRight size={14} className="text-emerald-600" /> : <ToggleLeft size={14} />}
                                                <span>{slider.is_active ? 'Nonaktifkan' : 'Aktifkan'}</span>
                                            </button>

                                            <div className="flex items-center gap-1.5">
                                                <button
                                                    type="button"
                                                    onClick={() => handleOpenEditModal(slider)}
                                                    className="p-1.5 text-slate-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition cursor-pointer"
                                                    title="Edit Foto & Keterangan"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteSlider(slider.id)}
                                                    className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                                                    title="Hapus Foto"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* TAB 2: VIDEO YOUTUBE & TAGLINE CONTENT */}
            {activeTab === 'video' && (
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
                    <form onSubmit={handleSaveSettings} className="space-y-8 max-w-4xl">
                        {/* Section A: Hero Tagline */}
                        <div className="space-y-3">
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                                Tagline Beranda (Teks Sorotan Kuning Hero) *
                            </label>
                            <input
                                type="text"
                                value={heroTagline}
                                onChange={(e) => setHeroTagline(e.target.value)}
                                placeholder="Contoh: Berkarakter Qur'an"
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-semibold text-slate-800"
                                required
                            />
                            <p className="text-xxs text-slate-400">
                                Teks ini ditampilkan pada judul utama hero beranda dengan garis sorotan kuning di bagian atas halaman utama.
                            </p>
                        </div>

                        {/* Section B: YouTube Video URL */}
                        <div className="space-y-4 pt-4 border-t border-slate-100">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                    Link / URL Video YouTube "Tentang Kami" *
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="url"
                                        value={aboutVideoUrl}
                                        onChange={(e) => setAboutVideoUrl(e.target.value)}
                                        placeholder="Contoh: https://www.youtube.com/watch?v=dQw4w9WgXcQ atau https://youtu.be/..."
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800"
                                        required
                                    />
                                </div>
                                <p className="text-xxs text-slate-400 mt-1">
                                    Dapat memasukkan link lengkap YouTube (seperti <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700 font-mono">https://www.youtube.com/watch?v=...</code> atau <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700 font-mono">https://youtu.be/...</code>).
                                </p>
                            </div>

                            {/* Live Video Preview Frame */}
                            <div className="bg-slate-50 p-4 sm:p-6 rounded-2xl border border-slate-200">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                        <Play size={14} className="text-rose-500 fill-rose-500" />
                                        Live Preview Video YouTube di Beranda:
                                    </span>
                                    {aboutVideoUrl && (
                                        <a
                                            href={aboutVideoUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-xxs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1"
                                        >
                                            <span>Buka YouTube</span>
                                            <ExternalLink size={12} />
                                        </a>
                                    )}
                                </div>

                                {getYouTubeEmbedUrl(aboutVideoUrl) ? (
                                    <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-md bg-black border border-slate-300">
                                        <iframe
                                            src={getYouTubeEmbedUrl(aboutVideoUrl)}
                                            title="YouTube Video Preview"
                                            className="w-full h-full"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        />
                                    </div>
                                ) : (
                                    <div className="w-full h-48 bg-slate-200/70 rounded-xl border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 gap-2">
                                        <Video size={32} />
                                        <span className="text-xs">Masukkan link YouTube yang valid untuk melihat preview video.</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end pt-4 border-t border-slate-100">
                            <button
                                type="submit"
                                disabled={savingSettings}
                                className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                            >
                                {savingSettings ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        <span>Menyimpan Pengaturan...</span>
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle size={16} />
                                        <span>Simpan Pengaturan Beranda</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* SLIDER MODAL (TAMBAH / EDIT) */}
            {sliderModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
                    <div 
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <ImageIcon size={18} className="text-teal-400" />
                                <h3 className="text-sm sm:text-base font-bold text-white">
                                    {editingSlider ? 'Edit Foto Slider' : 'Tambah Foto Slider Baru'}
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSliderModalOpen(false)}
                                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Modal Form */}
                        <form onSubmit={handleSaveSlider} className="p-6 space-y-4">
                            {/* Image Picker */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                                    Foto Slider * {editingSlider && <span className="text-xxs text-slate-400 font-normal">(Kosongkan jika tidak mengganti foto)</span>}
                                </label>
                                
                                {sliderImagePreview ? (
                                    <div className="relative mb-2 rounded-xl overflow-hidden border border-slate-200 h-44 w-full bg-slate-100">
                                        <img
                                            src={sliderImagePreview}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                        />
                                        <label
                                            htmlFor="slider-file-input"
                                            className="absolute bottom-2 right-2 px-3 py-1.5 bg-slate-900/80 hover:bg-slate-900 text-white rounded-lg text-xxs font-bold flex items-center gap-1.5 cursor-pointer backdrop-blur-xs transition"
                                        >
                                            <Upload size={12} />
                                            <span>Ganti Foto</span>
                                        </label>
                                    </div>
                                ) : (
                                    <label
                                        htmlFor="slider-file-input"
                                        className="border-2 border-dashed border-slate-300 hover:border-teal-500 rounded-xl p-6 flex flex-col items-center justify-center gap-2 text-slate-500 bg-slate-50 hover:bg-teal-50/20 cursor-pointer transition"
                                    >
                                        <Upload size={24} className="text-teal-600" />
                                        <span className="text-xs font-bold text-slate-700">Pilih / Unggah Berkas Foto</span>
                                        <span className="text-xxs text-slate-400">Format: JPG, PNG, WEBP (Maks 5MB)</span>
                                    </label>
                                )}
                                <input
                                    id="slider-file-input"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </div>

                            {/* Title */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                                    Judul / Label Foto *
                                </label>
                                <input
                                    type="text"
                                    value={sliderTitle}
                                    onChange={(e) => setSliderTitle(e.target.value)}
                                    placeholder="Contoh: Belajar Seru & Ceria"
                                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                                    required
                                />
                            </div>

                            {/* Subtitle */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                                    Keterangan Singkat (Subtitle)
                                </label>
                                <input
                                    type="text"
                                    value={sliderSubtitle}
                                    onChange={(e) => setSliderSubtitle(e.target.value)}
                                    placeholder="Contoh: Suasana belajar yang penuh kasih sayang"
                                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                                />
                            </div>

                            {/* Order & Active */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                                        Urutan Tampil
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={sliderOrder}
                                        onChange={(e) => setSliderOrder(parseInt(e.target.value) || 0)}
                                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                                        Status Tampil
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setSliderActive(!sliderActive)}
                                        className={`w-full py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                                            sliderActive 
                                                ? 'bg-emerald-50 border-emerald-300 text-emerald-700' 
                                                : 'bg-slate-100 border-slate-300 text-slate-500'
                                        }`}
                                    >
                                        {sliderActive ? <CheckCircle size={14} /> : <X size={14} />}
                                        <span>{sliderActive ? 'Aktif (Ditampilkan)' : 'Nonaktif'}</span>
                                    </button>
                                </div>
                            </div>

                            {/* Modal Actions */}
                            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                                <button
                                    type="button"
                                    onClick={() => setSliderModalOpen(false)}
                                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={submittingSlider}
                                    className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                                >
                                    {submittingSlider ? (
                                        <>
                                            <Loader2 size={14} className="animate-spin" />
                                            <span>Menyimpan...</span>
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle size={14} />
                                            <span>{editingSlider ? 'Simpan Perubahan' : 'Tambah Foto'}</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
