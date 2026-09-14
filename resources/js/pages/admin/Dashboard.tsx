import React, { useEffect, useState } from 'react';
import { adminApi } from '../../services/api';
import { ClipboardList, CheckCircle2, FileEdit, Clock, Users, Calendar, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SummaryData {
    total: number;
    accepted: number;
    revision: number;
    pending: number;
}

interface ProgramStat {
    id: number;
    name: string;
    code: string;
    count: number;
}

interface Registration {
    id: number;
    registration_number: string;
    full_name: string;
    program: string;
    status: 'pending' | 'revision' | 'accepted';
    created_at: string;
}

interface Activity {
    id: string;
    user_name: string;
    action: string;
    description: string;
    created_at: string;
}

export default function Dashboard() {
    const [summary, setSummary] = useState<SummaryData>({ total: 0, accepted: 0, revision: 0, pending: 0 });
    const [programs, setPrograms] = useState<ProgramStat[]>([]);
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        adminApi.getStats()
            .then((res) => {
                if (res.success) {
                    setSummary(res.data.summary);
                    setPrograms(res.data.programs || []);
                    setRegistrations(res.data.latest_registrations || []);
                    setActivities(res.data.recent_activities || []);
                }
            })
            .catch((err) => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    // Helper: Map status colors
    const getStatusStyle = (status: string) => {
        if (status === 'accepted') return 'bg-emerald-100 text-emerald-800 border border-emerald-300';
        if (status === 'revision' || status === 'rejected') return 'bg-rose-100 text-rose-800 border border-rose-300';
        return 'bg-amber-100 text-amber-800 border border-amber-300'; // pending
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
                <div className="w-10 h-10 border-4 border-slate-700 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-500 font-medium">Memuat statistik dashboard...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* 1. Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Pendaftar', value: summary.total, icon: <Users size={22} />, color: 'bg-slate-900 text-white' },
                    { label: 'Belum Diverifikasi (Pending)', value: summary.pending, icon: <Clock size={22} />, color: 'bg-blue-600 text-white' },
                    { label: 'Perlu Revisi', value: summary.revision, icon: <FileEdit size={22} />, color: 'bg-amber-500 text-white' },
                    { label: 'Diterima', value: summary.accepted, icon: <CheckCircle2 size={22} />, color: 'bg-emerald-600 text-white' },
                ].map((card, idx) => (
                    <div key={idx} className="bg-white rounded-xl border border-slate-200/60 p-6 shadow-sm flex items-center justify-between">
                        <div>
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">{card.label}</span>
                            <span className="text-3xl font-display font-extrabold text-slate-800">{card.value}</span>
                        </div>
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${card.color} shadow-sm`}>
                            {card.icon}
                        </div>
                    </div>
                ))}
            </div>

            {/* 2. Charts & Program Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Custom charts percentage */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/60 p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-6">Statistik Pendaftar per Program</h3>
                    <div className="space-y-6">
                        {programs.map((prog) => {
                            const maxVal = Math.max(...programs.map((p) => p.count), 1);
                            const percent = (prog.count / maxVal) * 100;
                            return (
                                <div key={prog.id} className="space-y-1.5">
                                    <div className="flex justify-between items-center text-sm font-semibold">
                                        <span className="text-slate-700">{prog.name} ({prog.code})</span>
                                        <span className="text-teal-700">{prog.count} Pendaftar</span>
                                    </div>
                                    <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden">
                                        <div
                                            className="bg-teal-600 h-full rounded-full transition-all duration-1000"
                                            style={{ width: `${percent}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Recent activity log list */}
                <div className="bg-white rounded-xl border border-slate-200/60 p-6 shadow-sm flex flex-col justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-1.5">
                            <ClipboardList className="text-slate-500" size={20} /> Log Aktivitas Admin
                        </h3>
                        <div className="space-y-4">
                            {activities.map((act) => (
                                <div key={act.id} className="text-xs border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
                                    <div className="flex justify-between text-slate-400 mb-1 font-semibold">
                                        <span>{act.user_name}</span>
                                        <span>{new Date(act.created_at).toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <p className="text-slate-600 leading-relaxed"><strong className="text-slate-700 font-semibold">{act.action}:</strong> {act.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Latest registrations table */}
            <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-800">Pendaftaran Terbaru</h3>
                    <Link
                        to="/admin/pendaftar"
                        className="text-xs font-bold text-teal-600 hover:text-teal-700 transition flex items-center gap-1"
                    >
                        Lihat Semua Pendaftar <ArrowRight size={14} />
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 text-xs text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100">
                                <th className="p-4 pl-6">No. Registrasi</th>
                                <th className="p-4">Nama Siswa</th>
                                <th className="p-4">Program</th>
                                <th className="p-4">Tanggal Daftar</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 pr-6 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {registrations.map((reg) => (
                                <tr key={reg.id} className="hover:bg-slate-50/50">
                                    <td className="p-4 pl-6 font-semibold tracking-wide text-slate-700">{reg.registration_number}</td>
                                    <td className="p-4 font-bold text-slate-800">{reg.full_name}</td>
                                    <td className="p-4"><span className="px-2 py-0.5 border text-xs font-semibold uppercase bg-slate-150 text-slate-600 rounded">{reg.program}</span></td>
                                    <td className="p-4 text-slate-500">{new Date(reg.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                                    <td className="p-4">
                                        <span className={`px-2.5 py-1 text-xxs font-extrabold uppercase rounded-full border ${getStatusStyle(reg.status)}`}>
                                             {reg.status}
                                        </span>
                                    </td>
                                    <td className="p-4 pr-6 text-right">
                                        <Link
                                            to="/admin/verifikasi"
                                            state={{ selectedId: reg.id }}
                                            className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded transition-colors"
                                        >
                                            Verifikasi
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
