import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { cmsApi } from '../../services/api';

interface FaqItem {
    id: number;
    question: string;
    answer: string;
    category: string | null;
}

export default function FaqView() {
    const [faqs, setFaqs] = useState<FaqItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [openIdx, setOpenIdx] = useState<number | null>(null);

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

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-500 font-medium">Memuat FAQ...</p>
            </div>
        );
    }

    return (
        <div className="py-12 bg-slate-50 text-left">
            <div className="max-w-4xl mx-auto px-4 sm:px-6">
                {/* Title */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800">Frequently Asked Questions</h1>
                    <div className="w-16 h-1 bg-teal-500 mx-auto mt-4 rounded"></div>
                    <p className="mt-4 text-slate-550 text-xs sm:text-sm">
                        Jawaban cepat untuk pertanyaan yang sering ditanyakan mengenai PPDB dan sekolah kami.
                    </p>
                </div>

                {faqs.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-3xl shadow-md border-none">
                        <p className="text-slate-500 text-xs sm:text-sm">Belum ada pertanyaan FAQ aktif.</p>
                    </div>
                ) : (
                    /* FAQ List Accordions */
                    <div className="space-y-4">
                        {faqs.map((faq, idx) => {
                            const isOpen = openIdx === idx;
                            return (
                                <div
                                    key={faq.id}
                                    className="bg-white rounded-2xl shadow-md overflow-hidden border-none"
                                >
                                    <button
                                        onClick={() => toggleFaq(idx)}
                                        className="w-full px-6 py-5 text-left flex justify-between items-center gap-4 hover:bg-slate-50 transition-colors border-none cursor-pointer"
                                    >
                                        <h4 className="font-bold text-slate-800 text-sm sm:text-base leading-snug">
                                            {faq.question}
                                        </h4>
                                        <ChevronDown
                                            className={`text-slate-400 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180 text-teal-600' : ''}`}
                                            size={18}
                                        />
                                    </button>
                                    
                                    <AnimatePresence initial={false}>
                                        {isOpen && (
                                            <motion.div
                                                initial={{ height: 0 }}
                                                animate={{ height: 'auto' }}
                                                exit={{ height: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="px-6 pb-6 pt-2 text-xs sm:text-sm text-slate-500 leading-relaxed border-none">
                                                    {faq.answer}
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
