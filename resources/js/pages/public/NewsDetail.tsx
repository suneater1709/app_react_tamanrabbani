import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, ArrowLeft } from 'lucide-react';
import { cmsApi } from '../../services/api';

interface NewsItem {
    id: number;
    title: string;
    content: string;
    image: string | null;
    image_url?: string | null;
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
                <p className="text-slate-505 font-medium">Memuat artikel...</p>
            </div>
        );
    }

    if (error || !article) {
        return (
            <div className="max-w-3xl mx-auto px-4 py-16 text-center text-left">
                <h2 className="text-xl font-bold text-slate-800 mb-4">{error || 'Artikel tidak ditemukan.'}</h2>
                <button
                    onClick={handleBack}
                    className="text-teal-650 font-bold hover:underline flex items-center justify-center gap-1.5 cursor-pointer mx-auto"
                >
                    <ArrowLeft size={16} /> Kembali ke Berita
                </button>
            </div>
        );
    }

    return (
        <div className="py-12 bg-slate-50 text-left">
            <div className="max-w-4xl mx-auto px-4 sm:px-6">
                {/* Back Button */}
                <button
                    onClick={handleBack}
                    className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 mb-8 transition cursor-pointer"
                >
                    <ArrowLeft size={16} /> Kembali ke Halaman Sebelumnya
                </button>

                {/* Article Card */}
                <article className="bg-white rounded-3xl shadow-md p-6 sm:p-10 border-none">
                    <header className="mb-8">
                        <div className="flex items-center gap-2 text-xxs font-semibold text-slate-400 mb-3 uppercase tracking-wider">
                            <Calendar size={14} className="text-teal-650" />
                            <span>
                                {new Date(article.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 leading-tight">
                            {article.title}
                        </h1>
                    </header>

                    {/* Image Cover */}
                    {article.image && (
                        <div className="mb-8 rounded-2xl overflow-hidden max-h-[450px] shadow-sm">
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
                    <div 
                        className="prose prose-teal max-w-none text-slate-600 leading-relaxed text-xs sm:text-sm space-y-6"
                        dangerouslySetInnerHTML={{ __html: article.content }}
                    />
                </article>
            </div>
        </div>
    );
}
