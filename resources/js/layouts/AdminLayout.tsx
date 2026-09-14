import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LayoutDashboard, Users, FileCheck, School, BookOpen, Newspaper, Image, Settings as SettingsIcon, LogOut, Globe, Sliders, ArrowLeft } from 'lucide-react';
import { cmsApi } from '../services/api';

export default function AdminLayout() {
    const location = useLocation();
    const navigate = useNavigate();
    const [schoolLogo, setSchoolLogo] = useState<string | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Check if token exists, otherwise redirect to login immediately
    const token = localStorage.getItem('admin_token');
    const storedUser = localStorage.getItem('admin_user');
    
    useEffect(() => {
        if (!token) {
            navigate('/admin/login');
        } else {
            cmsApi.getSettings()
                .then((res) => {
                    if (res.data?.school_logo) {
                        setSchoolLogo(res.data.school_logo);
                    }
                })
                .catch(() => {});
        }
    }, [token, navigate]);

    // Close sidebar on route change
    useEffect(() => {
        setSidebarOpen(false);
    }, [location.pathname]);

    if (!token) {
        return null;
    }

    const user = storedUser ? JSON.parse(storedUser) : { name: 'Admin Robbani', email: 'admin' };

    const navItems = [
        { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/admin/pendaftar', label: 'Daftar Pendaftar', icon: Users },
        { path: '/admin/verifikasi', label: 'Verifikasi Berkas', icon: FileCheck },
        { path: '/admin/cms/beranda', label: 'CMS Beranda', icon: Sliders },
        { path: '/admin/cms/profil', label: 'CMS Profil', icon: School },
        { path: '/admin/cms/program', label: 'CMS Program', icon: BookOpen },
        { path: '/admin/cms/berita', label: 'CMS Berita', icon: Newspaper },
        { path: '/admin/cms/galeri', label: 'CMS Galeri', icon: Image },
        { path: '/admin/settings', label: 'Pengaturan', icon: SettingsIcon },
    ];

    const handleLogout = () => {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        navigate('/admin/login');
    };

    return (
        <div className="h-screen w-full flex bg-slate-50/70 font-sans overflow-hidden relative">
            {/* Mobile Backdrop Overlay */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-30 lg:hidden animate-in fade-in duration-200"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar Left (Responsive: Drawer on Mobile, Fixed column on Desktop) */}
            <aside className={`
                fixed inset-y-0 left-0 z-40 w-64 h-full bg-slate-900 text-slate-300 flex flex-col justify-between shadow-2xl transition-transform duration-200 ease-in-out
                lg:static lg:translate-x-0 lg:shadow-md lg:flex-shrink-0
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="flex flex-col flex-1 overflow-y-auto no-scrollbar">
                    {/* Brand Header */}
                    <div className="h-16 flex items-center justify-between px-6 bg-slate-950/40 border-b border-slate-800/60 flex-shrink-0">
                        <div className="flex items-center gap-3">
                            {schoolLogo ? (
                                <img src={schoolLogo} alt="Logo" className="w-8 h-8 rounded-xl object-contain bg-white/10 p-0.5 shadow-sm" />
                            ) : (
                                <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 flex items-center justify-center font-bold text-white font-display shadow-sm shadow-teal-500/20">
                                    TR
                                </div>
                            )}
                            <span className="font-display font-extrabold text-sm tracking-wide text-white">PPDB Admin</span>
                        </div>

                        {/* Close button for mobile */}
                        <button
                            type="button"
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Navigation list */}
                    <nav className="mt-6 px-4 space-y-1.5 flex-1">
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            const IconComponent = item.icon;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-2.5 text-xs font-bold rounded-xl transition-all duration-150 ${
                                        isActive
                                            ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-md shadow-teal-950/30'
                                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                                    }`}
                                >
                                    <IconComponent size={16} className={isActive ? 'text-white' : 'text-slate-400'} />
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Sidebar Footer User profile */}
                <div className="p-4 border-t border-slate-800 bg-slate-950/30 flex flex-col gap-2.5 flex-shrink-0">
                    <div className="px-2">
                        <p className="text-xs font-extrabold text-white truncate">{user.name}</p>
                        <p className="text-[10px] text-slate-500 font-semibold truncate mt-0.5">{user.email}</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-2 py-2 text-xxs font-extrabold text-rose-400 hover:text-rose-350 hover:bg-slate-800/50 rounded-xl transition-all cursor-pointer"
                    >
                        <LogOut size={14} />
                        <span>Keluar</span>
                    </button>
                </div>
            </aside>

            {/* Content Area */}
            <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
                {/* Header */}
                <header className="h-16 bg-white border-b border-slate-100 shadow-xs flex items-center justify-between px-4 sm:px-8 flex-shrink-0 z-10">
                    <div className="flex items-center gap-2 sm:gap-3">
                        {/* Mobile Hamburger Button */}
                        <button
                            type="button"
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2 -ml-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                            title="Buka Menu"
                        >
                            <Menu size={20} />
                        </button>

                        {/* Sequential Back Button */}
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition cursor-pointer flex items-center justify-center"
                            title="Kembali ke halaman sebelumnya"
                        >
                            <ArrowLeft size={18} />
                        </button>

                        <h2 className="font-display font-extrabold text-sm sm:text-base text-slate-800 truncate">
                            {navItems.find((n) => n.path === location.pathname)?.label || 'Panel Admin'}
                        </h2>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-4 text-xs font-semibold text-slate-500">
                        <span className="hidden md:inline">Layanan PPDB KB-TK IT Taman Robbani</span>
                        <a
                            href="/"
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xxs font-bold border border-slate-200 bg-white rounded-xl hover:bg-slate-50 transition cursor-pointer text-slate-650"
                        >
                            <Globe size={13} className="text-teal-600" />
                            <span className="hidden sm:inline">Kunjungi Portal Publik</span>
                            <span className="sm:hidden">Portal</span>
                        </a>
                    </div>
                </header>

                {/* Sub-page Outlet */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto no-scrollbar w-full">
                    <div className="w-full">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
