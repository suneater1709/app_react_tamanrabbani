import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { User, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { adminApi, cmsApi } from '../../services/api';

const loginSchema = z.object({
    email: z.string().min(3, 'Email atau username wajib diisi.'),
    password: z.string().min(5, 'Kata sandi wajib diisi.'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
    const navigate = useNavigate();
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [schoolLogo, setSchoolLogo] = useState<string | null>(null);

    useEffect(() => {
        cmsApi.getSettings()
            .then((res) => {
                if (res.data?.school_logo) {
                    setSchoolLogo(res.data.school_logo);
                }
            })
            .catch(() => {});
    }, []);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = (data: LoginFormData) => {
        setLoading(true);
        setErrorMsg(null);

        adminApi.login(data)
            .then((res) => {
                if (res.success && res.data.token) {
                    localStorage.setItem('admin_token', res.data.token);
                    localStorage.setItem('admin_user', JSON.stringify(res.data.user));
                    navigate('/admin/dashboard');
                }
            })
            .catch((err) => {
                console.error(err);
                if (err.response?.data?.message) {
                    setErrorMsg(err.response.data.message);
                } else {
                    setErrorMsg('Username/email atau password Anda salah.');
                }
            })
            .finally(() => setLoading(false));
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 text-left font-sans">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-lg p-8 sm:p-10 border-none">
                
                {/* Logo & Header Branding */}
                <div className="flex flex-col items-center text-center mb-8">
                    {/* School Logo */}
                    {schoolLogo ? (
                        <img 
                            src={schoolLogo} 
                            alt="Logo KB-TK IT Taman Robbani" 
                            className="w-16 h-16 object-contain mb-4" 
                            onError={(e) => {
                                const target = e.currentTarget;
                                if (!target.src.endsWith('/images/logo.png')) {
                                    target.src = '/images/logo.png';
                                } else {
                                    target.style.display = 'none';
                                }
                            }}
                        />
                    ) : (
                        <div className="w-16 h-16 text-teal-650 mb-4">
                            <svg viewBox="0 0 100 100" className="w-full h-full fill-current">
                                <path d="M50,10 L85,30 L85,70 L50,90 L15,70 L15,30 Z" fill="none" stroke="currentColor" strokeWidth="6" />
                                <path d="M50,18 L78,34 L78,66 L50,82 L22,66 L22,34 Z" fill="currentColor" opacity="0.15" />
                                <path d="M35,45 C35,35 65,35 65,45 C65,55 35,55 35,65 C35,70 65,70 65,65" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
                                <circle cx="50" cy="30" r="4" fill="currentColor" />
                            </svg>
                        </div>
                    )}
                    
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800">Login Portal Admin</h2>
                    <p className="text-xs text-slate-400 mt-2 max-w-xs leading-relaxed">
                        Khusus guru dan panitia administrasi KB-TK IT Taman Robbani untuk mengelola data siswa baru.
                    </p>
                </div>

                {errorMsg && (
                    <div className="p-3.5 bg-rose-50 text-rose-700 text-xs font-semibold rounded-xl mb-6 flex items-center gap-2">
                        <AlertCircle size={16} />
                        <span>{errorMsg}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Username/Email Input */}
                    <div>
                        <label className="block text-xxs font-bold text-slate-500 uppercase tracking-wider mb-2">EMAIL / USERNAME</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-450">
                                <User size={16} />
                            </span>
                            <input
                                type="text"
                                {...register('email')}
                                className="w-full pl-10 pr-4 py-3 border border-slate-100 bg-slate-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-xs sm:text-sm font-semibold"
                                placeholder="Contoh: admin atau nama@domain.com"
                            />
                        </div>
                        {errors.email && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.email.message}</p>}
                    </div>

                    {/* Password Input */}
                    <div>
                        <label className="block text-xxs font-bold text-slate-500 uppercase tracking-wider mb-2">PASSWORD</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-455">
                                <Lock size={16} />
                            </span>
                            <input
                                type="password"
                                {...register('password')}
                                className="w-full pl-10 pr-4 py-3 border border-slate-100 bg-slate-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-xs sm:text-sm font-semibold"
                                placeholder="••••••••"
                            />
                        </div>
                        {errors.password && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.password.message}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow hover:shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                        {loading ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                <span>Menghubungkan...</span>
                            </>
                        ) : (
                            <>
                                <span>Masuk Portal Admin</span>
                                <span className="font-semibold">&rsaquo;</span>
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                    <a href="/" className="text-xxs font-bold text-slate-450 hover:text-slate-650 transition">
                        &mdash; Kembali ke Beranda PPDB
                    </a>
                </div>

            </div>
        </div>
    );
}
