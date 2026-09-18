import React, { useEffect, useState } from 'react';
import { adminApi } from '../../../services/api';
import { scrollToTop } from '../../../lib/utils';
import { Save, Loader2, CheckCircle2, AlertCircle, Plus, Trash2, CheckCircle, Award } from 'lucide-react';

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
    const [welcomeMessage, setWelcomeMessage] = useState('');
    const [history, setHistory] = useState('');
    const [vision, setVision] = useState('');
    const [mission, setMission] = useState('');
    const [goals, setGoals] = useState<string[]>(DEFAULT_GOALS);
    const [gradCompetencies, setGradCompetencies] = useState<string[]>(DEFAULT_SKL);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        adminApi.getProfile()
            .then((res) => {
                if (res.success && res.data) {
                    setWelcomeMessage(res.data.welcome_message || '');
                    setHistory(res.data.history || '');
                    setVision(res.data.vision || '');
                    setMission(res.data.mission || '');
                    if (res.data.goals && Array.isArray(res.data.goals) && res.data.goals.length > 0) {
                        setGoals(res.data.goals);
                    }
                    if (res.data.grad_competencies && Array.isArray(res.data.grad_competencies) && res.data.grad_competencies.length > 0) {
                        setGradCompetencies(res.data.grad_competencies);
                    }
                }
            })
            .catch((err) => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const handleGoalChange = (index: number, val: string) => {
        const newGoals = [...goals];
        newGoals[index] = val;
        setGoals(newGoals);
    };

    const addGoal = () => {
        setGoals([...goals, '']);
    };

    const removeGoal = (index: number) => {
        setGoals(goals.filter((_, i) => i !== index));
    };

    const handleSklChange = (index: number, val: string) => {
        const newSkl = [...gradCompetencies];
        newSkl[index] = val;
        setGradCompetencies(newSkl);
    };

    const addSkl = () => {
        setGradCompetencies([...gradCompetencies, '']);
    };

    const removeSkl = (index: number) => {
        setGradCompetencies(gradCompetencies.filter((_, i) => i !== index));
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setSuccessMsg(null);
        setErrorMsg(null);

        const payload = {
            welcome_message: welcomeMessage,
            history,
            vision,
            mission,
            goals: goals.filter(g => g.trim().length > 0),
            grad_competencies: gradCompetencies.filter(s => s.trim().length > 0),
        };

        adminApi.updateProfile(payload)
            .then((res) => {
                if (res.success) {
                    setSuccessMsg('Profil sekolah, visi-misi, tujuan, dan SKL berhasil diperbarui.');
                    scrollToTop();
                }
            })
            .catch((err) => {
                console.error(err);
                setErrorMsg('Gagal memperbarui profil sekolah.');
                scrollToTop();
            })
            .finally(() => setSaving(false));
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
                <div className="w-8 h-8 border-3 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-500 text-xs font-semibold">Memuat data profil sekolah...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/60 p-6 sm:p-8 shadow-sm">
                <div className="border-b pb-4 mb-6">
                    <h2 className="text-xl font-bold text-slate-800">CMS Profil Sekolah & Kurikulum</h2>
                    <p className="text-xs text-slate-500 mt-1">Kelola Visi, Misi, Tujuan Sekolah, Standar Kompetensi Lulusan (SKL), dan kata sambutan resmi.</p>
                </div>

                {successMsg && (
                    <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm font-medium rounded-xl mb-6 flex items-center gap-2">
                        <CheckCircle2 size={18} />
                        <span>{successMsg}</span>
                    </div>
                )}

                {errorMsg && (
                    <div className="p-4 bg-rose-50 border border-rose-100 text-rose-700 text-sm font-medium rounded-xl mb-6 flex items-center gap-2">
                        <AlertCircle size={18} />
                        <span>{errorMsg}</span>
                    </div>
                )}

                <form onSubmit={handleSave} className="space-y-8">
                    {/* Welcome Message */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Kata Sambutan Kepala Sekolah</label>
                        <textarea
                            rows={4}
                            value={welcomeMessage}
                            onChange={(e) => setWelcomeMessage(e.target.value)}
                            className="w-full px-4 py-2.5 border rounded-xl focus:ring-1 focus:ring-teal-500 text-sm leading-relaxed"
                            placeholder="Sambutan pembuka kepala sekolah..."
                        />
                    </div>

                    {/* History */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Sejarah Singkat Sekolah</label>
                        <textarea
                            rows={5}
                            value={history}
                            onChange={(e) => setHistory(e.target.value)}
                            className="w-full px-4 py-2.5 border rounded-xl focus:ring-1 focus:ring-teal-500 text-sm leading-relaxed"
                            placeholder="Sejarah berdirinya KB-TK IT Taman Robbani..."
                        />
                    </div>

                    {/* Vision */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Visi Sekolah</label>
                        <textarea
                            rows={2}
                            value={vision}
                            onChange={(e) => setVision(e.target.value)}
                            className="w-full px-4 py-2.5 border rounded-xl focus:ring-1 focus:ring-teal-500 text-sm leading-relaxed font-semibold"
                            placeholder="Visi sekolah (misal: Menciptakan Generasi Robbani Sejak Dini)..."
                        />
                    </div>

                    {/* Mission */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Misi Sekolah</label>
                        <textarea
                            rows={5}
                            value={mission}
                            onChange={(e) => setMission(e.target.value)}
                            className="w-full px-4 py-2.5 border rounded-xl focus:ring-1 focus:ring-teal-500 text-sm leading-relaxed"
                            placeholder="Gunakan baris baru untuk memisahkan setiap butir misi..."
                        />
                    </div>

                    {/* Goals (Tujuan Sekolah - 10 Poin) */}
                    <div className="pt-4 border-t border-slate-100 space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                    <CheckCircle size={16} className="text-emerald-600" />
                                    <span>Tujuan Sekolah ({goals.length} Butir)</span>
                                </h3>
                                <p className="text-xxs text-slate-400">Poin capaian dan tujuan institusi pendidikan sekolah</p>
                            </div>
                            <button
                                type="button"
                                onClick={addGoal}
                                className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs rounded-lg flex items-center gap-1 transition-colors"
                            >
                                <Plus size={14} />
                                <span>Tambah Butir</span>
                            </button>
                        </div>

                        <div className="space-y-2.5">
                            {goals.map((goal, idx) => (
                                <div key={idx} className="flex items-start gap-2">
                                    <span className="w-7 h-9 flex items-center justify-center font-bold text-xs text-slate-400 bg-slate-100 rounded-lg flex-shrink-0">
                                        {idx + 1}
                                    </span>
                                    <input
                                        type="text"
                                        value={goal}
                                        onChange={(e) => handleGoalChange(idx, e.target.value)}
                                        className="flex-1 px-3.5 py-2 border border-slate-200 rounded-lg text-xs sm:text-sm focus:ring-1 focus:ring-teal-500"
                                        placeholder={`Tujuan butir ke-${idx + 1}...`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeGoal(idx)}
                                        className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                                        title="Hapus butir"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Standar Kompetensi Lulusan (SKL - 8 Poin) */}
                    <div className="pt-4 border-t border-slate-100 space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                    <Award size={16} className="text-amber-600" />
                                    <span>Standar Kompetensi Lulusan / SKL ({gradCompetencies.length} Butir)</span>
                                </h3>
                                <p className="text-xxs text-slate-400">Target kelulusan santri KB-TK IT Taman Robbani</p>
                            </div>
                            <button
                                type="button"
                                onClick={addSkl}
                                className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs rounded-lg flex items-center gap-1 transition-colors"
                            >
                                <Plus size={14} />
                                <span>Tambah SKL</span>
                            </button>
                        </div>

                        <div className="space-y-2.5">
                            {gradCompetencies.map((skl, idx) => (
                                <div key={idx} className="flex items-start gap-2">
                                    <span className="w-7 h-9 flex items-center justify-center font-bold text-xs text-amber-800 bg-amber-100 rounded-lg flex-shrink-0">
                                        {idx + 1}
                                    </span>
                                    <input
                                        type="text"
                                        value={skl}
                                        onChange={(e) => handleSklChange(idx, e.target.value)}
                                        className="flex-1 px-3.5 py-2 border border-slate-200 rounded-lg text-xs sm:text-sm focus:ring-1 focus:ring-teal-500"
                                        placeholder={`Target SKL ke-${idx + 1}...`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeSkl(idx)}
                                        className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                                        title="Hapus SKL"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-slate-100">
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-2 disabled:opacity-50 shadow-sm cursor-pointer"
                        >
                            {saving ? (
                                <>
                                    <Loader2 size={15} className="animate-spin" />
                                    <span>Menyimpan Perubahan...</span>
                                </>
                            ) : (
                                <>
                                    <Save size={15} />
                                    <span>Simpan Seluruh Data Profil</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

