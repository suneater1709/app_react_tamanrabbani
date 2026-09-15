import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ArrowRight, ChevronRight, BookOpen } from 'lucide-react';

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

export default function Programs() {
    const location = useLocation();
    const navigate = useNavigate();
    const [selectedProgramId, setSelectedProgramId] = useState<string | null>('pg');
    const detailRef = useRef<HTMLDivElement>(null);

    // Auto-scroll handler to class detail section
    const handleSelectProgram = (progId: string) => {
        setSelectedProgramId(progId);
        setTimeout(() => {
            detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    };

    // Pre-select program from home navigation if exists & auto-scroll
    useEffect(() => {
        const stateSelectedId = location.state?.selectedId;
        if (stateSelectedId) {
            setSelectedProgramId(stateSelectedId);
            setTimeout(() => {
                detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 200);
        }
    }, [location.state]);

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

    const currentProgram = programsData.find(p => p.id === selectedProgramId) || programsData[0];

    return (
        <div className="py-16 bg-slate-50 min-h-screen text-left">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Title */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 text-xxs font-extrabold uppercase tracking-widest rounded-full mb-3">
                        PROGRAM UNGGULAN
                    </span>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800">Pilihan Program Pendidikan</h1>
                    <p className="mt-4 text-slate-500 text-xs sm:text-sm leading-relaxed">
                        Kami membagi kelas berdasarkan kelompok usia demi mengoptimalkan stimulus belajar anak yang sesuai dengan tahap tumbuh kembangnya.
                    </p>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {programsData.map((prog) => {
                        const isSelected = selectedProgramId === prog.id;
                        return (
                            <motion.div
                                key={prog.id}
                                whileHover={{ y: -8, scale: 1.02 }}
                                onClick={() => handleSelectProgram(prog.id)}
                                className={`bg-white rounded-3xl p-6 flex flex-col justify-between shadow-md hover:shadow-lg cursor-pointer transition-all duration-300 relative overflow-hidden ${
                                    isSelected ? 'ring-2 ring-teal-500' : 'border-none'
                                }`}
                            >
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="px-3 py-1 bg-teal-50 text-teal-850 text-xxs font-bold rounded-full">
                                            {prog.age}
                                        </span>
                                    </div>
                                    
                                    <h3 className="text-md sm:text-lg font-bold text-slate-800">{prog.name}</h3>
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
                                            handleSelectProgram(prog.id);
                                        }}
                                        className="text-xxs font-bold text-teal-650 hover:text-teal-700 flex items-center gap-1 cursor-pointer"
                                    >
                                        <span>Lihat Detail Kelas</span>
                                        <ChevronRight size={14} />
                                    </button>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Class details panel with scroll anchor */}
                <div ref={detailRef} id="detail-penjelasan-kelas" className="scroll-mt-24">
                    <AnimatePresence mode="wait">
                        {selectedProgramId && (
                            <motion.div
                                key={selectedProgramId}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                className="mt-12 bg-white rounded-3xl p-6 sm:p-10 shadow-lg"
                            >
                                <div className="border-l-4 border-teal-500 pl-4 mb-8">
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        <span className="px-3 py-1 bg-teal-50 text-teal-800 text-xxs font-bold rounded-full">Target Usia: {currentProgram.age}</span>
                                        <span className="px-3 py-1 bg-blue-50 text-blue-800 text-xxs font-bold rounded-full">Jam: {currentProgram.schedule}</span>
                                    </div>
                                    <h3 className="text-xl sm:text-2xl font-bold text-slate-800">{currentProgram.name}</h3>
                                    <p className="text-slate-500 text-xs sm:text-sm mt-3 leading-relaxed max-w-4xl">{currentProgram.description}</p>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                                    {/* Checklist */}
                                    <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
                                        <div>
                                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Materi Pokok Pembelajaran:</h4>
                                            <ul className="space-y-2 text-xs text-slate-600">
                                                {currentProgram.materi.map((item, idx) => (
                                                    <li key={idx} className="flex items-start gap-2">
                                                        <span className="text-teal-500 mt-0.5">•</span>
                                                        <span>{item}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Fasilitas Khusus Kelas:</h4>
                                            <ul className="space-y-2 text-xs text-slate-600">
                                                {currentProgram.fasilitas.map((item, idx) => (
                                                    <li key={idx} className="flex items-start gap-2">
                                                        <span className="text-amber-500 mt-0.5">•</span>
                                                        <span>{item}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>

                                    {/* Sidebar info card */}
                                    <div className="lg:col-span-4 bg-slate-50 p-6 rounded-2xl space-y-6">
                                        <div className="space-y-3">
                                            <span className="text-xxs font-bold text-slate-400 uppercase tracking-wider block">Kelebihan Program:</span>
                                            <ul className="space-y-2 text-xs text-slate-600">
                                                {currentProgram.kelebihan.map((item, idx) => (
                                                    <li key={idx} className="flex items-start gap-2">
                                                        <CheckCircle2 className="text-teal-500 mt-0.5 flex-shrink-0" size={14} />
                                                        <span>{item}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => navigate('/ppdb')}
                                            className="w-full py-3 bg-teal-650 hover:bg-teal-700 text-white font-bold rounded-xl text-xs transition-all shadow hover:shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                                        >
                                            <span>Daftar Kelas Ini Sekarang</span>
                                            <ArrowRight size={14} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

            </div>
        </div>
    );
}
