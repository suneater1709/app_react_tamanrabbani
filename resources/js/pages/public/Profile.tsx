import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ShieldCheck, Heart, Sparkles, Building2, MapPin, Eye, Target, Quote, Phone, Mail, MessageCircle, Award, CheckCircle2, X, ChevronRight } from 'lucide-react';
import { cmsApi } from '../../services/api';

const DEFAULT_GOALS = [
    'Menanamkan kecintaan kepada Allah SWT dan Rasulullah SAW sejak usia dini.',
    'Membentuk pembiasaan ibadah harian seperti sholat, wudhu, dan doa harian.',
    'Membekali anak dengan kemampuan dasar membaca, menghafal, dan memahami Al-Qur\'an metode Yanbu\'a.',
    'Mengembangkan karakter mandiri, jujur, santun, dan disiplin dalam kehidupan sehari-hari.',
    'Menumbuhkan rasa ingin tahu, kreativitas, dan daya pikir kritis melalui eksplorasi belajar yang menyenangkan.',
    'Melatih keterampilan motorik kasar dan motorik halus secara seimbang dan optimal.',
    'Menumbuhkan kemampuan bersosialisasi, empati, dan kepedulian terhadap sesama teman dan lingkungan.',
    'Menanamkan pola hidup bersih, sehat, dan menjaga kelestarian lingkungan sekolah.',
    'Mempersiapkan kematangan emosional dan kognitif anak untuk melanjutkan ke jenjang Sekolah Dasar (SD/MI).',
    'Membangun sinergi pendampingan yang solid dan selaras antara pihak sekolah dan keluarga di rumah.'
];

const DEFAULT_SKL = [
    'Memiliki aqidah yang lurus dan mengenal rukun iman serta rukun Islam dengan baik.',
    'Terbiasa melaksanakan adab-adab harian Islami (makan, minum, berpakaian, dan berbicara santun).',
    'Mampu melafalkan doa harian, hadits-hadits pilihan, dan bacaan sholat fardhu secara mandiri.',
    'Hafal Surat-Surat Pendek Juz 30 (minimal An-Naas sampai Ad-Dhuha) dengan makhraj yang baik.',
    'Mampu membaca huruf hijaiyah dan dasar membaca Al-Qur\'an sesuai tingkatannya (Metode Yanbu\'a).',
    'Memiliki kemandirian dalam merawat diri sendiri (toilet training, memakai sepatu, membereskan mainan).',
    'Mampu berkomunikasi aktif, mengekspresikan gagasan, dan berinteraksi sosial dengan sopan dan percaya diri.',
    'Memiliki kesiapan belajar calistung dasar dan koordinasi motorik yang matang untuk jenjang SD.'
];

