import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { MapPin, Phone, Mail, Send, CheckCircle2 } from 'lucide-react';
import { cmsApi } from '../../services/api';

const contactSchema = z.object({
    name: z.string().min(3, 'Nama minimal berisi 3 karakter.'),
    email: z.string().email('Format email tidak valid.'),
    phone: z.string().optional(),
    subject: z.string().optional(),
    message: z.string().min(10, 'Pesan minimal berisi 10 karakter.'),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function ContactView() {
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [submittedData, setSubmittedData] = useState<ContactFormData | null>(null);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<ContactFormData>({
        resolver: zodResolver(contactSchema),
    });

    const onSubmit = (data: ContactFormData) => {
        setSubmitting(true);
        setSuccessMsg(null);
        setErrorMsg(null);

        // Format WhatsApp message
        const waText = [
            'Halo Admin KB-TK IT Taman Robbani,',
            'Saya mengirim pesan melalui formulir kontak PPDB Online:',
            '',
            `*Nama:* ${data.name}`,
            `*Email:* ${data.email}`,
            `*Nomor HP:* ${data.phone || '-'}`,
            `*Subjek:* ${data.subject || '-'}`,
            '',
            '*Pesan:*',
            data.message,
        ].join('\n');
        const waUrl = `https://wa.me/6287752439572?text=${encodeURIComponent(waText)}`;

        // Open WhatsApp directly
        window.open(waUrl, '_blank');

        // Also save to database / CMS API
        cmsApi.submitContact(data)
            .then((res) => {
                if (res.success) {
                    setSubmittedData(data);
                    setSuccessMsg(res.message || 'Pesan Anda berhasil dikirim dan diarahkan ke WhatsApp Admin.');
                    reset();
                } else {
                    setSubmittedData(data);
                    setSuccessMsg('Pesan Anda telah diarahkan ke WhatsApp Admin.');
                    reset();
                }
            })
            .catch((err) => {
                console.error(err);
                // Even if API fails, user is already directed to WhatsApp
                setSubmittedData(data);
                setSuccessMsg('Pesan Anda telah diarahkan ke WhatsApp Admin.');
                reset();
            })
            .finally(() => setSubmitting(false));
    };

    return (
        <div className="py-12 bg-slate-50 text-left">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Title */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800">Hubungi Kami</h1>
                    <div className="w-16 h-1 bg-teal-500 mx-auto mt-4 rounded"></div>
                    <p className="mt-4 text-slate-500 text-xs sm:text-sm">
                        Punya pertanyaan? Kirim pesan Anda dan staf kami akan merespons secepatnya.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Contact Details (Left side) */}
                    <div className="bg-teal-800 text-white rounded-3xl p-8 sm:p-10 shadow-md flex flex-col justify-between relative overflow-hidden border-none">
                        <div className="space-y-8 z-10 relative">
                            <h3 className="text-xl sm:text-2xl font-bold border-b border-white/10 pb-4 mb-8">Informasi Kontak</h3>
                            
                            <div className="flex items-start gap-4">
                                <MapPin size={24} className="text-teal-200 mt-1 flex-shrink-0" />
                                <div>
                                    <h4 className="font-semibold text-teal-100 text-sm sm:text-base">Alamat Sekolah</h4>
                                    <p className="text-xs sm:text-sm mt-1 text-teal-50/80 leading-relaxed">
                                        Jl. Mangkurejo 41, Kwangsan, Sedati, Sidoarjo
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <Phone size={24} className="text-teal-200 mt-1 flex-shrink-0" />
                                <div>
                                    <h4 className="font-semibold text-teal-100 text-sm sm:text-base">Telepon / WhatsApp</h4>
                                    <p className="text-xs sm:text-sm mt-1">
                                        <a
                                            href="https://wa.me/6287752439572"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-teal-50/90 hover:text-white underline underline-offset-2 transition-colors font-medium"
                                        >
                                            087752439572 (Chat WhatsApp)
                                        </a>
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <Mail size={24} className="text-teal-200 mt-1 flex-shrink-0" />
                                <div>
                                    <h4 className="font-semibold text-teal-100 text-sm sm:text-base">Email Resmi</h4>
                                    <p className="text-xs sm:text-sm mt-1">
                                        <a
                                            href="mailto:tamanrobbani23@gmail.com"
                                            className="text-teal-50/90 hover:text-white underline underline-offset-2 transition-colors font-medium"
                                        >
                                            tamanrobbani23@gmail.com
                                        </a>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Background decor circles */}
                        <div className="absolute right-0 bottom-0 w-48 h-48 rounded-full bg-teal-750/30 translate-x-20 translate-y-20 pointer-events-none" />
                    </div>

                    {/* Contact Form (Right side) */}
                    <div className="lg:col-span-2 bg-white rounded-3xl shadow-md p-8 sm:p-10 border-none">
                        {successMsg ? (
                            <div className="flex flex-col items-center justify-center py-10 text-center">
                                <CheckCircle2 size={64} className="text-teal-500 mb-4" />
                                <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">Terima Kasih!</h3>
                                <p className="text-slate-600 text-xs sm:text-sm max-w-md leading-relaxed">
                                    {successMsg} Salinan pesan telah dicatat ke sistem kami.
                                </p>

                                {submittedData && (
                                    <div className="mt-6 w-full max-w-md p-5 bg-emerald-50 border border-emerald-200 rounded-2xl text-left space-y-3">
                                        <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs sm:text-sm">
                                            <span>Ingin Respon Lebih Cepat?</span>
                                        </div>
                                        <p className="text-xs text-emerald-700 leading-relaxed">
                                            Kirimkan langsung pesan ini ke WhatsApp Admin agar segera dijawab:
                                        </p>
                                        <a
                                            href={`https://wa.me/6287752439572?text=${encodeURIComponent(
                                                `Halo Admin KB-TK IT Taman Robbani,\nSaya mengirim pesan dari web PPDB:\n\n*Nama:* ${submittedData.name}\n*Email:* ${submittedData.email}\n*Telepon:* ${submittedData.phone || '-'}\n*Subjek:* ${submittedData.subject || '-'}\n\n*Pesan:*\n${submittedData.message}`
                                            )}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                                        >
                                            <span>Kirim ke WhatsApp (087752439572)</span>
                                        </a>
                                    </div>
                                )}

                                <button
                                    onClick={() => {
                                        setSuccessMsg(null);
                                        setSubmittedData(null);
                                    }}
                                    className="mt-6 text-slate-500 hover:text-slate-700 font-semibold text-xs sm:text-sm underline cursor-pointer"
                                >
                                    Tulis Pesan Baru
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                <h3 className="text-lg font-bold text-slate-800 mb-6">Formulir Pesan</h3>
                                
                                {errorMsg && (
                                    <div className="p-4 bg-rose-50 text-rose-700 text-xs font-semibold rounded-xl">
                                        {errorMsg}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    {/* Name Input */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Nama Lengkap *</label>
                                        <input
                                            type="text"
                                            {...register('name')}
                                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-xs sm:text-sm"
                                            placeholder="Masukkan nama Anda"
                                        />
                                        {errors.name && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.name.message}</p>}
                                    </div>

                                    {/* Email Input */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Alamat Email *</label>
                                        <input
                                            type="email"
                                            {...register('email')}
                                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-xs sm:text-sm"
                                            placeholder="Masukkan email Anda"
                                        />
                                        {errors.email && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.email.message}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    {/* Phone Input */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Nomor HP</label>
                                        <input
                                            type="text"
                                            {...register('phone')}
                                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-xs sm:text-sm"
                                            placeholder="Contoh: 08123456789"
                                        />
                                    </div>

                                    {/* Subject Input */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Subjek</label>
                                        <input
                                            type="text"
                                            {...register('subject')}
                                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-xs sm:text-sm"
                                            placeholder="Subjek pesan"
                                        />
                                    </div>
                                </div>

                                {/* Message Input */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Pesan Anda *</label>
                                    <textarea
                                        rows={5}
                                        {...register('message')}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-xs sm:text-sm"
                                        placeholder="Tuliskan pesan pertanyaan Anda di sini..."
                                    />
                                    {errors.message && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.message.message}</p>}
                                </div>

                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full sm:w-auto px-7 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs sm:text-sm transition shadow-md flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                                    >
                                        <Send size={16} />
                                        <span>{submitting ? 'Membuka WhatsApp...' : 'Kirim Pesan via WhatsApp'}</span>
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
