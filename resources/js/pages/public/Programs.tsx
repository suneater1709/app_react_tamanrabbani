import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    CheckCircle2, ArrowRight, ChevronRight, BookOpen, School, GraduationCap, 
    HeartHandshake, Sparkles, Activity, Award, ChevronLeft, X, Layers, Clock, Users 
} from 'lucide-react';
import { cmsApi } from '../../services/api';
import CurriculumSection from '../../components/CurriculumSection';

interface ProgramDetails {
    id: string;
    name: string;
    age: string;
    schedule: string;
    fee: string;
    description: string;
    materi: string[];
    fasilitas: string[];
    kelebihan: string[];
}

interface ExtracurricularItem {
    id: number;
    title: string;
    level: 'kb' | 'tk' | 'all';
    instructor?: string;
    schedule?: string;
    description?: string;
}

const DEFAULT_EXTRACURRICULAR: ExtracurricularItem[] = [
    { id: 1, title: 'Mewarnai & Motorik Halus Kreatif', level: 'kb', schedule: 'Setiap Rabu (10.00 - 11.00 WIB)', instructor: 'Ustadzah Pendamping Seni', description: 'Stimulasi kekuatan jari, eksplorasi warna gradasi, dan konsentrasi tangan untuk kesiapan pra-menulis.' },
    { id: 2, title: 'Gerak & Lagu Edukasi Islami', level: 'kb', schedule: 'Setiap Kamis (10.00 - 11.00 WIB)', instructor: 'Ustadzah Tari & Irama', description: 'Pengembangan kelincahan motorik kasar, ritme musik, dan keceriaan bersosialisasi bersama teman sebaya.' },
    { id: 3, title: 'Sensory Play & Fun Gym Cilik', level: 'kb', schedule: 'Setiap Jum\'at (09.00 - 10.00 WIB)', instructor: 'Instruktur Senam Anak', description: 'Aktivitas sensori tekstur, obstacle course mini, dan latihan keseimbangan fisik anak usia playgroup.' },
    { id: 4, title: 'Tahfidz Cilik Intensif', level: 'tk', schedule: 'Senin & Rabu (11.30 - 12.30 WIB)', instructor: 'Ustadz Pembina Tahfidz', description: 'Pendalaman hafalan juz 30 dengan tartil, tahsin makhraj, dan bimbingan talaqqi satu per satu.' },
    { id: 5, title: 'Seni Lukis & Mewarnai Kreasi', level: 'tk', schedule: 'Setiap Selasa (11.30 - 12.30 WIB)', instructor: 'Kakak Pelukis Tamu', description: 'Eksplorasi teknik kuas, cat air, crayon gradasi, dan persiapan delegasi lomba mewarnai tingkat kabupaten.' },
    { id: 6, title: 'Tapak Suci / Bela Diri Cilik', level: 'tk', schedule: 'Setiap Kamis (11.30 - 12.30 WIB)', instructor: 'Pelatih Tapak Suci Bersertifikat', description: 'Melatih kedisiplinan, ketahanan fisik, fokus konsentrasi, dan dasar bela diri pertahanan diri anak.' },
    { id: 7, title: 'Drumband / Nada Ceria Robbani', level: 'tk', schedule: 'Setiap Jum\'at (10.00 - 11.30 WIB)', instructor: 'Pelatih Musik Perkusi', description: 'Melatih koordinasi motorik, kekompakan tim, rasa percaya diri, dan pengenalan nada ketukan berirama.' },
    { id: 8, title: 'Sains & Robotik Sederhana Cilik', level: 'tk', schedule: 'Setiap Sabtu (08.30 - 10.00 WIB)', instructor: 'Mentor Sains Anak', description: 'Eksperimen sains seru (gunung meletus mini, roket air sederhana) dan pengenalan mekanika balok dasar.' },
];

