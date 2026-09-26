import React, { useEffect, useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Menu, X, Home, Users, GraduationCap, FileText, 
    Search, Newspaper, Image, HelpCircle, Phone, ArrowRight, Sparkles
} from 'lucide-react';
import { cmsApi } from '../services/api';

export default function PublicLayout() {
    const location = useLocation();
    const [logoLanding, setLogoLanding] = useState<string | null>(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [settings, setSettings] = useState<any>({
        school_address: 'Jl. Mangkurejo 41, Kwangsan, Sedati, Sidoarjo',
        school_phone: '0816503293',
        school_email: 'tamanrobbani23@gmail.com',
    });

    // Auto-close mobile menu on route change
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location.pathname]);

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
        { path: '/', label: 'Beranda', icon: Home },
        { path: '/profil', label: 'Profil', icon: Users },
        { path: '/program', label: 'Program', icon: GraduationCap },
        { path: '/ppdb', label: 'PPDB', icon: FileText },
        { path: '/cek-status', label: 'Cek Status', icon: Search },
        { path: '/berita', label: 'Berita', icon: Newspaper },
        { path: '/galeri', label: 'Galeri', icon: Image },
        { path: '/faq', label: 'FAQ', icon: HelpCircle },
        { path: '/kontak', label: 'Kontak', icon: Phone },
    ];

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-left">
            {/* Navbar Header */}
            <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-xs border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center gap-2">
                        {/* Logo */}
                        <Link to="/" className="flex-shrink-0 flex items-center gap-2.5 group">
                            {logoLanding ? (
                                <img 
                                    src={logoLanding} 
                                    alt="Logo KB-TK IT Taman Robbani" 
                                    className="h-9 sm:h-10 w-auto object-contain" 
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
                                <div className="w-9 h-9 sm:h-10 sm:w-10 rounded-xl bg-teal-600 flex items-center justify-center text-white font-bold text-base sm:text-lg font-display shadow-xs group-hover:bg-teal-700 transition">
                                    TR
                                </div>
                            )}
                            <div className="min-w-0">
                                <span className="font-display font-extrabold text-xs sm:text-sm md:text-base text-slate-850 block leading-tight truncate">
                                    KB-TK IT Taman Robbani
                                </span>
                                <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
                                    Sidoarjo
                                </span>
                            </div>
                        </Link>

                        {/* Desktop Navigation Menu */}
                        <nav className="hidden lg:flex items-center space-x-1">
                            {navLinks.map((link) => {
                                const isActive = location.pathname === link.path;
                                return (
                                    <Link
                                        key={link.path}
                                        to={link.path}
                                        className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                                            isActive
                                                ? 'bg-teal-50 text-teal-750 shadow-2xs'
                                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                                        }`}
                                    >
                                        {link.label}
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Right CTAs & Mobile Hamburger Toggle */}
                        <div className="flex items-center gap-2">
                            {/* CTA Button (Visible on Tablet & Desktop, hidden on small mobile to keep header clean) */}
                            <Link
                                to="/ppdb?form=true"
                                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-teal-600 rounded-xl hover:bg-teal-700 transition shadow-xs whitespace-nowrap cursor-pointer hover:shadow-md"
                            >
                                <span>Daftar Sekarang</span>
                                <ArrowRight size={13} />
                            </Link>

                            {/* Mobile Menu Button (Hamburger) */}
                            <button
                                type="button"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="lg:hidden p-2.5 rounded-xl text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors focus:outline-hidden cursor-pointer flex items-center gap-1.5"
                                aria-label="Menu Navigasi"
                            >
                                <span className="text-xs font-bold text-slate-600 sm:hidden">
                                    {mobileMenuOpen ? 'Tutup' : 'Menu'}
                                </span>
                                {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Navigation Drawer / Dropdown */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="lg:hidden bg-white border-t border-slate-100 shadow-2xl overflow-hidden"
                        >
                            <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
                                {/* Navigation Links Grid (Clean & Easy to Tap) */}
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {navLinks.map((link) => {
                                        const Icon = link.icon;
                                        const isActive = location.pathname === link.path;
                                        return (
                                            <Link
                                                key={link.path}
                                                to={link.path}
                                                onClick={() => setMobileMenuOpen(false)}
                                                className={`flex items-center gap-2.5 px-3.5 py-3 rounded-2xl text-xs font-bold transition-all ${
                                                    isActive
                                                        ? 'bg-teal-600 text-white shadow-md shadow-teal-600/25'
                                                        : 'bg-slate-100/80 hover:bg-slate-200/80 text-slate-700'
                                                }`}
                                            >
                                                <Icon size={16} className={isActive ? 'text-white' : 'text-teal-600'} />
                                                <span>{link.label}</span>
                                            </Link>
                                        );
                                    })}
                                </div>

                                {/* Primary PPDB Action in Mobile Menu */}
                                <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
                                    <Link
                                        to="/ppdb?form=true"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white text-center font-bold text-xs sm:text-sm rounded-2xl shadow-md shadow-teal-600/20 flex items-center justify-center gap-2 transition cursor-pointer"
                                    >
                                        <Sparkles size={15} />
                                        <span>Daftar PPDB Online 2026/2027</span>
                                        <ArrowRight size={14} />
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
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
                                        href={`https://wa.me/62${(settings.school_phone || '0816503293').replace(/\D/g, '').replace(/^62|^0/, '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-slate-300 hover:text-teal-400 transition-colors"
                                    >
                                        Telepon / WA: {settings.school_phone || '0816503293'}
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
