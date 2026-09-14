import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn } from 'lucide-react';
import { cmsApi } from '../../services/api';

interface GalleryItem {
    id: number;
    title: string;
    image: string;
    image_url?: string | null;
    category: string;
    caption: string | null;
}

export default function GalleryView() {
    const [images, setImages] = useState<GalleryItem[]>([]);
    const [activeTab, setActiveTab] = useState('all');
    const [loading, setLoading] = useState(true);
    const [lightboxImage, setLightboxImage] = useState<GalleryItem | null>(null);

    useEffect(() => {
        setLoading(true);
        cmsApi.getGallery(activeTab)
            .then((res) => {
                if (res.success) {
                    setImages(res.data || []);
                }
            })
            .catch((err) => console.error(err))
            .finally(() => setLoading(false));
    }, [activeTab]);

    const tabs = [
        { key: 'all', label: 'Semua' },
        { key: 'fasilitas', label: 'Fasilitas' },
        { key: 'kegiatan', label: 'Kegiatan' },
    ];

    return (
        <div className="py-12 bg-slate-50 text-left">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Title */}
                <div className="text-center max-w-3xl mx-auto mb-12">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800">Galeri Foto</h1>
                    <div className="w-16 h-1 bg-teal-500 mx-auto mt-4 rounded"></div>
                    <p className="mt-4 text-slate-505 text-xs sm:text-sm">
                        Melihat dokumentasi visual aktivitas dan kebersamaan di KB-TK IT Taman Robbani Sidoarjo.
                    </p>
                </div>

                {/* Filter Tabs */}
                <div className="flex justify-center gap-3 mb-10">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all border-none cursor-pointer ${
                                activeTab === tab.key
                                    ? 'bg-teal-600 text-white shadow-md'
                                    : 'bg-white text-slate-650 hover:bg-slate-50 shadow-sm'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Loading skeleton */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {[1, 2, 3].map((n) => (
                            <div key={n} className="h-64 bg-slate-200 animate-pulse rounded-2xl shadow-sm" />
                        ))}
                    </div>
                ) : images.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-3xl shadow-md border-none">
                        <p className="text-slate-500 text-xs sm:text-sm">Belum ada foto galeri.</p>
                    </div>
                ) : (
                    /* Image Grid */
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {images.map((img) => (
                            <motion.div
                                key={img.id}
                                layoutId={`img-${img.id}`}
                                className="group relative overflow-hidden bg-white rounded-3xl shadow-md cursor-pointer border-none"
                                onClick={() => setLightboxImage(img)}
                            >
                                <div className="h-64 overflow-hidden relative">
                                    <img
                                        src={img.image_url || (img.image.startsWith('http') ? img.image : img.image.startsWith('/storage') ? img.image : `/storage/${img.image}`)}
                                        alt={img.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = '/images/books_abc.png';
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <ZoomIn className="text-white" size={32} />
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h4 className="font-bold text-slate-800 text-sm truncate">{img.title}</h4>
                                    {img.caption && <p className="text-xxs text-slate-400 truncate mt-1">{img.caption}</p>}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Lightbox Modal */}
                <AnimatePresence>
                    {lightboxImage && (
                        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
                            <button
                                onClick={() => setLightboxImage(null)}
                                className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                            >
                                <X size={24} />
                            </button>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="max-w-4xl w-full bg-transparent flex flex-col items-center"
                            >
                                <img
                                    src={lightboxImage.image_url || (lightboxImage.image.startsWith('http') ? lightboxImage.image : lightboxImage.image.startsWith('/storage') ? lightboxImage.image : `/storage/${lightboxImage.image}`)}
                                    alt={lightboxImage.title}
                                    className="max-h-[75vh] object-contain rounded-2xl shadow-lg"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = '/images/books_abc.png';
                                    }}
                                />
                                <div className="text-center mt-4 max-w-2xl">
                                    <h3 className="text-md sm:text-lg font-bold text-white">{lightboxImage.title}</h3>
                                    {lightboxImage.caption && (
                                        <p className="text-xs sm:text-sm text-slate-400 mt-1">{lightboxImage.caption}</p>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