export default function Programs() {
    const location = useLocation();
    const navigate = useNavigate();
    const [selectedModalProgram, setSelectedModalProgram] = useState<ProgramDetails | null>(null);

    // Extracurricular State
    const [extracurriculars, setExtracurriculars] = useState<ExtracurricularItem[]>(DEFAULT_EXTRACURRICULAR);
    const [extraTab, setExtraTab] = useState<'kb' | 'tk'>('tk');

    const programsData: ProgramDetails[] = [
        {
            id: 'pg',
            name: 'Kelompok Bermain (Playgroup)',
            age: 'Usia 3 - 4 Tahun',
            schedule: 'Senin - Kamis (08.00 - 11.00 WIB)',
            fee: 'Rp 450.000 / Bulan',
            description: 'Program yang dirancang khusus untuk anak usia 3 - 4 tahun demi mengoptimalkan masa keemasan tumbuh kembang anak melalui stimulasi sensori motorik, sosialisasi awal, dan pengenalan adab keislaman dasar dalam suasana bermain yang penuh kasih sayang.',
            materi: [
                'Stimulasi Sensomotorik & Motorik Kasar',
                'Sosialisasi awal & kemandirian toilet training',
                'Pengenalan huruf hijaiyah dasar secara menyenangkan',
                'Pembiasaan adab makan, minum, dan berdoa',
                'Bernyanyi lagu edukasi & motorik halus'
            ],
            fasilitas: [
                'Playground outdoor yang ramah anak',
                'Berbagai macam Alat Permainan Edukatif (APE)',
                'Pemeriksaan tumbuh kembang berkala',
                'Laporan portofolio perkembangan anak bulanan',
                'Lingkungan belajar yang bersih, asri, dan aman'
            ],
            kelebihan: [
                'Rasio guru dan murid sangat ideal (1 guru mendampingi maksimal 6-7 anak)',
                'Fokus pada kemandirian dasar dan kebahagiaan anak',
                'Metode stimulasi sensorik terpadu'
            ]
        },
        {
            id: 'tka',
            name: 'Taman Kanak-Kanak A (TK A)',
            age: 'Usia 4 - 5 Tahun',
            schedule: 'Senin - Jumat (07.30 - 11.30 WIB)',
            fee: 'Rp 600.000 / Bulan',
            description: 'Program pendidikan terstruktur untuk anak usia 4 - 5 tahun yang memadukan pembiasaan ibadah praktis, pengenalan hafalan surat pendek, serta pengembangan kecerdasan kognitif verbal dan logika awal secara menyenangkan tanpa paksaan.',
            materi: [
                'Hafalan Surat Pendek (Juz Amma) dan Doa Harian',
                'Pengenalan konsep membaca, menulis, berhitung (calistung) tanpa paksaan',
                'Pengembangan kemandirian & tanggung jawab tugas',
                'Praktik wudhu & shalat berjamaah sederhana',
                'Kreativitas seni, mewarnai, dan kerajinan tangan'
            ],
            fasilitas: [
                'Kelas multimedia interaktif yang nyaman & edukatif',
                'Perpustakaan mini berisi buku ramah anak',
                'Peralatan olahraga dan stimulasi motorik kasar',
                'Pemeriksaan kesehatan fisik & gigi berkala',
                'Buku penghubung perkembangan mingguan'
            ],
            kelebihan: [
                'Kurikulum terintegrasi dengan pembiasaan akhlak',
                'Pembelajaran kontekstual luar ruangan (outing class)',
                'Kelas kondusif dengan rasio guru yang ideal'
            ]
        },
        {
            id: 'tkb',
            name: 'Taman Kanak-Kanak B (TK B)',
            age: 'Usia 5 - 6 Tahun',
            schedule: 'Senin - Jumat (07.30 - 12.00 WIB)',
            fee: 'Rp 650.000 / Bulan',
            description: 'Program persiapan matang untuk anak usia 5 - 6 tahun dalam menghadapi transisi menuju Sekolah Dasar (SD), memperkuat fondasi keagamaan (shalat mandiri, tilawah dasar), serta melatih kemandirian dan berpikir kritis logis secara interaktif.',
            materi: [
                'Pemantapan bacaan & hafalan Al-Qur\'an Juz 30',
                'Kemampuan membaca lancar, menulis rapi, dan matematika dasar logis',
                'Praktik manasik haji cilik dan bakti sosial',
                'Pengenalan dasar sains, alam, dan lingkungan hidup',
                'Pengenalan kosakata Bahasa Arab dan Inggris praktis'
            ],
            fasilitas: [
                'Fasilitas kelas modern & interaktif yang nyaman',
                'Mini laboratory untuk eksperimen sains cilik',
                'Lapangan olahraga luas dan sarana manasik',
                'Konsultasi psikologi kesiapan masuk SD',
                'Laporan evaluasi akademik per semester'
            ],
            kelebihan: [
                'Pendampingan khusus persiapan tes kesiapan SD',
                'Target hafalan surat pendek & hadits pilihan terstruktur',
                'Pembiasaan kepemimpinan dan kerja kelompok'
            ]
        }
    ];

    useEffect(() => {
        const stateSelectedId = location.state?.selectedId;
        if (stateSelectedId) {
            const found = programsData.find(p => p.id === stateSelectedId);
            if (found) {
                setSelectedModalProgram(found);
            }
        }

        // Fetch extracurriculars from backend
        cmsApi.getCurriculumPrograms()
            .then(res => {
                if (res.success && res.data) {
                    if (res.data.extracurriculars && Array.isArray(res.data.extracurriculars) && res.data.extracurriculars.length > 0) {
                        setExtracurriculars(res.data.extracurriculars);
                    }
                }
            })
            .catch(err => console.log('Using default extracurricular dataset', err));
    }, [location.state]);

    // Lock background body scroll when modal is open
    useEffect(() => {
        if (selectedModalProgram) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [selectedModalProgram]);

    const filteredExtra = (Array.isArray(extracurriculars) ? extracurriculars : DEFAULT_EXTRACURRICULAR).filter(e => {
        const lvl = (e.level || '').toLowerCase();
        if (extraTab === 'kb') return lvl === 'kb' || lvl === 'all';
        if (extraTab === 'tk') return lvl === 'tk' || lvl === 'all';
        return true;
    });

    return (
        <div className="py-16 bg-slate-50 min-h-screen text-left">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
                
                {/* 1. TOP HERO & JENJANG KELAS */}
                <div>
                    <div className="text-center max-w-3xl mx-auto mb-14">
                        <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 text-xxs font-extrabold uppercase tracking-widest rounded-full mb-3">
                            JENJANG PENDIDIKAN
                        </span>
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight">Pilihan Kelompok Kelas</h1>
                        <p className="mt-4 text-slate-500 text-xs sm:text-sm leading-relaxed">
                            Kami membagi kelas berdasarkan kelompok usia demi mengoptimalkan stimulus belajar anak yang sesuai dengan tahap tumbuh kembang emasnya.
                        </p>
                    </div>

                    {/* Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {programsData.map((prog) => (
                            <motion.div
                                key={prog.id}
                                whileHover={{ y: -6, scale: 1.01 }}
                                onClick={() => setSelectedModalProgram(prog)}
                                className="bg-white rounded-3xl p-6 flex flex-col justify-between shadow-md hover:shadow-xl cursor-pointer transition-all duration-300 relative overflow-hidden border border-slate-100/80 hover:border-teal-300 group"
                            >
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="px-3 py-1 bg-teal-50 text-teal-800 text-xxs font-bold rounded-full">
                                            {prog.age}
                                        </span>
                                        <span className="text-xxs text-slate-400 font-medium">KB-TK IT</span>
                                    </div>
                                    
                                    <h3 className="text-base sm:text-lg font-bold text-slate-800 group-hover:text-teal-700 transition">
                                        {prog.name}
                                    </h3>
                                    <p className="text-slate-500 text-xs leading-relaxed line-clamp-3">{prog.description}</p>
                                    
                                    <div className="border-t border-slate-100 pt-4 space-y-2">
                                        <span className="text-xxs font-bold text-slate-400 block uppercase tracking-wider">Fokus Utama:</span>
                                        <ul className="space-y-1.5 text-xs text-slate-600">
                                            {prog.materi.slice(0, 3).map((mat, i) => (
                                                <li key={i} className="flex items-start gap-1.5">
                                                    <span className="text-teal-500 mt-0.5">•</span>
                                                    <span className="line-clamp-1">{mat}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                <div className="border-t border-slate-100 mt-6 pt-4 flex justify-end items-center">
                                    <button 
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedModalProgram(prog);
                                        }}
                                        className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-900 bg-teal-50/90 hover:bg-teal-100/90 px-4 py-2 rounded-xl transition cursor-pointer shadow-2xs"
                                    >
                                        <span>Lihat Detail Kelas</span>
                                        <ChevronRight size={14} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* 2. 5 KATEGORI PROGRAM KURIKULUM (AUTO SCROLL MINIMALIST) */}
                <CurriculumSection />

                {/* 3. EKSTRAKURIKULER SECTION */}
                <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-lg border border-slate-100 space-y-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <span className="inline-block px-3 py-1 bg-purple-100 text-purple-800 text-xxs font-extrabold uppercase tracking-widest rounded-full mb-3">
                                PENGEMBANGAN MINAT & BAKAT
                            </span>
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800">Kegiatan Ekstrakurikuler</h2>
                            <p className="mt-1 text-slate-500 text-xs sm:text-sm">
                                Wadah eksplorasi bakat seni, olahraga, ketangkasan, dan kecerdasan Qur'ani di luar jam kelas inti.
                            </p>
                        </div>

                        {/* KB vs TK Selector Tabs */}
                        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl">
                            <button
                                type="button"
                                onClick={() => setExtraTab('tk')}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                    extraTab === 'tk'
                                        ? 'bg-white text-purple-900 shadow-xs'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                Jenjang TK (Taman Kanak-Kanak)
                            </button>
                            <button
                                type="button"
                                onClick={() => setExtraTab('kb')}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                    extraTab === 'kb'
                                        ? 'bg-white text-purple-900 shadow-xs'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                Jenjang KB (Playgroup)
                            </button>
                        </div>
                    </div>

                    {/* Extracurricular Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredExtra.map((extra, idx) => (
                            <motion.div
                                key={extra.id || idx}
                                whileHover={{ y: -4 }}
                                className="bg-slate-50 hover:bg-purple-50/40 p-6 rounded-3xl border border-slate-100 hover:border-purple-200 transition-all flex flex-col justify-between"
                            >
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="px-2.5 py-1 bg-purple-100 text-purple-800 rounded-full text-xxs font-extrabold uppercase">
                                            {extra.level === 'kb' ? 'Kelompok Bermain' : extra.level === 'tk' ? 'Taman Kanak-Kanak' : 'Semua Jenjang'}
                                        </span>
                                        <Award size={18} className="text-purple-600" />
                                    </div>

                                    <h3 className="font-bold text-slate-800 text-sm sm:text-base leading-snug">
                                        {extra.title}
                                    </h3>

                                    <p className="text-slate-500 text-xs leading-relaxed">
                                        {extra.description || 'Pengembangan motorik, kreativitas, dan rasa percaya diri anak.'}
                                    </p>
                                </div>

                                <div className="mt-4 pt-4 border-t border-slate-200/60 space-y-1.5 text-xxs text-slate-600">
                                    {extra.schedule && (
                                        <div className="flex items-center gap-1.5">
                                            <Clock size={12} className="text-purple-600 flex-shrink-0" />
                                            <span>Jadwal: <strong>{extra.schedule}</strong></span>
                                        </div>
                                    )}
                                    {extra.instructor && (
                                        <div className="flex items-center gap-1.5">
                                            <Users size={12} className="text-purple-600 flex-shrink-0" />
                                            <span>Pembina: <strong>{extra.instructor}</strong></span>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

            </div>

            {/* POPUP MODAL DETAIL KELAS */}
            {selectedModalProgram && (
                <div 
                    className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
                    onClick={() => setSelectedModalProgram(null)}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.2 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 my-8 max-h-[90vh] overflow-y-auto"
                    >
                        {/* Modal Header */}
                        <div className="flex items-start justify-between border-b border-slate-100 pb-5 mb-6">
                            <div className="space-y-2">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="px-3 py-1 bg-teal-50 text-teal-800 text-xxs font-bold rounded-full">
                                        Target Usia: {selectedModalProgram.age}
                                    </span>
                                    <span className="px-3 py-1 bg-blue-50 text-blue-800 text-xxs font-bold rounded-full">
                                        Jam: {selectedModalProgram.schedule}
                                    </span>
                                </div>
                                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-800">
                                    {selectedModalProgram.name}
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedModalProgram(null)}
                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition"
                            >
                                <X size={22} />
                            </button>
                        </div>

                        {/* Description */}
                        <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            {selectedModalProgram.description}
                        </p>

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            {/* Materi Pokok */}
                            <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-100 space-y-3">
                                <h4 className="text-xs font-bold text-teal-800 uppercase tracking-wider flex items-center gap-1.5">
                                    <BookOpen size={14} className="text-teal-600" />
                                    <span>Materi Pokok Pembelajaran:</span>
                                </h4>
                                <ul className="space-y-2 text-xs text-slate-600">
                                    {selectedModalProgram.materi.map((item, idx) => (
                                        <li key={idx} className="flex items-start gap-2">
                                            <span className="text-teal-500 font-bold">•</span>
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Fasilitas Khusus */}
                            <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-100 space-y-3">
                                <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                                    <Sparkles size={14} className="text-amber-600" />
                                    <span>Fasilitas Khusus Kelas:</span>
                                </h4>
                                <ul className="space-y-2 text-xs text-slate-600">
                                    {selectedModalProgram.fasilitas.map((item, idx) => (
                                        <li key={idx} className="flex items-start gap-2">
                                            <span className="text-amber-500 font-bold">•</span>
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Kelebihan Program */}
                        <div className="bg-emerald-50/60 p-5 rounded-2xl border border-emerald-100 space-y-3 mb-6">
                            <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                                <CheckCircle2 size={14} className="text-emerald-600" />
                                <span>Kelebihan & Keunggulan Program:</span>
                            </h4>
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                                {selectedModalProgram.kelebihan.map((item, idx) => (
                                    <li key={idx} className="flex items-start gap-2">
                                        <CheckCircle2 size={14} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Modal Footer Actions */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => setSelectedModalProgram(null)}
                                className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
                            >
                                Tutup
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setSelectedModalProgram(null);
                                    navigate('/ppdb');
                                }}
                                className="w-full sm:w-auto px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-2"
                            >
                                <span>Daftar {selectedModalProgram.name} Sekarang</span>
                                <ArrowRight size={15} />
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
