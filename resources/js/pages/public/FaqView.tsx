import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search, HelpCircle, Sparkles, MessageCircleQuestion } from 'lucide-react';
import { cmsApi } from '../../services/api';

interface FaqItem {
    id: number;
    question: string;
    answer: string;
    category: string | null;
    is_active?: boolean;
}

export default function FaqView() {
    const [faqs, setFaqs] = useState<FaqItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [openIdx, setOpenIdx] = useState<number | null>(0);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState<string>('');

    useEffect(() => {
        cmsApi.getFaqs()
            .then((res) => {
                if (res.success) {
                    setFaqs(res.data || []);
                }
            })
            .catch((err) => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const toggleFaq = (idx: number) => {
        setOpenIdx((prev) => (prev === idx ? null : idx));
    };

    // Extract unique categories from active FAQs
    const categories = ['all', ...Array.from(new Set(faqs.map((f) => f.category).filter(Boolean))) as string[]];

    const filteredFaqs = faqs.filter((faq) => {
        const matchesCat = selectedCategory === 'all' || faq.category === selectedCategory;
        const matchesQuery = 
            faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCat && matchesQuery;
    });

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="w-10 h-10 border-3 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-500 text-xs font-semibold">Memuat Frequently Asked Questions...</p>
            </div>
        );
    }

    return (
        <div className="py-16 bg-slate-50 min-h-screen text-left">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-10">
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-50 text-teal-800 rounded-full text-xxs font-extrabold uppercase tracking-widest mb-3">
                        <MessageCircleQuestion size={13} />
                        <span>PANDUAN & PERTANYAAN UMUM</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight">
                        Frequently Asked Questions
                    </h1>
                    <div className="w-16 h-1 bg-teal-500 mx-auto mt-4 rounded-full"></div>
                    <p className="mt-4 text-slate-500 text-xs sm:text-sm leading-relaxed max-w-2xl mx-auto">
                        Temukan jawaban cepat atas pertanyaan yang sering diajukan orang tua murid seputar sistem penerimaan siswa baru, kurikulum pembelajaran, dan fasilitas KB-TK IT Taman Robbani.
                    </p>
                </div>

                {/* Filter & Search Bar */}
                <div className="bg-white p-4 sm:p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
                    {/* Category tabs */}
                    <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                type="button"
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                                    selectedCategory === cat
                                        ? 'bg-teal-600 text-white shadow-xs'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                {cat === 'all' ? 'Semua Pertanyaan' : cat}
                            </button>
                        ))}
                    </div>

                    {/* Search input */}
                    <div className="relative w-full md:w-64">
                        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Cari kata kunci FAQ..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-slate-50/50"
                        />
                    </div>
                </div>

                {/* FAQ List */}
                {filteredFaqs.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-3xl shadow-sm border border-slate-100">
                        <HelpCircle size={40} className="mx-auto text-slate-300 mb-3" />
                        <p className="text-slate-600 font-bold text-sm">Tidak ada pertanyaan yang sesuai</p>
                        <p className="text-slate-400 text-xs mt-1">Coba gunakan kata kunci pencarian yang lain.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredFaqs.map((faq, idx) => {
                            const isOpen = openIdx === idx;
                            return (
                                <div
                                    key={faq.id || idx}
                                    className={`bg-white rounded-2xl sm:rounded-3xl border transition-all duration-200 overflow-hidden ${
                                        isOpen
                                            ? 'border-teal-400 shadow-md ring-2 ring-teal-500/10'
                                            : 'border-slate-100 shadow-xs hover:border-slate-200'
                                    }`}
                                >
                                    <button
                                        type="button"
                                        onClick={() => toggleFaq(idx)}
                                        className="w-full px-6 py-5 text-left flex justify-between items-center gap-4 transition-colors cursor-pointer bg-transparent"
                                    >
                                        <div className="flex items-start gap-3">
                                            <span className={`w-7 h-7 rounded-xl text-xs font-extrabold flex items-center justify-center flex-shrink-0 mt-0.5 ${
                                                isOpen ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600'
                                            }`}>
                                                Q{idx + 1}
                                            </span>
                                            <div>
                                                {faq.category && (
                                                    <span className="inline-block px-2.5 py-0.5 bg-teal-50 text-teal-800 text-[10px] font-bold rounded-md mb-1.5">
                                                        {faq.category}
                                                    </span>
                                                )}
                                                <h4 className="font-bold text-slate-800 text-sm sm:text-base leading-snug">
                                                    {faq.question}
                                                </h4>
                                            </div>
                                        </div>

                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                                            isOpen ? 'bg-teal-50 text-teal-600' : 'bg-slate-50 text-slate-400'
                                        }`}>
                                            <ChevronDown
                                                className={`transition-transform duration-200 ${isOpen ? 'rotate-180 text-teal-600' : ''}`}
                                                size={18}
                                            />
                                        </div>
                                    </button>
                                    
                                    <AnimatePresence initial={false}>
                                        {isOpen && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="overflow-hidden border-t border-slate-100 bg-slate-50/50"
                                            >
                                                <div className="px-6 py-5 text-xs sm:text-sm text-slate-600 leading-relaxed pl-16">
                                                    <p className="whitespace-pre-line">{faq.answer}</p>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