export default function Profile() {
    const [history, setHistory] = useState<string>('');
    const [vision, setVision] = useState<string>('');
    const [mission, setMission] = useState<string>('');
    const [goals, setGoals] = useState<string[]>(DEFAULT_GOALS);
    const [gradCompetencies, setGradCompetencies] = useState<string[]>(DEFAULT_SKL);
    const [welcomeMessage, setWelcomeMessage] = useState<string>('');
    const [settings, setSettings] = useState<any>({
        school_address: 'Jl. Mangkurejo 41, Kwangsan, Sedati, Sidoarjo',
        school_phone: '0816503293',
        school_email: 'tamanrobbani23@gmail.com',
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            cmsApi.getHomeData(),
            cmsApi.getSettings().catch(() => ({ success: false, data: null }))
        ])
            .then(([homeRes, settingsRes]) => {
                if (homeRes.success && homeRes.data) {
                    setHistory(homeRes.data.history || '');
                    setVision(homeRes.data.vision || '');
                    setMission(homeRes.data.mission || '');
                    setWelcomeMessage(homeRes.data.welcome_message || '');
                    
                    if (homeRes.data.goals && Array.isArray(homeRes.data.goals) && homeRes.data.goals.length > 0) {
                        setGoals(homeRes.data.goals);
                    }
                    if (homeRes.data.grad_competencies && Array.isArray(homeRes.data.grad_competencies) && homeRes.data.grad_competencies.length > 0) {
                        setGradCompetencies(homeRes.data.grad_competencies);
                    }
                }
                if (settingsRes.success && settingsRes.data) {
                    setSettings((prev: any) => ({
                        ...prev,
                        ...settingsRes.data,
                    }));
                }
            })
            .catch((err) => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const values = [
        { icon: <Heart className="text-pink-600" size={24} />, title: 'Berkarakter Islami', desc: 'Membiasakan akhlak mulia dan kecintaan ibadah harian sejak dini.' },
        { icon: <Sparkles className="text-amber-600" size={24} />, title: 'Kreatif & Cerdas', desc: 'Mengembangkan kecerdasan kognitif dan eksplorasi bakat anak.' },
        { icon: <ShieldCheck className="text-teal-600" size={24} />, title: 'Mandiri', desc: 'Melatih kemampuan dasar merawat diri dan kemandirian bersosialisasi.' },
        { icon: <BookOpen className="text-blue-600" size={24} />, title: 'Berwawasan Lingkungan', desc: 'Menumbuhkan kepedulian terhadap kebersihan dan kelestarian alam.' },
    ];

    const missionLines = (mission || "1. Menyelenggarakan pendidikan anak usia dini yang berlandaskan Al-Qur'an dan As-Sunnah.\n2. Menanamkan aqidah yang lurus, ibadah yang benar, dan akhlakul karimah sejak dini.\n3. Mengembangkan potensi fitrah anak secara optimal melalui pembelajaran yang aktif, kreatif, dan menyenangkan.\n4. Menjalin kemitraan yang harmonis dengan orang tua dalam mendidik generasi Robbani.")
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-500 font-medium font-sans">Memuat profil...</p>
            </div>
        );
    }

    return (
        <div className="py-12 bg-slate-50 text-left font-sans">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
                {/* Header Title */}
                <div className="text-center max-w-3xl mx-auto">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight">Profil Sekolah</h1>
                    <div className="w-16 h-1 bg-teal-500 mx-auto mt-4 rounded-full"></div>
                    <p className="mt-4 text-slate-500 text-xs sm:text-sm leading-relaxed">
                        Mengenal lebih dekat KB-TK IT Taman Robbani Sidoarjo, visi misi, tujuan pendidikan, standar kelulusan, dan nilai-nilai dasar kami.
                    </p>
                </div>

                {/* 1. Kata Sambutan Kepala Sekolah */}
                <div className="bg-gradient-to-br from-teal-800 to-teal-950 text-white rounded-3xl p-8 sm:p-10 shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                        <Quote size={120} />
                    </div>
                    <div className="relative z-10 max-w-4xl space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-xs rounded-full text-teal-200 text-xs font-semibold">
                            <Quote size={14} />
                            <span>Kata Sambutan Kepala Sekolah</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-wide">
                            Mendidik dengan Sepenuh Hati & Berkarakter Robbani
                        </h2>
                        <p className="text-teal-50/90 text-sm sm:text-base leading-relaxed whitespace-pre-line pt-2">
                            {welcomeMessage || "Selamat datang di KB-TK IT Taman Robbani Sidoarjo. Kami berkomitmen memberikan layanan pendidikan anak usia dini terbaik dengan kurikulum Islami terpadu yang merangsang seluruh dimensi kecerdasan dan akhlak anak sejak dini."}
                        </p>
                        <div className="pt-4 flex items-center gap-3 border-t border-white/10">
                            <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center font-bold text-white text-sm">
                                TR
                            </div>
                            <div>
                                <h4 className="font-bold text-white text-sm">Kepala Sekolah KB-TK IT Taman Robbani</h4>
                                <span className="text-teal-200 text-xs">Sidoarjo, Jawa Timur</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Visi & Misi Section (CMS Profil terhubung) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Visi Sekolah */}
                    <div className="lg:col-span-5 bg-white p-8 rounded-3xl shadow-md border-t-4 border-teal-500 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
                                    <Eye size={26} />
                                </div>
                                <div>
                                    <span className="text-xxs font-extrabold text-teal-600 tracking-wider uppercase block">Landasan Cita-Cita</span>
                                    <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Visi Sekolah</h2>
                                </div>
                            </div>
                            <div className="p-5 bg-teal-50/50 rounded-2xl border border-teal-100/70">
                                <p className="text-slate-800 font-bold text-base sm:text-lg leading-relaxed italic">
                                    "{vision || "Menciptakan Generasi Robbani Sejak Dini"}"
                                </p>
                            </div>
                        </div>
                        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-400">
                            <Sparkles size={16} className="text-amber-500" />
                            <span>Membina fitrah kebaikan anak sejak usia emas</span>
                        </div>
                    </div>

                    {/* Misi Sekolah */}
                    <div className="lg:col-span-7 bg-white p-8 rounded-3xl shadow-md border-t-4 border-teal-500 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
                                    <Target size={26} />
                                </div>
                                <div>
                                    <span className="text-xxs font-extrabold text-teal-600 tracking-wider uppercase block">Langkah Strategis</span>
                                    <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Misi Sekolah</h2>
                                </div>
                            </div>
                            <ul className="space-y-3">
                                {missionLines.map((line, idx) => {
                                    const cleanText = line.replace(/^\d+[\.\)]\s*/, '');
                                    return (
                                        <li key={idx} className="flex items-start gap-3.5 p-3 rounded-xl bg-slate-50 hover:bg-teal-50/40 transition-colors">
                                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-teal-100 text-teal-700 text-xs font-bold flex items-center justify-center mt-0.5">
                                                {idx + 1}
                                            </span>
                                            <span className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                                                {cleanText}
                                            </span>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* 3. Tujuan Sekolah & Standar Kompetensi Lulusan (SKL) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Tujuan Sekolah (10 Poin) */}
                    <div className="lg:col-span-6 bg-white p-8 rounded-3xl shadow-md border-t-4 border-emerald-500 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                    <CheckCircle2 size={26} />
                                </div>
                                <div>
                                    <span className="text-xxs font-extrabold text-emerald-600 tracking-wider uppercase block">Capaian Pendidikan</span>
                                    <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Tujuan Sekolah</h2>
                                </div>
                            </div>
                            <div className="space-y-2.5 max-h-[440px] overflow-y-auto pr-1 scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                                {goals.map((goal, idx) => (
                                    <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 hover:bg-emerald-50/40 transition-colors border border-slate-100">
                                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center mt-0.5">
                                            {idx + 1}
                                        </span>
                                        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                                            {goal}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Standar Kompetensi Lulusan (SKL) */}
                    <div className="lg:col-span-6 bg-white p-8 rounded-3xl shadow-md border-t-4 border-amber-500 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                                        <Award size={26} />
                                    </div>
                                    <div>
                                        <span className="text-xxs font-extrabold text-amber-600 tracking-wider uppercase block">Target Kualitas</span>
                                        <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Standar Kompetensi Lulusan</h2>
                                    </div>
                                </div>
                                <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full">
                                    {gradCompetencies.length} SKL
                                </span>
                            </div>

                            <div className="space-y-2.5 max-h-[440px] overflow-y-auto pr-1 scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                                {gradCompetencies.map((skl, idx) => (
                                    <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 hover:bg-amber-50/40 transition-colors border border-slate-100">
                                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold flex items-center justify-center mt-0.5">
                                            {idx + 1}
                                        </span>
                                        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                                            {skl}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. Sejarah Singkat & Lokasi/Kontak */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Sejarah (Left) */}
                    <div className="lg:col-span-7 bg-white p-8 rounded-3xl shadow-md">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-teal-700 flex items-center justify-center">
                                <Building2 size={26} />
                            </div>
                            <div>
                                <span className="text-xxs font-extrabold text-teal-600 tracking-wider uppercase block">Tonggak Perjalanan</span>
                                <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Sejarah & Profil Singkat</h2>
                            </div>
                        </div>
                        <div className="prose prose-sm text-slate-600 leading-relaxed max-w-none text-xs sm:text-sm">
                            <p className="whitespace-pre-line">{history || 'KB-TK IT Taman Robbani Sidoarjo didirikan pada tahun 2015 dengan visi mencetak generasi unggul, berakhlak mulia, cerdas, dan mandiri berlandaskan nilai-nilai Islam Terpadu. Kami terus berinovasi untuk mendampingi tumbuh kembang anak secara menyeluruh melalui stimulasi terarah dan suasana bermain yang penuh kasih sayang.'}</p>
                        </div>
                    </div>

                    {/* Lokasi & Kontak Cepat (Right) */}
                    <div className="lg:col-span-5 bg-white p-8 rounded-3xl shadow-md flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-teal-700 flex items-center justify-center">
                                    <MapPin size={26} />
                                </div>
                                <div>
                                    <span className="text-xxs font-extrabold text-teal-600 tracking-wider uppercase block">Alamat & Kunjungan</span>
                                    <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Lokasi Lembaga</h2>
                                </div>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3 text-xs sm:text-sm text-slate-600">
                                <p className="font-medium">{settings.school_address || 'Jl. Mangkurejo 41, Kwangsan, Sedati, Sidoarjo'}</p>
                                <div className="pt-2 border-t border-slate-200 flex flex-col gap-1 text-xs text-slate-500">
                                    <span>📞 {settings.school_phone || '0816503293'}</span>
                                    <span>✉️ {settings.school_email || 'tamanrobbani23@gmail.com'}</span>
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-teal-600">
                            <span>Buka Senin - Sabtu</span>
                            <span>07.00 - 15.00 WIB</span>
                        </div>
                    </div>
                </div>

                {/* 5. Nilai-Nilai Dasar (4 Pilar) */}
                <div className="text-center space-y-8 pt-6">
                    <div>
                        <span className="text-xxs font-extrabold text-teal-600 tracking-wider uppercase block">Karakter Utama</span>
                        <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-800">4 Nilai Karakter Robbani</h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {values.map((val, idx) => (
                            <motion.div
                                key={idx}
                                whileHover={{ y: -5 }}
                                className="bg-white p-6 rounded-3xl shadow-md flex flex-col gap-4 text-left border-b-2 border-slate-100 hover:border-teal-500 transition-colors"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center">
                                    {val.icon}
                                </div>
                                <h4 className="font-bold text-slate-800 text-sm sm:text-base">{val.title}</h4>
                                <p className="text-xs text-slate-500 leading-relaxed">{val.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
