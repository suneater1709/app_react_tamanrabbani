import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    School, BookOpen, GraduationCap, HeartHandshake, Activity, 
    ChevronRight, X, Layers, Clock, Users
} from 'lucide-react';
import { cmsApi } from '../services/api';

export interface CurriculumItem {
    id: number;
    title: string;
    category: 'school' | 'class' | 'akhlak' | 'quran' | 'uks';
    description?: string;
    target_audience?: string;
    frequency?: string;
    time_allocation?: string;
    order?: number;
    is_active?: boolean;
}

const CATEGORY_META: Record<string, { label: string; shortLabel: string; icon: any; color: string; bg: string; badge: string; desc: string }> = {
    school: {
        label: 'Program Sekolah',
        shortLabel: 'Sekolah',
        icon: School,
        color: 'text-blue-700',
        bg: 'bg-blue-50',
        badge: 'bg-blue-100 text-blue-800',
        desc: 'Kegiatan tahunan, field trip, dan pembiasaan terpadu seluruh warga sekolah KB-TK IT Taman Robbani.'
    },
    class: {
        label: 'Program Kelas & Sentra',
        shortLabel: 'Kelas & Sentra',
        icon: GraduationCap,
        color: 'text-teal-750',
        bg: 'bg-teal-50',
        badge: 'bg-teal-100 text-teal-800',
        desc: 'Aktivitas harian di dalam sentra belajar untuk menstimulasi fitrah kognitif, motorik, dan sosial ananda.'
    },
    akhlak: {
        label: 'Adab & Akhlak Mulia',
        shortLabel: 'Adab & Karakter',
        icon: HeartHandshake,
        color: 'text-emerald-750',
        bg: 'bg-emerald-50',
        badge: 'bg-emerald-100 text-emerald-800',
        desc: 'Internalisasi nilai tauhid, adab sunnah Rasulullah, dan pembiasaan karakter mulia sejak usia dini.'
    },
    quran: {
        label: "Al-Qur'an & Yanbu'a",
        shortLabel: "Al-Qur'an",
        icon: BookOpen,
        color: 'text-amber-700',
        bg: 'bg-amber-50',
        badge: 'bg-amber-100 text-amber-800',
        desc: "Bimbingan tartil metode Yanbu'a, tahfidz surat pendek Juz 30, doa harian, dan kecintaan pada kalamullah."
    },
    uks: {
        label: 'Kesehatan & Tumbuh Kembang',
        shortLabel: 'UKS & Gizi',
        icon: Activity,
        color: 'text-rose-700',
        bg: 'bg-rose-50',
        badge: 'bg-rose-100 text-rose-800',
        desc: 'Pemantauan tumbuh kembang fisik (DDTK), nutrisi PMT-AS sehat, kebersihan diri, dan sanitasi prima.'
    }
};

