import React, { useEffect, useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { cmsApi } from '../services/api';

export default function PublicLayout() {
    const location = useLocation();
    const [logoLanding, setLogoLanding] = useState<string | null>(null);
    const [settings, setSettings] = useState<any>({
        school_address: 'Jl. Mangkurejo 41, Kwangsan, Sedati, Sidoarjo',
        school_phone: '087752439572',
        school_email: 'tamanrobbani23@gmail.com',
    });

    useEffect(() => {
        cmsApi.getSettings()
            .then(res => {
                if (res.success && res.data) {
                    if (res.data.school_logo || res.data.logo_landing) {
                        setLogoLanding(res.data.school_logo || res.data.logo_landing);
                    }
                    setSettings((prev: any) => ({
                        ...prev,
                        ...res.data,
                    }));
                }
            })
            .catch(err => console.error(err));
    }, []);

    const navLinks = [
        { path: '/', label: 'Beranda' },
        { path: '/profil', label: 'Profil' },
        { path: '/program', label: 'Program' },
        { path: '/ppdb', label: 'PPDB' },
        { path: '/cek-status', label: 'Cek Status' },
        { path: '/berita', label: 'Berita' },
        { path: '/galeri', label: 'Galeri' },
        { path: '/faq', label: 'FAQ' },
        { path: '/kontak', label: 'Kontak' },
    ];

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-left">
            {/* Navbar Header */}
            <header className="sticky top-0 z-50 bg-white shadow-sm border-none">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        {/* Logo */}
                        <div className="flex-shrink-0 flex items-center gap-3">
                            {logoLanding ? (
                                <img 
                                    src={logoLanding} 
                                    alt="Logo" 
                                    className="h-10 object-contain" 
                                    onError={(e) => {
                                        (e.target as HTMLElement).style.display = 'none';
                                    }}
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center text-white font-bold text-lg font-display">
                                    TR
                                </div>
                            )}
                            <div>
                                <span className="font-display font-bold text-sm sm:text-md text-slate-800 block leading-tight">KB-TK IT Taman Robbani</span>
                                <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Sidoarjo</span>
                            </div>
                        </div>

                        {/* Navigation Menu */}
                        <nav className="hidden md:flex space-x-1">
                            {navLinks.map((link) => {
                                const isActive = location.pathname === link.path;
                                return (
                                    <Link
                                        key={link.path}
                                        to={link.path}
                                        className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors ${
                                            isActive
                                                ? 'bg-teal-50 text-teal-700'
                                                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                                        }`}
                                    >
                                        {link.label}
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* CTAs */}
                        <div className="flex items-center gap-2">
                            <Link
                                to="/ppdb"
                                className="px-4 py-2 text-xs font-bold text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition shadow-xs cursor-pointer"
                            >
                                Daftar Sekarang
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* Page Content Outlet */}
            <main className="flex-grow">
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="bg-slate-900 text-slate-400">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div>
                            <div className="text-white mb-4">
                                <span className="font-display font-bold text-lg text-white">KB-TK IT Taman Robbani</span>
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                                Lembaga pendidikan anak usia dini terpadu berkarakter Islami, cerdas, kreatif, mandiri, dan berwawasan lingkungan.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-display font-semibold text-white text-xs mb-4 uppercase tracking-wider">Tautan Cepat</h3>
                            <ul className="space-y-2 text-xs">
                                <li><Link to="/profil" className="hover:text-white transition-colors">Tentang Kami</Link></li>
                                <li><Link to="/program" className="hover:text-white transition-colors">Program Pendidikan</Link></li>
                                <li><Link to="/ppdb" className="hover:text-white transition-colors">Pendaftaran PPDB</Link></li>
                                <li><Link to="/cek-status" className="hover:text-white transition-colors">Pelacakan Status</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-display font-semibold text-white text-xs mb-4 uppercase tracking-wider">Kontak</h3>
                            <p className="text-xs leading-relaxed space-y-1">
                                <span className="block">{settings.school_address || 'Jl. Mangkurejo 41, Kwangsan, Sedati, Sidoarjo'}</span>
                                <span className="block">
                                    <a
                                        href={`https://wa.me/62${(settings.school_phone || '087752439572').replace(/\D/g, '').replace(/^62|^0/, '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-slate-300 hover:text-teal-400 transition-colors"
                                    >
                                        Telepon / WA: {settings.school_phone || '087752439572'}
                                    </a>
                                </span>
                                <span className="block">
                                    <a
                                        href={`mailto:${settings.school_email || 'tamanrobbani23@gmail.com'}`}
                                        className="text-slate-300 hover:text-teal-400 transition-colors"
                                    >
                                        Email: {settings.school_email || 'tamanrobbani23@gmail.com'}
                                    </a>
                                </span>
                            </p>
                        </div>
                    </div>
                    <div className="mt-8 pt-8 border-t border-slate-800 text-center text-xxs">
                        &copy; {new Date().getFullYear()} KB-TK IT Taman Robbani Sidoarjo. Hak Cipta Dilindungi.
                    </div>
                </div>
            </footer>
        </div>
    );
}
