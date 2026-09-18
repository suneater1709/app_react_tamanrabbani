import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';

// Public Pages
import Home from './pages/public/Home';
import Profile from './pages/public/Profile';
import Programs from './pages/public/Programs';
import Admission from './pages/public/Admission';
import Revision from './pages/public/Revision';
import Status from './pages/public/Status';
import NewsList from './pages/public/NewsList';
import NewsDetail from './pages/public/NewsDetail';
import GalleryView from './pages/public/GalleryView';
import FaqView from './pages/public/FaqView';
import ContactView from './pages/public/ContactView';

import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import AdminPendaftar from './pages/admin/Pendaftar';
import AdminVerification from './pages/admin/Verification';
import AdminCmsHome from './pages/admin/cms/HomeCms';
import AdminCmsProfile from './pages/admin/cms/Profile';
import AdminCmsProgram from './pages/admin/cms/Program';
import AdminCmsNews from './pages/admin/cms/News';
import AdminCmsGallery from './pages/admin/cms/Gallery';
import AdminCmsFaq from './pages/admin/cms/Faq';
import AdminExport from './pages/admin/Export';
import AdminGoogleSheet from './pages/admin/GoogleSheet';
import AdminSettings from './pages/admin/Settings';
import NotFound from './pages/public/NotFound';

export default function AppRoot() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public Portal Routes */}
                <Route path="/" element={<PublicLayout />}>
                    <Route index element={<Home />} />
                    <Route path="profil" element={<Profile />} />
                    <Route path="program" element={<Programs />} />
                    <Route path="ppdb" element={<Admission />} />
                    <Route path="ppdb/revisi/:regNumber" element={<Revision />} />
                    <Route path="cek-status" element={<Status />} />
                    <Route path="berita" element={<NewsList />} />
                    <Route path="berita/:slug" element={<NewsDetail />} />
                    <Route path="galeri" element={<GalleryView />} />
                    <Route path="faq" element={<FaqView />} />
                    <Route path="kontak" element={<ContactView />} />
                </Route>

                {/* Admin Auth Route */}
                <Route path="/admin/login" element={<AdminLogin />} />

                {/* Admin Dashboard Routes */}
                <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<Navigate to="/admin/dashboard" replace />} />
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="pendaftar" element={<AdminPendaftar />} />
                    <Route path="verifikasi" element={<AdminVerification />} />
                    <Route path="cms/beranda" element={<AdminCmsHome />} />
                    <Route path="cms/profil" element={<AdminCmsProfile />} />
                    <Route path="cms/program" element={<AdminCmsProgram />} />
                    <Route path="cms/berita" element={<AdminCmsNews />} />
                    <Route path="cms/galeri" element={<AdminCmsGallery />} />
                    <Route path="cms/faq" element={<AdminCmsFaq />} />
                    <Route path="export" element={<AdminExport />} />
                    <Route path="google-sheet" element={<AdminGoogleSheet />} />
                    <Route path="settings" element={<AdminSettings />} />
                </Route>

                {/* Fallback Catch-All */}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
    );
}