const DEFAULT_CURRICULUM: Record<string, CurriculumItem[]> = {
    school: [
        { id: 1, title: 'Pembelajaran Tematik Terpadu', category: 'school', target_audience: 'Semua Kelompok', frequency: 'Setiap Hari', description: 'Kurikulum merdeka berbasis tema Islami yang menghubungkan sains, adab, dan alam semesta ciptaan Allah.' },
        { id: 2, title: 'Outing Class & Field Trip Edukatif', category: 'school', target_audience: 'Semua Kelompok', frequency: 'Per Semester', description: 'Kunjungan belajar luar ruangan ke pemadam kebakaran, peternakan edukatif, kebun hidroponik, dan museum sains.' },
        { id: 3, title: 'Peringatan Hari Besar Islam & Nasional', category: 'school', target_audience: 'Semua Kelompok', frequency: 'Kondisional', description: 'Memaknai Tahun Baru Hijriyah, Maulid Nabi, Isra Miraj, Hari Pahlawan, dan Kemerdekaan RI dengan penuh syukur.' },
        { id: 4, title: 'Pentas Seni & Akhirussanah', category: 'school', target_audience: 'KB & TK', frequency: 'Tahunan', description: 'Panggung apresiasi bakat, hafalan Qur\'an, rasa percaya diri anak, dan wisuda kelulusan penuh kebanggaan.' },
        { id: 5, title: 'Market Day & Wirausaha Cilik', category: 'school', target_audience: 'TK-A & TK-B', frequency: 'Per Semester', description: 'Simulasi jual beli halal untuk melatih kejujuran, komunikasi percaya diri, berhitung, dan kerjasama tim.' },
        { id: 6, title: 'Manasik Haji Cilik', category: 'school', target_audience: 'KB & TK', frequency: 'Tahunan', description: 'Praktik rukun haji (thawaf, sa\'i, wukuf, lempar jumrah) dalam miniatur Ka\'bah ramah anak.' },
        { id: 7, title: 'Parenting & Konsultasi Tumbuh Kembang', category: 'school', target_audience: 'Orang Tua Murid', frequency: '2 Bulan Sekali', description: 'Seminar parenting bersama psikolog anak dan temu konsultasi perkembangan belajar putra-putri tercinta.' },
    ],
    class: [
        { id: 8, title: 'Morning Circle & Ikrar Robbani', category: 'class', target_audience: 'Semua Kelompok', frequency: 'Pagi Hari', description: 'Penyambutan senyum, salam, sapa hangat guru, membaca doa pagi, dan afirmasi positif membangun rasa percaya diri.' },
        { id: 9, title: 'Sentra Belajar & Eksplorasi Minat', category: 'class', target_audience: 'KB & TK', frequency: 'Harian', description: 'Rotasi sentra balok, sentra seni, sentra bermain peran mikro/makro, dan sentra bahan alam ramah eksplorasi.' },
        { id: 10, title: 'Fun English & Arabic Vocabulary', category: 'class', target_audience: 'TK-A & TK-B', frequency: '3x Seminggu', description: 'Pengenalan kosakata bahasa Arab & Inggris sederhana melalui nyanyian riang dan kartu bergambar interaktif.' },
        { id: 11, title: 'Motorik Kasar & Senam Ceria', category: 'class', target_audience: 'Semua Kelompok', frequency: 'Setiap Pagi', description: 'Aktivitas fisik terarah untuk melatih kelenturan tubuh, koordinasi mata-kaki-tangan, dan daya tahan tubuh.' },
        { id: 12, title: 'Calistung Ramah Anak (Tanpa Paksaan)', category: 'class', target_audience: 'TK-A & TK-B', frequency: 'Harian', description: 'Stimulasi pra-membaca, menulis rapi, dan konsep logika bilangan bermakna melalui permainan konkret.' },
        { id: 13, title: 'Toilet Training & Kemandirian Merawat Diri', category: 'class', target_audience: 'Playgroup (KB)', frequency: 'Harian', description: 'Pendampingan tuntas lepas popok, mencuci tangan 6 langkah, memakai sepatu mandiri, dan merapikan mainan.' },
    ],
    akhlak: [
        { id: 14, title: 'Budaya 5S (Senyum, Salam, Sapa, Sopan, Santun)', category: 'akhlak', target_audience: 'Semua Kelompok', frequency: 'Setiap Hari', description: 'Pembiasaan bersikap ramah, saling menyayangi teman sebaya, dan beradab mulia kepada asatidz dan orang tua.' },
        { id: 15, title: 'Pembiasaan Doa Harian & Hadits Pendek', category: 'akhlak', target_audience: 'Semua Kelompok', frequency: 'Harian', description: 'Melafalkan doa sebelum/sesudah makan, masuk kamar mandi, memakai baju, dan hadits kasih sayang.' },
        { id: 16, title: 'Praktik Wudhu & Sholat Berjamaah/Dhuha', category: 'akhlak', target_audience: 'KB & TK', frequency: 'Harian', description: 'Mengenal rukun wudhu secara tertib serta bimbingan sholat berjamaah yang khusyuk di musholla sekolah.' },
        { id: 17, title: 'Kisah Teladan 25 Nabi & Sahabat', category: 'akhlak', target_audience: 'Semua Kelompok', frequency: 'Mingguan', description: 'Mendongeng sirah nabawiyah interaktif dengan media boneka tangan ramah anak dan buku ilustrasi indah.' },
        { id: 18, title: 'Gerakan Infaq Subuh & Jum\'at Berkah', category: 'akhlak', target_audience: 'Semua Kelompok', frequency: 'Setiap Jum\'at', description: 'Melatih kepedulian sosial anak sejak dini dengan menyisihkan sebagian uang saku bagi yang membutuhkan.' },
        { id: 19, title: 'Adab Makan & Minum Sesuai Sunnah', category: 'akhlak', target_audience: 'Semua Kelompok', frequency: 'Waktu Makan', description: 'Adab duduk tenang, tangan kanan, membaca bismillah, tidak berbicara saat mengunyah, dan tidak meniup makanan.' },
        { id: 20, title: 'Tiga Kata Ajaib: Tolong, Maaf, Terima Kasih', category: 'akhlak', target_audience: 'Semua Kelompok', frequency: 'Harian', description: 'Penanaman kerendahan hati, empati sosial, dan penghargaan tulus dalam pergaulan sehari-hari.' },
    ],
    quran: [
        { id: 22, title: 'Bimbingan Baca Qur\'an Metode Yanbu\'a', category: 'quran', target_audience: 'Semua Kelompok', frequency: 'Harian', description: 'Metode membaca Al-Qur\'an berstandar Jawa Timur yang tartil, sistematis, ramah anak, dan mudah dipahami.' },
        { id: 23, title: 'Tahfidz Surat-Surat Pendek Juz 30', category: 'quran', target_audience: 'Semua Kelompok', frequency: 'Harian', description: 'Hafalan rutin surat An-Naas hingga Ad-Dhuha dengan talaqqi langsung, makhraj fasih, dan irama merdu.' },
        { id: 24, title: 'Murottal Al-Qur\'an Harian', category: 'quran', target_audience: 'Semua Kelompok', frequency: 'Kedatangan/Kepulangan', description: 'Stimulus audio lantunan Al-Qur\'an syahdu untuk menenangkan hati dan menguatkan daya ingat bawah sadar ananda.' },
        { id: 25, title: 'Tafsir Ceria & Kisah Ayat', category: 'quran', target_audience: 'Semua Kelompok', frequency: 'Mingguan', description: 'Pengenalan makna ayat-ayat pendek melalui kisah inspiratif sehari-hari yang mudah dipahami anak-anak.' },
        { id: 26, title: 'Makharijul Huruf & Tajwid Interaktif', category: 'quran', target_audience: 'TK-A & TK-B', frequency: '2x Seminggu', description: 'Latihan pengucapan huruf hijaiyah dengan visual dan gerakan motorik menyenangkan tanpa membosankan.' },
        { id: 27, title: 'Khotmil Qur\'an & Imtihan Terbuka', category: 'quran', target_audience: 'TK-B', frequency: 'Akhir Tahun', description: 'Ujian terbuka pembacaan dan hafalan Juz 30 di hadapan orang tua sebagai wujud transparansi prestasi anak.' },
    ],
    uks: [
        { id: 31, title: 'Pemeriksaan Kesehatan & Gigi Berkala', category: 'uks', target_audience: 'Semua Siswa', frequency: 'Per Semester', description: 'Pemeriksaan gigi, telinga, mata, dan kuku oleh tenaga medis Puskesmas terakreditasi.' },
        { id: 32, title: 'Menu Sehat & Bekal Bergizi (PMT-AS)', category: 'uks', target_audience: 'Semua Siswa', frequency: '1x Seminggu', description: 'Pemberian makanan tambahan sehat (sayur, buah organik, susu kedelai/kacang hijau) untuk gizi seimbang.' },
        { id: 33, title: 'Deteksi Dini Tumbuh Kembang (DDTK)', category: 'uks', target_audience: 'Semua Siswa', frequency: 'Bulanan', description: 'Pengukuran Berat Badan (BB), Tinggi Badan (TB), dan Lingkar Kepala (LK) yang tercatat rapi di KMS.' },
        { id: 34, title: 'Praktik Cuci Tangan 6 Langkah WHO', category: 'uks', target_audience: 'Semua Siswa', frequency: 'Sebelum Makan/Bermain', description: 'Mencuci tangan dengan air mengalir dan sabun antiseptik agar ananda terbiasa higienis dan terhindar dari kuman.' },
        { id: 35, title: 'Area Belajar Higienis & Bebas Asap Rokok', category: 'uks', target_audience: 'Seluruh Warga', frequency: 'Standby Harian', description: 'Kawasan 100% bebas rokok, sanitasi air bersih, dan ruang UKS nyaman dengan perlengkapan P3K lengkap.' },
    ]
};

