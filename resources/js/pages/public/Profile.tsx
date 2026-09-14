import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, ShieldCheck, Heart, Sparkles, Building2, MapPin, Eye, Target, Quote, Phone, Mail, MessageCircle } from 'lucide-react';
import { cmsApi } from '../../services/api';

export default function Profile() {
    const [history, setHistory] = useState<string>('');
    const [vision, setVision] = useState<string>('');
    const [mission, setMission] = useState<string>('');
    const [welcomeMessage, setWelcomeMessage] = useState<string>('');
    const [settings, setSettings] = useState<any>({
        school_address: 'Jl. Mangkurejo 41, Kwangsan, Sedati, Sidoarjo',
        school_phone: '087752439572',
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

    // Helper to format mission points cleanly
    const missionLines = (mission || "1. Menyelenggarakan pendidikan berbasis nilai-nilai Islam.\n2. Mengembangkan bakat, kreativitas, dan kemandirian anak.\n3. Menciptakan lingkungan belajar yang menyenangkan, bersih, sehat, dan kondusif.\n4. Membangun sinergi yang harmonis antara sekolah, orang tua, dan masyarakat.")
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
                        Mengenal lebih dekat KB-TK IT Taman Robbani Sidoarjo, visi misi, sejarah, kata sambutan, dan nilai-nilai dasar kami.
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
                            Mendidik dengan Sepenuh Hati & Berkarakter Qur'an
                        </h2>
                        <p className="text-teal-50/90 text-sm sm:text-base leading-relaxed whitespace-pre-line pt-2">
                            {welcomeMessage || "Selamat datang di PPDB Online KB-TK IT Taman Robbani Sidoarjo. Kami berkomitmen memberikan layanan pendidikan anak usia dini terbaik dengan kurikulum Islami terpadu yang merangsang seluruh dimensi kecerdasan dan akhlak anak."}
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
                                    <span className="text-xxs font-extrabold text-teal-650 tracking-wider uppercase block">Landasan Cita-Cita</span>
                                    <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Visi Sekolah</h2>
                                </div>
                            </div>
                            <div className="p-5 bg-teal-50/50 rounded-2xl border border-teal-100/70">
                                <p className="text-slate-700 font-medium text-sm sm:text-base leading-relaxed italic">
                                    "{vision || "Terwujudnya anak usia dini yang berkarakter Islami, cerdas, kreatif, mandiri, dan berwawasan lingkungan."}"
                                </p>
                            </div>
                        </div>
                        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-400">
                            <Sparkles size={16} className="text-amber-500" />
                            <span>Komitmen mendidik sejak tahun 2015</span>
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
                                    // Strip leading number if present for a clean badge
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

                {/* 3. Sejarah Singkat & Lokasi/Kontak */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Sejarah (Left) */}
                    <div className="lg:col-span-7 bg-white p-8 rounded-3xl shadow-md">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-teal-700 flex items-center justify-center">
                                <Building2 size={26} />
                            </div>
                            <div>
                                <span className="text-xxs font-extrabold text-slate-400 tracking-wider uppercase block">Rekam Jejak</span>
                                <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Sejarah Singkat</h2>
                            </div>
                        </div>
                        <p className="text-slate-600 leading-relaxed whitespace-pre-line text-xs sm:text-sm">
                            {history || 'KB-TK IT Taman Robbani Sidoarjo didirikan pada tahun 2015 dengan visi mencetak generasi unggul, berakhlak mulia, cerdas, dan mandiri berlandaskan nilai-nilai Islam Terpadu. Kami terus berinovasi untuk mendampingi tumbuh kembang anak secara menyeluruh melalui stimulasi terarah dan suasana bermain yang penuh kasih sayang.'}
                        </p>
                    </div>

                    {/* Alamat & Kontak (Right) */}
                    <div className="lg:col-span-5 bg-white p-8 rounded-3xl shadow-md flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
                                    <MapPin size={26} />
                                </div>
                                <div>
                                    <span className="text-xxs font-extrabold text-teal-600 tracking-wider uppercase block">Kunjungi Kami</span>
                                    <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Lokasi & Kontak</h2>
                                </div>
                            </div>
                            
                            <div className="space-y-4 text-xs sm:text-sm">
                                <div className="p-3.5 bg-slate-50 rounded-xl">
                                    <span className="text-xxs font-bold text-slate-400 uppercase block mb-1">Alamat Resmi</span>
                                    <p className="text-slate-700 font-semibold leading-relaxed">
                                        {settings.school_address || 'Jl. Mangkurejo 41, Kwangsan, Sedati, Sidoarjo'}
                                    </p>
                                </div>

                                <div className="p-3.5 bg-slate-50 rounded-xl space-y-2">
                                    <span className="text-xxs font-bold text-slate-400 uppercase block">Hubungi Langsung</span>
                                    <div className="flex items-center gap-2">
                                        <Phone size={16} className="text-teal-600 flex-shrink-0" />
                                        <a
                                            href="https://wa.me/6287752439572"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-teal-700 hover:text-teal-800 font-bold hover:underline inline-flex items-center gap-1.5"
                                        >
                                            <span>{settings.school_phone || '087752439572'}</span>
                                            <span className="text-xxs px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-semibold">WhatsApp</span>
                                        </a>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Mail size={16} className="text-teal-600 flex-shrink-0" />
                                        <a
                                            href={`mailto:${settings.school_email || 'tamanrobbani23@gmail.com'}`}
                                            className="text-slate-700 hover:text-teal-700 font-medium hover:underline"
                                        >
                                            {settings.school_email || 'tamanrobbani23@gmail.com'}
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4">
                            <a
                                href="https://wa.me/6287752439572"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors shadow-xs"
                            >
                                <MessageCircle size={16} />
                                <span>Hubungi via WhatsApp</span>
                            </a>
                        </div>
                    </div>
                </div>

                {/* 4. Values Section */}
                <div>
                    <div className="text-center max-w-3xl mx-auto mb-10">
                        <span className="text-xxs font-extrabold text-teal-650 tracking-wider uppercase block">Karakter Unggulan</span>
                        <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mt-1">Nilai Karakter Utama</h2>
                        <p className="mt-2 text-slate-500 text-xs sm:text-sm">Nilai-nilai luhur yang kami tanamkan kepada setiap anak didik sejak dini.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
