import React, { useEffect, useState } from 'react';
import { adminApi } from '../../../services/api';
import { scrollToTop } from '../../../lib/utils';
import { Save, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Profile() {
    const [welcomeMessage, setWelcomeMessage] = useState('');
    const [history, setHistory] = useState('');
    const [vision, setVision] = useState('');
    const [mission, setMission] = useState('');

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        adminApi.getProfile()
            .then((res) => {
                if (res.success) {
                    setWelcomeMessage(res.data.welcome_message || '');
                    setHistory(res.data.history || '');
                    setVision(res.data.vision || '');
                    setMission(res.data.mission || '');
                }
            })
            .catch((err) => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setSuccessMsg(null);
        setErrorMsg(null);

        const payload = {
            welcome_message: welcomeMessage,
            history,
            vision,
            mission
        };

        adminApi.updateProfile(payload)
            .then((res) => {
                if (res.success) {
                    setSuccessMsg('Profil sekolah berhasil diperbarui.');
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
            <div className="bg-white rounded-xl border border-slate-200/60 p-6 shadow-sm">
                <h2 className="text-xl font-bold text-slate-800 border-b pb-4 mb-6">CMS Profil Sekolah</h2>

                {successMsg && (
                    <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm font-medium rounded-lg mb-6 flex items-center gap-2">
                        <CheckCircle2 size={18} />
                        <span>{successMsg}</span>
                    </div>
                )}

                {errorMsg && (
                    <div className="p-4 bg-rose-50 border border-rose-100 text-rose-700 text-sm font-medium rounded-lg mb-6 flex items-center gap-2">
                        <AlertCircle size={18} />
                        <span>{errorMsg}</span>
                    </div>
                )}

                <form onSubmit={handleSave} className="space-y-6">
                    {/* Welcome Message */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Kata Sambutan Kepala Sekolah</label>
                        <textarea
                            rows={4}
                            value={welcomeMessage}
                            onChange={(e) => setWelcomeMessage(e.target.value)}
                            className="w-full px-4 py-2.5 border rounded-lg focus:ring-1 focus:ring-teal-500 text-sm leading-relaxed"
                            placeholder="Sambutan pembuka..."
                        />
                    </div>

                    {/* History */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Sejarah Singkat Sekolah</label>
                        <textarea
                            rows={6}
                            value={history}
                            onChange={(e) => setHistory(e.target.value)}
                            className="w-full px-4 py-2.5 border rounded-lg focus:ring-1 focus:ring-teal-500 text-sm leading-relaxed"
                            placeholder="Sejarah sekolah..."
                        />
                    </div>

                    {/* Vision */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Visi Sekolah</label>
                        <textarea
                            rows={3}
                            value={vision}
                            onChange={(e) => setVision(e.target.value)}
                            className="w-full px-4 py-2.5 border rounded-lg focus:ring-1 focus:ring-teal-500 text-sm leading-relaxed"
                            placeholder="Visi sekolah..."
                        />
                    </div>

                    {/* Mission */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Misi Sekolah</label>
                        <textarea
                            rows={5}
                            value={mission}
                            onChange={(e) => setMission(e.target.value)}
                            className="w-full px-4 py-2.5 border rounded-lg focus:ring-1 focus:ring-teal-500 text-sm leading-relaxed"
                            placeholder="Gunakan baris baru untuk memisahkan setiap misi..."
                        />
                    </div>

                    <div className="flex justify-end pt-2">
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded transition-all flex items-center gap-1.5 disabled:opacity-50 shadow"
                        >
                            {saving ? (
                                <>
                                    <Loader2 size={14} className="animate-spin" />
                                    <span>Menyimpan...</span>
                                </>
                            ) : (
                                <>
                                    <Save size={14} />
                                    <span>Simpan Perubahan</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