interface CurriculumSectionProps {
    className?: string;
    showShadow?: boolean;
}

export default function CurriculumSection({ className = '', showShadow = true }: CurriculumSectionProps) {
    const [activeCategory, setActiveCategory] = useState<'school' | 'class' | 'akhlak' | 'quran' | 'uks'>('school');
    const [curriculumData, setCurriculumData] = useState<Record<string, CurriculumItem[]>>(DEFAULT_CURRICULUM);
    const [modalCategory, setModalCategory] = useState<'school' | 'class' | 'akhlak' | 'quran' | 'uks' | null>(null);
    const [isHovered, setIsHovered] = useState(false);

    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Lock background body scroll when modal is open
    useEffect(() => {
        if (modalCategory) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [modalCategory]);

    // Fetch CMS curriculum data
    useEffect(() => {
        cmsApi.getCurriculumPrograms()
            .then((res) => {
                if (res?.success && res.data) {
                    const rawList: any[] = Array.isArray(res.data) 
                        ? res.data 
                        : (Array.isArray(res.programs) ? res.programs : (Array.isArray(res.data?.programs) ? res.data.programs : []));

                    if (rawList.length > 0) {
                        const grouped: Record<string, CurriculumItem[]> = {
                            school: [],
                            class: [],
                            akhlak: [],
                            quran: [],
                            uks: []
                        };

                        rawList.forEach((item: any) => {
                            let cat = (item.category || '').toLowerCase();
                            if (cat === 'sekolah') cat = 'school';
                            if (cat === 'kelas') cat = 'class';

                            if (grouped[cat]) {
                                grouped[cat].push({
                                    id: item.id,
                                    title: item.title || item.name || '',
                                    category: cat as any,
                                    description: item.description || '',
                                    target_audience: item.target_audience || 'Semua Kelompok',
                                    frequency: item.frequency || item.time_allocation || 'Rutin',
                                    order: item.order || 0,
                                    is_active: item.is_active !== undefined ? Boolean(item.is_active) : true
                                });
                            }
                        });

                        Object.keys(grouped).forEach(k => {
                            if (grouped[k].length === 0 && DEFAULT_CURRICULUM[k]) {
                                grouped[k] = DEFAULT_CURRICULUM[k];
                            }
                        });

                        setCurriculumData(grouped);
                    }
                }
            })
            .catch(() => {
                setCurriculumData(DEFAULT_CURRICULUM);
            });
    }, []);

    // Continuous auto-scroll animation logic
    useEffect(() => {
        if (isHovered || modalCategory) return;

        const interval = setInterval(() => {
            if (scrollContainerRef.current) {
                const el = scrollContainerRef.current;
                const maxScrollLeft = el.scrollWidth - el.clientWidth;
                
                // If reached or near the end, wrap smoothly to start
                if (el.scrollLeft >= maxScrollLeft - 10) {
                    el.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    el.scrollBy({ left: 300, behavior: 'smooth' });
                }
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [isHovered, modalCategory, activeCategory]);

    const currentCategoryItems = (curriculumData[activeCategory] || []).filter(item => item.is_active !== false);

    return (
        <section 
            className={`bg-white rounded-3xl p-6 sm:p-10 ${showShadow ? 'shadow-xl shadow-slate-100/80 border border-slate-100' : ''} space-y-6 ${className}`}
            aria-label="Kurikulum dan Pembiasaan"
        >
            {/* 1. Header Minimalis & Informatif untuk Orang Tua */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-50 text-teal-800 rounded-full text-xxs font-extrabold uppercase tracking-wider mb-2.5">
                        <Layers size={13} className="text-teal-600" />
                        <span>Kurikulum & Pembiasaan Terpadu</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-850 tracking-tight">
                        Apa yang Dipelajari Ananda Setiap Hari?
                    </h2>
                    <p className="mt-1 text-slate-500 text-xs sm:text-sm leading-relaxed max-w-2xl">
                        Kurikulum holistik ramah anak memadukan nilai tauhid, adab sunnah, kematangan emosi, dan kecerdasan motorik.
                    </p>
                </div>
            </div>

            {/* 2. Category Tab Pills - Minimalis & Intuitif */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scrollbar-none pb-1 pt-1">
                {(['school', 'class', 'akhlak', 'quran', 'uks'] as const).map((catKey) => {
                    const meta = CATEGORY_META[catKey];
                    const Icon = meta.icon;
                    const isActive = activeCategory === catKey;
                    const count = (curriculumData[catKey] || []).filter(item => item.is_active !== false).length;

                    return (
                        <button
                            key={catKey}
                            type="button"
                            onClick={() => {
                                setActiveCategory(catKey);
                                if (scrollContainerRef.current) {
                                    scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
                                }
                            }}
                            className={`px-4 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 whitespace-nowrap transition-all duration-200 cursor-pointer ${
                                isActive
                                    ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20 ring-2 ring-teal-600/30'
                                    : 'bg-slate-100/90 text-slate-600 hover:bg-slate-200 hover:text-slate-800'
                            }`}
                        >
                            <Icon size={15} />
                            <span>{meta.label}</span>
                            <span className={`px-2 py-0.5 rounded-full text-xxs font-extrabold ${isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>
                                {count}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* 3. Category Description Banner */}
            <div className="px-4 py-3 bg-slate-50/90 rounded-2xl border border-slate-100/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <p className="text-xs text-slate-600 font-medium">
                    {CATEGORY_META[activeCategory].desc}
                </p>
                <button
                    type="button"
                    onClick={() => setModalCategory(activeCategory)}
                    className="text-xs font-bold text-teal-600 hover:text-teal-800 whitespace-nowrap flex items-center gap-1 hover:underline cursor-pointer self-end sm:self-auto"
                >
                    <span>Lihat Semua ({currentCategoryItems.length})</span>
                    <ChevronRight size={14} />
                </button>
            </div>

            {/* 4. Smooth Auto-Scroll Cards Track with Hover-Pause */}
            <div
                ref={scrollContainerRef}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onTouchStart={() => setIsHovered(true)}
                onTouchEnd={() => setIsHovered(false)}
                className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar scrollbar-none gap-5 pb-3 pt-1"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {currentCategoryItems.map((item, idx) => (
                    <div
                        key={item.id || idx}
                        className="snap-start flex-shrink-0 w-[275px] sm:w-[310px] bg-slate-50/70 hover:bg-white p-5 sm:p-6 rounded-3xl border border-slate-100 hover:border-teal-300 transition-all duration-300 shadow-2xs hover:shadow-md flex flex-col justify-between group"
                    >
                        <div className="space-y-2.5">
                            <div className="flex items-center justify-between">
                                <span className="w-7 h-7 rounded-xl bg-teal-100/80 text-teal-800 font-extrabold text-xs flex items-center justify-center">
                                    {String(idx + 1).padStart(2, '0')}
                                </span>
                                {(item.frequency || item.time_allocation) && (
                                    <span className="px-2.5 py-0.5 bg-white text-slate-600 rounded-full text-[10px] font-semibold flex items-center gap-1 border border-slate-200/60 shadow-2xs">
                                        <Clock size={11} className="text-teal-600 flex-shrink-0" />
                                        <span>{item.frequency || item.time_allocation}</span>
                                    </span>
                                )}
                            </div>

                            <h3 className="font-bold text-slate-800 text-sm sm:text-base leading-snug group-hover:text-teal-800 transition-colors">
                                {item.title}
                            </h3>

                            <p className="text-slate-500 text-xs leading-relaxed line-clamp-3">
                                {item.description || 'Program pembiasaan terpadu untuk menstimulasi fitrah dan karakter unggul anak didik.'}
                            </p>
                        </div>

                        {item.target_audience && (
                            <div className="mt-4 pt-3 border-t border-slate-200/50 flex items-center gap-1.5 text-xxs text-slate-500 font-medium">
                                <Users size={12} className="text-teal-600 flex-shrink-0" />
                                <span>Sasaran: <strong className="text-slate-700">{item.target_audience}</strong></span>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Hint for parents */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                <span>💡 Sentuh atau dekatkan kursor untuk membaca lebih santai.</span>
                <span className="font-semibold text-teal-700">Total {currentCategoryItems.length} kegiatan</span>
            </div>

            {/* 5. MODAL FULL LIST CATEGORY (NO SCROLLBAR) */}
            <AnimatePresence>
                {modalCategory && (
                    <div 
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
                        onClick={() => setModalCategory(null)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl overflow-hidden relative max-h-[85vh] flex flex-col border border-slate-100"
                        >
                            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${CATEGORY_META[modalCategory].bg} ${CATEGORY_META[modalCategory].color}`}>
                                        {React.createElement(CATEGORY_META[modalCategory].icon, { size: 22 })}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-800">
                                            {CATEGORY_META[modalCategory].label} (Lengkap)
                                        </h3>
                                        <p className="text-xs text-slate-400">
                                            Total {(curriculumData[modalCategory] || []).filter(item => item.is_active !== false).length} Program Kurikulum
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setModalCategory(null)}
                                    className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                                    aria-label="Tutup dialog"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* List with hidden scrollbar */}
                            <div 
                                className="overflow-y-auto no-scrollbar scrollbar-none py-4 space-y-3 pr-1"
                                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                            >
                                {(curriculumData[modalCategory] || []).filter(item => item.is_active !== false).map((prog, idx) => (
                                    <div key={prog.id || idx} className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-2 hover:bg-slate-50 transition-colors">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="font-bold text-sm text-slate-800 flex items-center gap-2">
                                                <span className="w-5 h-5 rounded-full bg-teal-600 text-white text-xxs flex items-center justify-center font-bold flex-shrink-0">
                                                    {idx + 1}
                                                </span>
                                                <span>{prog.title}</span>
                                            </span>
                                            {(prog.frequency || prog.time_allocation) && (
                                                <span className="px-2 py-0.5 bg-white text-slate-600 rounded-full text-[10px] font-semibold flex items-center gap-1 border border-slate-200/60 shadow-2xs flex-shrink-0">
                                                    <Clock size={10} className="text-teal-600 flex-shrink-0" />
                                                    <span>{prog.frequency || prog.time_allocation}</span>
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-600 leading-relaxed pl-7">
                                            {prog.description || 'Program kurikulum dan pembiasaan terpadu KB-TK IT Taman Robbani.'}
                                        </p>
                                        {prog.target_audience && (
                                            <div className="pl-7 pt-1 text-xxs text-teal-700 font-medium flex items-center gap-1">
                                                <Users size={11} />
                                                <span>Sasaran: {prog.target_audience}</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="pt-4 border-t border-slate-100 flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => setModalCategory(null)}
                                    className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                                >
                                    Selesai Membaca
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </section>
    );
}
