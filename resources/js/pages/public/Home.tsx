import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ArrowRight, Calendar, Sparkles, Heart, CheckCircle2, ChevronRight, 
    ChevronLeft, Award, Camera, Image as ImageIcon, Play, FileDown, Download, ExternalLink, X 
} from 'lucide-react';
import { cmsApi } from '../../services/api';
import CurriculumSection from '../../components/CurriculumSection';

interface AnnouncementItem {
    id: number;
    title: string;
    content: string;
    publish_date: string;
}

interface HomeNewsItem {
    id: number;
    title: string;
    slug: string;
    content: string;
    image: string | null;
    image_url?: string | null;
    created_at: string;
}

interface HomeGalleryItem {
    id: number;
    title: string;
    image: string;
    image_url?: string | null;
    category: string;
    caption: string | null;
}

interface SliderItem {
    id: number;
    title: string;
    subtitle: string | null;
    image: string;
    image_url?: string | null;
    link_url?: string | null;
    order?: number;
    is_active?: boolean;
}

export default function Home() {
    const navigate = useNavigate();
    const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
    const [latestNews, setLatestNews] = useState<HomeNewsItem[]>([]);
    const [latestGallery, setLatestGallery] = useState<HomeGalleryItem[]>([]);
    const [heroTagline, setHeroTagline] = useState<string>("Berkarakter Qur'an");
    const [aboutVideoUrl, setAboutVideoUrl] = useState<string>("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    const [ppdbBadgeText, setPpdbBadgeText] = useState<string>("Penerimaan Murid Baru (PPDB) 2026/2027 Dibuka!");
    const [ppdbPoster, setPpdbPoster] = useState<string | null>(null);
    const [showPosterModal, setShowPosterModal] = useState<boolean>(false);
    const [sliders, setSliders] = useState<SliderItem[]>([]);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const [loading, setLoading] = useState(true);

    const defaultSliders: SliderItem[] = [
        {
            id: 1,
            title: 'Belajar Seru & Ceria',
            subtitle: 'Suasana belajar yang penuh kasih sayang',
            image: '/images/toy_train_hero.png',
            image_url: '/images/toy_train_hero.png',
            is_active: true,
        },
        {
            id: 2,
            title: 'Generasi Cerdas & Mandiri',
            subtitle: 'Kurikulum Islam terpadu dengan stimulasi holistik',
            image: '/images/books_abc.png',
            image_url: '/images/books_abc.png',
            is_active: true,
        }
    ];

    const activeSliders = sliders.filter(s => s.is_active !== false);
    const displaySliders = activeSliders.length > 0 ? activeSliders : defaultSliders;

    // Helper: Parse YouTube embed URL
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
            console.error('Error parsing YouTube link:', e);
        }
        return '';
    };

    // Auto-scroll / Auto-slide timer for Hero Carousel
    useEffect(() => {
        if (displaySliders.length <= 1 || isHovered) return;
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % displaySliders.length);
        }, 4500);
        return () => clearInterval(timer);
    }, [displaySliders.length, isHovered]);

    useEffect(() => {
        Promise.all([
            cmsApi.getHomeData(),
            cmsApi.getNews(1).catch(() => ({ success: false, data: { data: [] } })),
            cmsApi.getGallery('all').catch(() => ({ success: false, data: [] })),
            cmsApi.getSettings().catch(() => ({ success: false, data: null })),
        ])
            .then(([homeRes, newsRes, galleryRes, settingsRes]) => {
                if (homeRes.success && homeRes.data) {
                    setAnnouncements(homeRes.data.announcements || []);
                    if (homeRes.data.sliders && homeRes.data.sliders.length > 0) {
                        setSliders(homeRes.data.sliders);
                    }
                    if (homeRes.data.hero_tagline) {
                        setHeroTagline(homeRes.data.hero_tagline);
                    }
                    if (homeRes.data.about_video_url) {
                        setAboutVideoUrl(homeRes.data.about_video_url);
                    }
                }
                if (newsRes.success && newsRes.data) {
                    const items = newsRes.data.data || newsRes.data || [];
                    setLatestNews(items.slice(0, 3));
                }
                if (galleryRes.success && galleryRes.data) {
                    setLatestGallery(galleryRes.data.slice(0, 4));
                }
                if (settingsRes?.success && settingsRes.data) {
                    if (settingsRes.data.ppdb_badge_text) {
                        setPpdbBadgeText(settingsRes.data.ppdb_badge_text);
                    }
                    if (settingsRes.data.ppdb_poster) {
                        setPpdbPoster(settingsRes.data.ppdb_poster);
                    }
                }
            })
            .catch((err) => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const programsList = [
        {
            id: 'pg',
            name: 'Kelompok Bermain (Playgroup)',
            age: 'Usia 3 - 4 Tahun',
            fee: 'Rp 450.000 / Bulan',
            description: 'Program yang dirancang khusus untuk anak usia 3 - 4 tahun demi mengoptimalkan masa keemasan tumbuh kembang anak melalui stimulasi sensori motorik, sosialisasi awal, dan pengenalan adab keislaman dasar dalam suasana bermain yang penuh kasih sayang.',
            materi: [
                'Stimulasi Sensomotorik & Motorik Kasar',
                'Sosialisasi awal & kemandirian toilet training',
                'Pengenalan huruf hijaiyah dasar secara menyenangkan'
            ]
        },
        {
            id: 'tka',
            name: 'Taman Kanak-Kanak A (TK A)',
            age: 'Usia 4 - 5 Tahun',
            fee: 'Rp 600.000 / Bulan',
            description: 'Program pendidikan terstruktur untuk anak usia 4 - 5 tahun yang memadukan pembiasaan ibadah praktis, pengenalan hafalan surat pendek, serta pengembangan kecerdasan kognitif verbal dan logika awal secara menyenangkan tanpa paksaan.',
            materi: [
                'Hafalan Surat Pendek (Juz Amma) dan Doa Harian',
                'Pengenalan konsep membaca, menulis, berhitung (calistung) tanpa paksaan',
                'Pengembangan kemandirian & tanggung jawab tugas'
            ]
        },
        {
            id: 'tkb',
            name: 'Taman Kanak-Kanak B (TK B)',
            age: 'Usia 5 - 6 Tahun',
            fee: 'Rp 650.000 / Bulan',
            description: 'Program persiapan matang untuk anak usia 5 - 6 tahun dalam menghadapi transisi menuju Sekolah Dasar (SD), memperkuat fondasi keagamaan (shalat mandiri, tilawah dasar), serta melatih kemandirian dan berpikir kritis logis secara interaktif.',
            materi: [
                'Pemantapan bacaan & hafalan Al-Qur\'an Juz 30',
                'Kemampuan membaca lancar, menulis rapi, dan matematika dasar logis',
                'Praktik manasik haji cilik dan bakti sosial'
            ]
        }
    ];

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-500 font-medium font-sans">Memuat beranda...</p>
            </div>
        );
    }

    const currentSlideData = displaySliders[currentSlide] || displaySliders[0];

    return (
        <div className="flex flex-col min-h-screen bg-white font-sans overflow-x-hidden">
            
            {/* 1. Hero Section (Slider Otomatis Beranda) */}
            <section className="relative py-16 sm:py-24 bg-gradient-to-br from-teal-50/30 to-amber-50/10 overflow-hidden">
                {/* Background Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30 pointer-events-none" />
                
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                        
                        {/* Left Column Content */}
                        <div className="lg:col-span-7 space-y-6 text-left">
                            <div className="inline-flex items-center gap-1.5 px-4 py-2 bg-pink-50 text-pink-700 text-xs font-bold rounded-full animate-bounce shadow-xs">
                                <Sparkles size={14} className="text-pink-500" />
                                <span>{ppdbBadgeText}</span>
                            </div>
                            
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-800 leading-tight">
                                Membentuk Generasi <br />
                                <span className="relative inline-block text-teal-600 z-10">
                                    {heroTagline}
                                    <span className="absolute bottom-2 left-0 w-full h-3 bg-yellow-300 -z-10 rounded-full opacity-70"></span>
                                </span> <br />
                                Cerdas, Mandiri & <br />
                                Berakhlak Mulia
                            </h1>

                            <p className="text-slate-505 text-sm sm:text-md md:text-lg leading-relaxed max-w-2xl">
                                Selamat datang di <strong>KB-TK IT Taman Robbani</strong>. Kami menghadirkan pendidikan anak usia dini berbasis nilai-nilai Islami yang dipadukan dengan konsep bermain ramah anak yang merangsang kreativitas, akhlak, dan kemandirian sejak dini.
                            </p>

                            <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 pt-2">
                                <Link
                                    to="/ppdb"
                                    className="w-full sm:w-auto px-7 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl sm:rounded-full transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer transform hover:-translate-y-0.5"
                                >
                                    <span>Daftar Sekarang</span>
                                    <ArrowRight size={18} />
                                </Link>
                                <Link
                                    to="/ppdb"
                                    className="w-full sm:w-auto px-7 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl sm:rounded-full transition-all duration-300 shadow-2xs hover:shadow-xs text-sm sm:text-base flex items-center justify-center cursor-pointer"
                                >
                                    Informasi Pendaftaran
                                </Link>
                            </div>

                            {/* Eye-catching PPDB Poster & Brochure Card */}
                            <div className="pt-2 max-w-xl">
                                <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-50/90 via-amber-50 to-orange-50/70 border border-amber-200/90 rounded-2xl sm:rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm hover:shadow-md transition-all">
                                    <div className="flex items-center gap-3.5">
                                        <div className="w-11 h-11 rounded-2xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                                            <FileDown size={22} className="animate-pulse" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="text-xs sm:text-sm font-extrabold text-slate-800">
                                                    Brosur & Poster Resmi PPDB
                                                </h4>
                                                <span className="px-2 py-0.5 bg-amber-200 text-amber-900 text-[10px] font-black rounded-full uppercase tracking-wider">
                                                    PDF / Foto
                                                </span>
                                            </div>
                                            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 leading-snug">
                                                Unduh panduan lengkap pendaftaran, syarat berkas & rincian biaya.
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <a
                                        href="/api/v1/public/ppdb/poster/download"
                                        download="Poster -PPDB-tamanrabbani"
                                        className="w-full sm:w-auto px-5 py-2.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl sm:rounded-2xl shadow-xs hover:shadow-md transition flex items-center justify-center gap-2 flex-shrink-0 cursor-pointer"
                                        title="Unduh Poster / Brosur PPDB"
                                    >
                                        <Download size={16} />
                                        <span>Unduh Poster</span>
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Right Column Content: Dynamic Auto-Slider */}
                        <div className="lg:col-span-5 relative flex justify-center">
                            <div 
                                className="relative w-full max-w-[440px]"
                                onMouseEnter={() => setIsHovered(true)}
                                onMouseLeave={() => setIsHovered(false)}
                            >
                                <div className="absolute -left-4 -bottom-4 w-28 h-28 rounded-full bg-yellow-400/90 -z-10 animate-pulse" />
                                
                                <div className="bg-white p-4 rounded-3xl shadow-xl relative overflow-hidden border border-slate-100">
                                    {/* Slider Image Container */}
                                    <div className="rounded-2xl overflow-hidden h-72 sm:h-80 w-full relative bg-slate-100">
                                        <AnimatePresence mode="wait">
                                            <motion.img
                                                key={currentSlideData.id || currentSlide}
                                                src={currentSlideData.image_url || currentSlideData.image}
                                                alt={currentSlideData.title}
                                                initial={{ opacity: 0, x: 40 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -40 }}
                                                transition={{ duration: 0.5, ease: 'easeInOut' }}
                                                className="w-full h-full object-cover absolute inset-0"
                                                onError={(e) => {
                                                    (e.target as HTMLElement).setAttribute('src', '/images/toy_train_hero.png');
                                                }}
                                            />
                                        </AnimatePresence>
                                        
                                        <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-yellow-450 text-slate-800 flex items-center justify-center shadow-md z-10">
                                            <Award size={18} className="fill-slate-800" />
                                        </div>

                                        {/* Slider Navigation Arrows (Hover) */}
                                        {displaySliders.length > 1 && (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={() => setCurrentSlide((prev) => (prev - 1 + displaySliders.length) % displaySliders.length)}
                                                    className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white flex items-center justify-center transition opacity-0 group-hover:opacity-100 hover:opacity-100 z-20 backdrop-blur-xs cursor-pointer"
                                                    aria-label="Previous Slide"
                                                >
                                                    <ChevronLeft size={18} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setCurrentSlide((prev) => (prev + 1) % displaySliders.length)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white flex items-center justify-center transition opacity-0 group-hover:opacity-100 hover:opacity-100 z-20 backdrop-blur-xs cursor-pointer"
                                                    aria-label="Next Slide"
                                                >
                                                    <ChevronRight size={18} />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                    
                                    {/* Slider Caption Box */}
                                    <div className="mt-4 p-4 bg-slate-50 rounded-2xl flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3 truncate">
                                            <div className="w-10 h-10 rounded-full bg-pink-100 text-pink-650 flex items-center justify-center flex-shrink-0">
                                                <Heart size={20} className="fill-pink-650" />
                                            </div>
                                            <div className="text-left truncate">
                                                <h4 className="font-bold text-slate-800 text-xs sm:text-sm font-sans truncate">
                                                    {currentSlideData.title}
                                                </h4>
                                                <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5 truncate">
                                                    {currentSlideData.subtitle || 'Suasana belajar yang penuh kasih'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Dot Indicators */}
                                        {displaySliders.length > 1 && (
                                            <div className="flex items-center gap-1.5 flex-shrink-0">
                                                {displaySliders.map((_, idx) => (
                                                    <button
                                                        key={idx}
                                                        type="button"
                                                        onClick={() => setCurrentSlide(idx)}
                                                        className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                                                            currentSlide === idx 
                                                                ? 'w-6 bg-teal-600' 
                                                                : 'w-2 bg-slate-200 hover:bg-slate-300'
                                                        }`}
                                                        aria-label={`Go to slide ${idx + 1}`}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* 2. Tentang Kami Section (Video YouTube Interaktif) */}
            <section className="py-20 bg-white relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                        
                        {/* Left Video Player Container */}
                        <div className="lg:col-span-5 relative flex justify-center">
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="relative w-full max-w-[440px]"
                            >
                                <div className="absolute -right-4 -bottom-4 w-32 h-32 rounded-full bg-yellow-400/90 -z-10 animate-pulse" />

                                <div className="rounded-3xl overflow-hidden shadow-2xl bg-white p-3 border border-slate-100">
                                    <div className="relative w-full aspect-video sm:h-72 rounded-2xl overflow-hidden bg-slate-900 shadow-inner">
                                        {getYouTubeEmbedUrl(aboutVideoUrl) ? (
                                            <iframe
                                                src={getYouTubeEmbedUrl(aboutVideoUrl)}
                                                title="Video Profil KB-TK IT Taman Robbani"
                                                className="w-full h-full"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                            />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                                                <Play size={44} className="text-rose-500 fill-rose-500 mb-2" />
                                                <span className="text-xs font-semibold text-white">Video Profil Sekolah</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="mt-3 px-3 py-1.5 flex items-center justify-between text-slate-500 text-xxs font-semibold">
                                        <span className="flex items-center gap-1.5 text-slate-700 font-bold">
                                            <Play size={12} className="text-rose-500 fill-rose-500" /> Profil Singkat Taman Robbani
                                        </span>
                                        <span className="text-teal-600 font-bold">Video Edukasi</span>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Right Content */}
                        <div className="lg:col-span-7 space-y-6 text-left">
                            <span className="inline-block px-3 py-1 bg-pink-50 text-pink-600 text-xxs font-extrabold uppercase tracking-widest rounded">
                                TENTANG KAMI
                            </span>
                            
                            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800 leading-tight">
                                Mendidik dengan Hati, <br />
                                Membentuk Karakter Qur'an
                            </h2>

                            <p className="text-slate-500 text-xs sm:text-sm leading-relaxed font-sans">
                                KB-TK IT (Kelompok Bermain & Taman Kanak-Kanak Islam Terpadu) Taman Robbani didirikan dengan komitmen kuat untuk menghadirkan pendidikan anak usia dini yang berkualitas, mengintegrasikan nilai-nilai luhur keislaman dengan stimulasi perkembangan anak yang komprehensif. Sejak berdirinya, kami telah mendampingi ratusan anak tumbuh menjadi generasi yang mandiri, kreatif, berakhlak mulia, dan mencintai Al-Qur'an melalui metode pembelajaran yang menyenangkan dan ramah anak.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs sm:text-sm font-semibold text-slate-700">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="text-teal-650 flex-shrink-0" size={18} />
                                    <span>Stimulasi Tumbuh Kembang Maksimal</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="text-teal-650 flex-shrink-0" size={18} />
                                    <span>Pembiasaan Ibadah dan Hafalan</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="text-teal-650 flex-shrink-0" size={18} />
                                    <span>Guru Berpengalaman & Sabar</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="text-teal-650 flex-shrink-0" size={18} />
                                    <span>Lingkungan Belajar Bersih & Aman</span>
                                </div>
                            </div>

                            <div className="pt-4">
                                <Link
                                    to="/profil"
                                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-teal-650 hover:text-teal-700 transition"
                                >
                                    <span>Selengkapnya tentang Visi & Misi Kami</span>
                                    <ChevronRight size={16} />
                                </Link>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* 3. Program Pendidikan Section (Gambar 3 - Cards Only) */}
            <section className="py-20 bg-slate-50 relative border-t border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 text-xxs font-extrabold uppercase tracking-widest rounded-full mb-3">
                            PROGRAM UNGGULAN
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800">Pilihan Program Pendidikan</h2>
                        <p className="mt-4 text-slate-505 text-xs sm:text-sm leading-relaxed">
                            Kami membagi kelas berdasarkan kelompok usia demi mengoptimalkan stimulus belajar anak yang sesuai dengan tahap tumbuh kembangnya.
                        </p>
                    </div>

                    {/* Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {programsList.map((prog) => (
                            <motion.div
                                key={prog.id}
                                whileHover={{ y: -8, scale: 1.02 }}
                                onClick={() => navigate('/program', { state: { selectedId: prog.id } })}
                                className="bg-white rounded-3xl p-6 flex flex-col justify-between shadow-md hover:shadow-lg cursor-pointer transition-all duration-300 text-left border-none"
                            >
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="px-3 py-1 bg-teal-50 text-teal-800 text-xxs font-bold rounded-full">
                                            {prog.age}
                                        </span>
                                    </div>
                                    
                                    <h3 className="text-md sm:text-lg font-bold text-slate-800">{prog.name}</h3>
                                    <p className="text-slate-500 text-xs leading-relaxed line-clamp-3">{prog.description}</p>
                                    
                                    <div className="border-t border-slate-100 pt-4 space-y-2">
                                        <span className="text-xxs font-bold text-slate-400 block uppercase tracking-wider">Fokus Utama:</span>
                                        <ul className="space-y-1.5 text-xs text-slate-600">
                                            {prog.materi.map((mat, i) => (
                                                <li key={i} className="flex items-start gap-1.5">
                                                    <span className="text-teal-500 mt-0.5">•</span>
                                                    <span className="line-clamp-1">{mat}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                <div className="border-t border-slate-100 mt-6 pt-4 flex justify-end items-center">
                                    <button className="text-xxs font-bold text-teal-650 hover:text-teal-700 flex items-center gap-1">
                                        <span>Lihat Detail Kelas</span>
                                        <ChevronRight size={14} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* 5 Kategori Kurikulum & Pembiasaan Terpadu */}
                    <div className="mt-16">
                        <CurriculumSection />
                    </div>

                </div>
            </section>

            {/* 4. Berita & Kegiatan Terkini Section */}
            {latestNews.length > 0 && (
                <section className="py-20 bg-white border-t border-slate-100">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
                            <div>
                                <span className="inline-block px-3 py-1 bg-teal-50 text-teal-700 text-xxs font-extrabold uppercase tracking-widest rounded-full mb-2">
                                    KABAR SEKOLAH
                                </span>
                                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800">Berita & Kegiatan</h2>
                                <p className="mt-2 text-slate-500 text-xs sm:text-sm">Ikuti aktivitas, prestasi, dan pengumuman terbaru dari sekolah kami.</p>
                            </div>
                            <Link
                                to="/berita"
                                className="mt-4 md:mt-0 inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-teal-650 hover:text-teal-700 transition"
                            >
                                <span>Lihat Semua Berita</span>
                                <ChevronRight size={16} />
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {latestNews.map((item) => {
                                const imgSrc = item.image_url || (item.image?.startsWith('http') ? item.image : item.image?.startsWith('/storage') ? item.image : `/storage/${item.image}`);
                                return (
                                    <article
                                        key={item.id}
                                        onClick={() => navigate(`/berita/${item.slug}`)}
                                        className="bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer border border-slate-100"
                                    >
                                        <div>
                                            <div className="h-48 bg-slate-100 overflow-hidden relative">
                                                {item.image ? (
                                                    <img
                                                        src={imgSrc}
                                                        alt={item.title}
                                                        className="w-full h-full object-cover hover:scale-105 transition duration-500"
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).src = '/images/toy_train_hero.png';
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-400 font-semibold uppercase bg-slate-100 text-xs">
                                                        KB-TK IT Taman Robbani
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-6">
                                                <div className="flex items-center gap-2 text-xxs text-slate-400 mb-2 font-semibold">
                                                    <Calendar size={13} className="text-teal-600" />
                                                    <span>{new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                                </div>
                                                <h3 className="text-base font-bold text-slate-800 line-clamp-2 hover:text-teal-650 transition">
                                                    {item.title}
                                                </h3>
                                                <p className="mt-2 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                                                    {item.content.replace(/<[^>]*>?/gm, '')}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="px-6 pb-6 pt-2 border-t border-slate-50 flex items-center gap-1 text-xs font-bold text-teal-650">
                                            <span>Baca Selengkapnya</span>
                                            <ArrowRight size={14} />
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    </div>
                </section>
            )}

            {/* 5. Galeri & Dokumentasi Terkini Section */}
            {latestGallery.length > 0 && (
                <section className="py-20 bg-slate-50 border-t border-slate-100">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
                            <div>
                                <span className="inline-block px-3 py-1 bg-amber-100 text-amber-800 text-xxs font-extrabold uppercase tracking-widest rounded-full mb-2">
                                    DOKUMENTASI
                                </span>
                                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800">Galeri Kegiatan & Fasilitas</h2>
                                <p className="mt-2 text-slate-500 text-xs sm:text-sm">Dokumentasi momen belajar dan kebersamaan di KB-TK IT Taman Robbani.</p>
                            </div>
                            <Link
                                to="/galeri"
                                className="mt-4 md:mt-0 inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-teal-650 hover:text-teal-700 transition"
                            >
                                <span>Lihat Semua Foto</span>
                                <ChevronRight size={16} />
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                            {latestGallery.map((img) => {
                                const imgSrc = img.image_url || (img.image.startsWith('http') ? img.image : img.image.startsWith('/storage') ? img.image : `/storage/${img.image}`);
                                return (
                                    <div
                                        key={img.id}
                                        onClick={() => navigate('/galeri')}
                                        className="group relative h-60 rounded-3xl overflow-hidden bg-white shadow-md cursor-pointer border border-slate-100"
                                    >
                                        <img
                                            src={imgSrc}
                                            alt={img.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = '/images/books_abc.png';
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent opacity-90 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                                            <span className="text-[10px] uppercase font-bold text-amber-300 tracking-wider">
                                                {img.category}
                                            </span>
                                            <h4 className="font-bold text-white text-xs truncate mt-0.5">
                                                {img.title}
                                            </h4>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}
