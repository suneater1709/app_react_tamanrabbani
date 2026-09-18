import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ArrowRight, ExternalLink, FileText, Image as ImageIcon } from 'lucide-react';
import { cmsApi } from '../../services/api';

interface NewsItem {
    id: number;
    title: string;
    slug: string;
    content: string;
    image: string | null;
    image_url?: string | null;
    content_type?: 'image' | 'file' | 'link';
    file_path?: string | null;
    file_url?: string | null;
    external_link?: string | null;
    created_at: string;
}

export default function NewsList() {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        cmsApi.getNews(page)
            .then((res) => {
                if (res.success) {
                    setNews(res.data.data || []);
                    setLastPage(res.data.last_page || 1);
                }
            })
            .catch((err) => console.error(err))
            .finally(() => setLoading(false));
    }, [page]);

    if (loading && news.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-500 font-medium">Memuat berita...</p>
            </div>
        );
    }

    return (
        <div className="py-12 bg-slate-50 text-left font-sans">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Title */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800">Berita & Kegiatan</h1>
                    <div className="w-16 h-1 bg-teal-500 mx-auto mt-4 rounded-full"></div>
                    <p className="mt-4 text-slate-500 text-xs sm:text-sm">
                        Ikuti perkembangan terbaru, pengumuman resmi, dokumen panduan, dan keseruan kegiatan belajar siswa KB-TK IT Taman Robbani.
                    </p>
                </div>

                {news.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-3xl shadow-md border-none">
                        <p className="text-slate-500 text-xs sm:text-sm">Belum ada berita yang dipublikasikan.</p>
                    </div>
                ) : (
                    <div>
                        {/* Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                            {news.map((item) => {
                                const isExternal = item.content_type === 'link' && !!item.external_link;
                                const isPdf = item.content_type === 'file' && !!item.file_path;

                                return (
                                    <article key={item.id} className="bg-white rounded-3xl overflow-hidden shadow-md flex flex-col justify-between hover:shadow-lg transition duration-300 border border-slate-100 relative">
                                        <div>
                                            {/* Image / Header Media */}
                                            <div className="h-48 bg-slate-100 overflow-hidden relative">
                                                {item.image ? (
                                                    <img
                                                        src={item.image_url || (item.image.startsWith('http') ? item.image : item.image.startsWith('/storage') ? item.image : `/storage/${item.image}`)}
                                                        alt={item.title}
                                                        className="w-full h-full object-cover hover:scale-105 transition duration-500"
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).src = '/images/toy_train_hero.png';
                                                        }}
                                                    />
                                                ) : isPdf ? (
                                                    <div className="w-full h-full flex flex-col items-center justify-center bg-rose-50 text-rose-600 gap-2">
                                                        <FileText size={40} />
                                                        <span className="text-xxs font-extrabold uppercase tracking-wider">Dokumen PDF Resmi</span>
                                                    </div>
                                                ) : isExternal ? (
                                                    <div className="w-full h-full flex flex-col items-center justify-center bg-blue-50 text-blue-600 gap-2">
                                                        <ExternalLink size={40} />
                                                        <span className="text-xxs font-extrabold uppercase tracking-wider">Tautan Luar Sekolah</span>
                                                    </div>
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-400 font-semibold uppercase bg-slate-100 text-xs">
                                                        No Image
                                                    </div>
                                                )}

                                                {/* Content Type Badge */}
                                                <div className="absolute top-3 right-3">
                                                    {isExternal ? (
                                                        <span className="px-2.5 py-1 bg-blue-600/90 backdrop-blur-xs text-white text-xxs font-extrabold rounded-full flex items-center gap-1 shadow-xs">
                                                            <ExternalLink size={11} />
                                                            <span>Link Eksternal</span>
                                                        </span>
                                                    ) : isPdf ? (
                                                        <span className="px-2.5 py-1 bg-rose-600/90 backdrop-blur-xs text-white text-xxs font-extrabold rounded-full flex items-center gap-1 shadow-xs">
                                                            <FileText size={11} />
                                                            <span>Dokumen PDF</span>
                                                        </span>
                                                    ) : null}
                                                </div>
                                            </div>

                                            {/* Content info */}
                                            <div className="p-6">
                                                <div className="flex items-center gap-3 text-xxs text-slate-400 mb-3 font-semibold uppercase tracking-wider">
                                                    <div className="flex items-center gap-1">
                                                        <Calendar size={14} className="text-teal-600" />
                                                        <span>
                                                            {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                        </span>
                                                    </div>
                                                </div>
                                                <h3 className="text-base sm:text-lg font-bold text-slate-800 leading-tight mb-2 hover:text-teal-700 transition">
                                                    {isExternal ? (
                                                        <a href={item.external_link!} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-start gap-1">
                                                            <span>{item.title}</span>
                                                            <ExternalLink size={14} className="mt-1 flex-shrink-0 text-blue-600" />
                                                        </a>
                                                    ) : (
                                                        <Link to={`/berita/${item.slug}`}>{item.title}</Link>
                                                    )}
                                                </h3>
                                                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed line-clamp-3">
                                                    {item.content ? item.content.replace(/<[^>]*>/g, '') : ''}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="px-6 pb-6 pt-2">
                                            {isExternal ? (
                                                <a
                                                    href={item.external_link!}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
                                                >
                                                    <span>Buka Link Eksternal</span>
                                                    <ExternalLink size={14} />
                                                </a>
                                            ) : (
                                                <Link
                                                    to={`/berita/${item.slug}`}
                                                    className="text-xs font-bold text-teal-600 hover:text-teal-800 flex items-center gap-1 transition-colors"
                                                >
                                                    <span>{isPdf ? 'Lihat Dokumen PDF' : 'Baca Selengkapnya'}</span>
                                                    <ArrowRight size={14} />
                                                </Link>
                                            )}
                                        </div>
                                    </article>
                                );
                            })}
                        </div>

                        {/* Pagination Controls */}
                        {lastPage > 1 && (
                            <div className="flex justify-center items-center gap-4">
                                <button
                                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                                    disabled={page === 1}
                                    className="px-4 py-2 text-xs font-bold rounded-xl bg-white shadow-sm disabled:opacity-50 hover:bg-slate-50 transition border border-slate-200 cursor-pointer"
                                >
                                    Sebelumnya
                                </button>
                                <span className="text-slate-400 font-semibold text-xs">Halaman {page} dari {lastPage}</span>
                                <button
                                    onClick={() => setPage((p) => Math.min(p + 1, lastPage))}
                                    disabled={page === lastPage}
                                    className="px-4 py-2 text-xs font-bold rounded-xl bg-white shadow-sm disabled:opacity-50 hover:bg-slate-50 transition border border-slate-200 cursor-pointer"
                                >
                                    Berikutnya
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

