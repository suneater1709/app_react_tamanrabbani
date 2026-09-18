import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, ArrowLeft, FileText, Download, ExternalLink, ShieldCheck } from 'lucide-react';
import { cmsApi } from '../../services/api';

interface NewsItem {
    id: number;
    title: string;
    content: string;
    image: string | null;
    image_url?: string | null;
    content_type?: 'image' | 'file' | 'link';
    file_path?: string | null;
    file_url?: string | null;
    external_link?: string | null;
    created_at: string;
}

export default function NewsDetail() {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const [article, setArticle] = useState<NewsItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const handleBack = () => {
        if (window.history.length > 1) {
            navigate(-1);
        } else {
            navigate('/berita');
        }
    };

    useEffect(() => {
        if (!slug) return;
        cmsApi.getNewsDetail(slug)
            .then((res) => {
                if (res.success) {
                    setArticle(res.data);
                } else {
                    setError(res.message || 'Artikel tidak ditemukan.');
                }
            })
            .catch((err) => {
                console.error(err);
                setError('Terjadi kesalahan saat memuat artikel.');
            })
            .finally(() => setLoading(false));
    }, [slug]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-500 font-medium">Memuat artikel...</p>
            </div>
        );
    }

    if (error || !article) {
        return (
            <div className="max-w-3xl mx-auto px-4 py-16 text-center">
                <h2 className="text-xl font-bold text-slate-800 mb-4">{error || 'Artikel tidak ditemukan.'}</h2>
                <button
                    onClick={handleBack}
                    className="text-teal-600 font-bold hover:underline flex items-center justify-center gap-1.5 cursor-pointer mx-auto"
                >
                    <ArrowLeft size={16} /> Kembali ke Berita
                </button>
            </div>
        );
    }

    const isPdf = article.content_type === 'file' && !!(article.file_url || article.file_path);
    const isExternal = article.content_type === 'link' && !!article.external_link;
    const fileDownloadUrl = article.file_url || (article.file_path ? `/storage/${article.file_path}` : '');

    return (
        <div className="py-12 bg-slate-50 text-left font-sans">
            <div className="max-w-4xl mx-auto px-4 sm:px-6">
                {/* Back Button */}
                <button
                    onClick={handleBack}
                    className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 mb-8 transition cursor-pointer"
                >
                    <ArrowLeft size={16} /> Kembali ke Halaman Sebelumnya
                </button>

                {/* Article Card */}
                <article className="bg-white rounded-3xl shadow-md p-6 sm:p-10 border border-slate-100 space-y-8">
                    <header>
                        <div className="flex flex-wrap items-center gap-2 text-xxs font-semibold text-slate-400 mb-3 uppercase tracking-wider">
                            <div className="flex items-center gap-1">
                                <Calendar size={14} className="text-teal-600" />
                                <span>
                                    {new Date(article.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </span>
                            </div>
                            {isPdf && (
                                <span className="px-2.5 py-0.5 bg-rose-100 text-rose-800 font-bold rounded-full">
                                    Dokumen PDF
                                </span>
                            )}
                            {isExternal && (
                                <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 font-bold rounded-full">
                                    Tautan Eksternal
                                </span>
                            )}
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 leading-tight">
                            {article.title}
                        </h1>
                    </header>

                    {/* Image Cover if Present */}
                    {article.image && (
                        <div className="rounded-2xl overflow-hidden max-h-[450px] shadow-sm">
                            <img
                                src={article.image_url || (article.image.startsWith('http') ? article.image : article.image.startsWith('/storage') ? article.image : `/storage/${article.image}`)}
                                alt={article.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/images/toy_train_hero.png';
                                }}
                            />
                        </div>
                    )}

                    {/* Body content */}
                    {article.content && (
                        <div 
                            className="prose prose-teal max-w-none text-slate-600 leading-relaxed text-xs sm:text-sm space-y-6"
                            dangerouslySetInnerHTML={{ __html: article.content }}
                        />
                    )}

                    {/* PDF Embedded Viewer & Download Box */}
                    {isPdf && (
                        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center flex-shrink-0">
                                        <FileText size={26} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800 text-sm">Dokumen Terlampir (PDF)</h4>
                                        <p className="text-xxs text-slate-500">Anda dapat membaca langsung atau mengunduh dokumen resmi ini.</p>
                                    </div>
                                </div>
                                <a
                                    href={fileDownloadUrl}
                                    download
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors shadow-xs"
                                >
                                    <Download size={16} />
                                    <span>Download File PDF</span>
                                </a>
                            </div>

                            {/* Responsive PDF iframe Embed */}
                            <div className="w-full h-[600px] rounded-xl overflow-hidden border border-slate-200 bg-white">
                                <iframe
                                    src={`${fileDownloadUrl}#toolbar=1`}
                                    title={article.title}
                                    className="w-full h-full border-none"
                                />
                            </div>
                        </div>
                    )}

                    {/* External Link Box */}
                    {isExternal && (
                        <div className="p-6 bg-blue-50/70 rounded-2xl border border-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="space-y-1">
                                <span className="text-xxs font-bold text-blue-700 uppercase tracking-wider">Sumber Informasi Luar</span>
                                <h4 className="font-bold text-slate-800 text-sm">Tautan Resmi Terkait</h4>
                                <p className="text-xs text-slate-600 break-all">{article.external_link}</p>
                            </div>
                            <a
                                href={article.external_link!}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-colors flex-shrink-0 shadow-xs"
                            >
                                <span>Kunjungi Halaman</span>
                                <ExternalLink size={16} />
                            </a>
                        </div>
                    )}
                </article>
            </div>
        </div>
    );
}

