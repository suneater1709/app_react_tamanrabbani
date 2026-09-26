import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, User, Users, Upload, CheckCircle2, ChevronRight, ChevronLeft, ShieldCheck, AlertCircle, Calendar, Sparkles, FileText, HelpCircle, FilePlus, ArrowRight, Copy, Check } from 'lucide-react';
import { cmsApi } from '../../services/api';
import axios from 'axios';

// 1. Zod Validation Schemas for each Step with strict input defenses
const step1Schema = z.object({
    email: z.string().email('Format email tidak valid.'),
    phone: z.string()
        .min(8, 'Nomor HP minimal berisi 8 digit.')
        .max(16, 'Nomor HP maksimal 16 digit.')
        .regex(/^\d+$/, 'Nomor HP hanya boleh berisi angka (tidak boleh ada huruf).'),
});

const step2Schema = z.object({
    full_name: z.string()
        .min(3, 'Nama lengkap minimal berisi 3 karakter.')
        .regex(/^[^0-9]+$/, 'Nama lengkap hanya boleh berisi huruf (tidak boleh angka).'),
    nickname: z.string()
        .min(2, 'Nama panggilan minimal berisi 2 karakter.')
        .regex(/^[^0-9]+$/, 'Nama panggilan hanya boleh berisi huruf (tidak boleh angka).'),
    nik: z.string()
        .length(16, 'NIK harus berupa 16 digit angka.')
        .regex(/^\d{16}$/, 'NIK harus 16 digit angka (tidak boleh ada huruf).'),
    gender: z.enum(['L', 'P'], { required_error: 'Pilih jenis kelamin.' }),
    birth_place: z.string()
        .min(3, 'Tempat lahir wajib diisi.')
        .regex(/^[^0-9]+$/, 'Tempat lahir hanya boleh berisi huruf (tidak boleh angka).'),
    birth_date: z.string().min(1, 'Tanggal lahir wajib diisi.'),
    religion: z.string()
        .min(3, 'Agama wajib diisi.')
        .regex(/^[^0-9]+$/, 'Agama hanya boleh berisi huruf (tidak boleh angka).'),
    address: z.string().min(10, 'Alamat lengkap minimal berisi 10 karakter.'),
    previous_school: z.string().optional(),
});

const step3Schema = z.object({
    program_id: z.string().min(1, 'Program pembelajaran wajib dipilih.'),
    notes: z.string().optional(),
});

const step4Schema = z.object({
    father_name: z.string()
        .min(3, 'Nama ayah kandung wajib diisi.')
        .regex(/^[^0-9]+$/, 'Nama ayah hanya boleh berisi huruf (tidak boleh angka).'),
    father_occupation: z.string().optional().refine(v => !v || /^[^0-9]+$/.test(v), 'Pekerjaan ayah tidak boleh mengandung angka.'),
    father_education: z.string().optional(),
    father_phone: z.string().optional().refine(v => !v || /^\d+$/.test(v), 'Nomor telepon ayah hanya boleh berisi angka.'),
    father_email: z.string().optional(),
    father_income: z.string().optional(),
    
    mother_name: z.string()
        .min(3, 'Nama ibu kandung wajib diisi.')
        .regex(/^[^0-9]+$/, 'Nama ibu hanya boleh berisi huruf (tidak boleh angka).'),
    mother_occupation: z.string().optional().refine(v => !v || /^[^0-9]+$/.test(v), 'Pekerjaan ibu tidak boleh mengandung angka.'),
    mother_education: z.string().optional(),
    mother_phone: z.string().optional().refine(v => !v || /^\d+$/.test(v), 'Nomor telepon ibu hanya boleh berisi angka.'),
    mother_email: z.string().optional(),
    mother_income: z.string().optional(),
    
    guardian_name: z.string().optional().refine(v => !v || /^[^0-9]+$/.test(v), 'Nama wali hanya boleh berisi huruf (tidak boleh angka).'),
    guardian_occupation: z.string().optional().refine(v => !v || /^[^0-9]+$/.test(v), 'Pekerjaan wali tidak boleh mengandung angka.'),
    guardian_education: z.string().optional(),
    guardian_phone: z.string().optional().refine(v => !v || /^\d+$/.test(v), 'Nomor telepon wali hanya boleh berisi angka.'),
    guardian_email: z.string().optional(),
    guardian_income: z.string().optional(),
});

export default function Revision() {
    const { regNumber } = useParams<{ regNumber: string }>();
    const navigate = useNavigate();
    const [showForm, setShowForm] = useState(true); // Always show form
    const [step, setStep] = useState(1);
    const [programs, setPrograms] = useState<{ id: number; name: string; code: string }[]>([]);
    const [formData, setFormData] = useState<any>({});
    const [dataLoading, setDataLoading] = useState(true);
    
    // Upload files states (4 files matching Gambar 1)
    const [birthCertificateFile, setBirthCertificateFile] = useState<File | null>(null);
    const [familyCardFile, setFamilyCardFile] = useState<File | null>(null);
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [paymentReceiptFile, setPaymentReceiptFile] = useState<File | null>(null);
    
    const [fileErrors, setFileErrors] = useState<string | null>(null);
    const [confirmationChecked, setConfirmationChecked] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [successReceipt, setSuccessReceipt] = useState<any | null>(null);
    const [submitError, setSubmitError] = useState<string | null>(null);

    // Fetch learning programs
    useEffect(() => {
        cmsApi.getPrograms()
            .then((res) => {
                if (res.success) setPrograms(res.data || []);
            })
            .catch((err) => console.error(err));
    }, []);

    // Resolvers based on current step
    const getResolver = () => {
        if (step === 1) return zodResolver(step1Schema);
        if (step === 2) return zodResolver(step2Schema);
        if (step === 3) return zodResolver(step3Schema);
        return zodResolver(step4Schema);
    };

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<any>({
        resolver: getResolver(),
        mode: 'onBlur',
    });

    const watchProgramId = watch('program_id');

    // Input Defense Helpers: Prevent numbers in letter-only fields & letters in numeric-only fields
    const handleNumericKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (
            ['Backspace', 'Tab', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'Enter'].includes(e.key) ||
            e.ctrlKey || e.metaKey
        ) {
            return;
        }
        if (!/^[0-9]$/.test(e.key)) {
            e.preventDefault();
        }
    };

    const handleNumericInput = (e: React.FormEvent<HTMLInputElement>, fieldName: string, maxLen?: number) => {
        let cleanVal = e.currentTarget.value.replace(/\D/g, '');
        if (maxLen && cleanVal.length > maxLen) {
            cleanVal = cleanVal.slice(0, maxLen);
        }
        e.currentTarget.value = cleanVal;
        setValue(fieldName, cleanVal, { shouldValidate: true, shouldDirty: true });
    };

    const handleLetterKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (
            ['Backspace', 'Tab', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'Enter', ' ', '.', ',', "'", '-'].includes(e.key) ||
            e.ctrlKey || e.metaKey
        ) {
            return;
        }
        if (/^[0-9]$/.test(e.key)) {
            e.preventDefault();
        }
    };

    const handleLetterInput = (e: React.FormEvent<HTMLInputElement>, fieldName: string) => {
        const cleanVal = e.currentTarget.value.replace(/[0-9]/g, '');
        e.currentTarget.value = cleanVal;
        setValue(fieldName, cleanVal, { shouldValidate: true, shouldDirty: true });
    };

    // Fetch existing applicant data for revision
    useEffect(() => {
        if (!regNumber) return;
        
        setDataLoading(true);
        axios.get(`/api/v1/public/admissions/revisi/${regNumber}`)
            .then((res) => {
                if (res.data.success) {
                    const data = res.data.data;
                    
                    // Format data for form
                    const initialData: any = {
                        program_id: data.program_id.toString(),
                        email: data.email,
                        phone: data.phone,
                        notes: data.notes || '',
                        full_name: data.full_name,
                        nickname: data.nickname,
                        nik: data.nik,
                        gender: data.gender,
                        birth_place: data.birth_place,
                        birth_date: data.birth_date ? data.birth_date.split('T')[0] : '', // Format date safely
                        religion: data.religion,
                        address: data.address,
                        previous_school: data.previous_school || '',
                    };

                    if (data.parents) {
                        data.parents.forEach((p: any) => {
                            const type = p.type;
                            initialData[`${type}_name`] = p.name;
                            initialData[`${type}_occupation`] = p.occupation || '';
                            initialData[`${type}_education`] = p.education || '';
                            initialData[`${type}_phone`] = p.phone || '';
                            initialData[`${type}_email`] = p.email || '';
                            initialData[`${type}_income`] = p.income || '';
                        });
                    }

                    setFormData(initialData);
                    
                    // Set values to react-hook-form
                    Object.keys(initialData).forEach(key => {
                        setValue(key as any, initialData[key]);
                    });
                }
            })
            .catch((err) => {
                console.error(err);
                alert(err.response?.data?.message || 'Data tidak ditemukan atau tidak bisa direvisi.');
                navigate('/cek-status');
            })
            .finally(() => {
                setDataLoading(false);
            });
    }, [regNumber, setValue, navigate]);

    // Sync browser history with revision steps
    useEffect(() => {
        const handlePopState = (e: PopStateEvent) => {
            if (e.state && typeof e.state.step === 'number') {
                setStep(e.state.step);
            }
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    const handleNextStep = async (data: any) => {
        const updatedData = { ...formData, ...data };
        setFormData(updatedData);

        if (step < 5) {
            const nextStep = step + 1;
            window.history.pushState({ step: nextStep }, '', `#step-${nextStep}`);
            setStep(nextStep);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handlePrevStep = () => {
        if (step > 1) {
            if (window.history.state?.step) {
                window.history.back();
            } else {
                setStep((s) => s - 1);
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleBackToStatus = () => {
        if (window.history.length > 1) {
            navigate(-1);
        } else {
            navigate('/cek-status');
        }
    };

    const [feeCalculation, setFeeCalculation] = useState<{
        entry_fee: number;
        form_fee: number;
        discount_amount: number;
        total_transfer_amount: number;
        wave_name: string;
        program_name: string;
    } | null>(null);
    const [copiedRekening, setCopiedRekening] = useState(false);

    const copyToClipboard = (text: string) => {
        if (navigator.clipboard && window.isSecureContext) {
            return navigator.clipboard.writeText(text);
        } else {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            return new Promise<void>((resolve, reject) => {
                document.execCommand('copy') ? resolve() : reject(new Error('Gagal menyalin'));
                textArea.remove();
            });
        }
    };

    const handleCopyRekening = () => {
        copyToClipboard('7122107207')
            .then(() => {
                setCopiedRekening(true);
                setTimeout(() => setCopiedRekening(false), 2000);
            })
            .catch(() => {
                // fallback
            });
    };

    const getCalculatedFee = (progId: any) => {
        const selectedProg = programs.find(p => p.id.toString() === progId?.toString());
        const isKb = selectedProg?.code?.toUpperCase().includes('KB') || 
                     selectedProg?.code?.toUpperCase().includes('PG') || 
                     progId === '1' || progId === 1 || progId === 'pg';
        
        const entryFee = isKb ? 2800000 : 3950000;
        const infaqAmount = isKb ? 550000 : 750000;
        const formFee = 0;
        const cashbackPercent = 50;
        const discount = Math.round((cashbackPercent / 100) * infaqAmount);
        const total = Math.max(0, entryFee - discount);
        return {
            entry_fee: entryFee,
            infaq_amount: infaqAmount,
            cashback_percent: cashbackPercent,
            form_fee: formFee,
            discount_amount: discount,
            total_transfer_amount: total,
            wave_name: 'Gelombang Aktif',
            program_name: selectedProg?.name || (isKb ? 'Kelompok Bermain (KB)' : 'Taman Kanak-Kanak (TK A & TK B)')
        };
    };

    useEffect(() => {
        const selectedId = watchProgramId || formData.program_id;
        if (!selectedId) return;

        const numericId = parseInt(selectedId.toString(), 10);
        if (!isNaN(numericId)) {
            cmsApi.calculateFee(numericId)
                .then(res => {
                    if (res && res.success && res.data) {
                        setFeeCalculation(res.data);
                    } else {
                        setFeeCalculation(getCalculatedFee(selectedId));
                    }
                })
                .catch(() => {
                    setFeeCalculation(getCalculatedFee(selectedId));
                });
        } else {
            setFeeCalculation(getCalculatedFee(selectedId));
        }
    }, [watchProgramId, formData.program_id, programs]);

    const onSubmitFinal = async () => {
        setSubmitError(null);
        setFileErrors(null);

        if (!birthCertificateFile || !familyCardFile || !photoFile || !paymentReceiptFile) {
            setFileErrors('Semua dokumen persyaratan dan bukti transfer pembayaran wajib diunggah.');
            return;
        }

        if (!confirmationChecked) {
            setFileErrors('Anda wajib menyetujui pernyataan konfirmasi data.');
            return;
        }

        setSubmitting(true);

        const payload = new FormData();
        payload.append('program_id', formData.program_id);
        payload.append('email', formData.email);
        payload.append('phone', formData.phone);
        payload.append('full_name', formData.full_name);
        payload.append('nickname', formData.nickname);
        payload.append('nik', formData.nik);
        payload.append('gender', formData.gender);
        payload.append('birth_place', formData.birth_place);
        payload.append('birth_date', formData.birth_date);
        payload.append('religion', formData.religion);
        payload.append('address', formData.address);
        if (formData.previous_school) payload.append('previous_school', formData.previous_school);
        if (formData.notes) payload.append('notes', formData.notes);

        // Father (Flat fields to payload array)
        payload.append('parents[father][name]', formData.father_name);
        if (formData.father_occupation) payload.append('parents[father][occupation]', formData.father_occupation);
        if (formData.father_education) payload.append('parents[father][education]', formData.father_education);
        if (formData.father_phone) payload.append('parents[father][phone]', formData.father_phone);
        if (formData.father_email) payload.append('parents[father][email]', formData.father_email);
        if (formData.father_income) payload.append('parents[father][income]', formData.father_income);

        // Mother (Flat fields to payload array)
        payload.append('parents[mother][name]', formData.mother_name);
        if (formData.mother_occupation) payload.append('parents[mother][occupation]', formData.mother_occupation);
        if (formData.mother_education) payload.append('parents[mother][education]', formData.mother_education);
        if (formData.mother_phone) payload.append('parents[mother][phone]', formData.mother_phone);
        if (formData.mother_email) payload.append('parents[mother][email]', formData.mother_email);
        if (formData.mother_income) payload.append('parents[mother][income]', formData.mother_income);

        // Guardian (Optional)
        if (formData.guardian_name) {
            payload.append('parents[guardian][name]', formData.guardian_name);
            if (formData.guardian_occupation) payload.append('parents[guardian][occupation]', formData.guardian_occupation);
            if (formData.guardian_education) payload.append('parents[guardian][education]', formData.guardian_education);
            if (formData.guardian_phone) payload.append('parents[guardian][phone]', formData.guardian_phone);
            if (formData.guardian_email) payload.append('parents[guardian][email]', formData.guardian_email);
            if (formData.guardian_income) payload.append('parents[guardian][income]', formData.guardian_income);
        }

        // Files
        payload.append('birth_certificate', birthCertificateFile);
        payload.append('family_card', familyCardFile);
        payload.append('photo', photoFile);
        payload.append('payment_receipt', paymentReceiptFile);

        try {
            const res = await axios.post(`/api/v1/public/admissions/revisi/${regNumber}`, payload, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            if (res.data.success) {
                setSuccessReceipt(res.data.data);
            }
        } catch (err: any) {
            console.error(err);
            if (err.response?.data?.message) {
                setSubmitError(err.response.data.message);
            } else {
                setSubmitError('Gagal mengirim pendaftaran. Silakan cek kembali input data Anda.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    // Success Screen
    if (successReceipt) {
        return (
            <div className="py-16 max-w-2xl mx-auto px-4 text-center">
                <div className="bg-white p-8 sm:p-12 rounded-3xl shadow-lg border-none flex flex-col items-center">
                    <CheckCircle2 size={64} className="text-teal-600 mb-6" />
                    <h1 className="text-2xl font-bold text-slate-800 mb-2">Revisi Berhasil!</h1>
                    <p className="text-slate-500 text-xs sm:text-sm mb-6">Revisi data dan berkas atas nama <strong>{successReceipt.full_name}</strong> telah tersimpan di sistem kami.</p>
                    
                    <div className="w-full bg-slate-50 rounded-2xl p-6 mb-8 text-left border-none">
                        <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider mb-1">Nomor Registrasi Anda</span>
                        <span className="text-2xl font-extrabold text-teal-700 tracking-wide">{successReceipt.registration_number}</span>
                        <div className="mt-4 pt-4 border-t border-slate-200 text-xs text-slate-600 space-y-1">
                            <p><strong>Status Pendaftaran:</strong> <span className="px-2.5 py-0.5 bg-yellow-100 text-yellow-800 text-[10px] font-bold rounded-full uppercase">{successReceipt.status}</span></p>
                            <p className="mt-2 text-[10px] text-slate-400">Gunakan nomor registrasi di atas untuk memeriksa status berkas Anda di halaman "Cek Status".</p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={() => window.print()}
                            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition border-none cursor-pointer"
                        >
                            Cetak Bukti
                        </button>
                        <Link
                            to="/"
                            className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs transition border-none cursor-pointer"
                        >
                            Kembali ke Beranda
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (dataLoading) {
        return (
            <div className="py-12 bg-slate-50 min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-500 text-sm">Memuat data formulir...</p>
                </div>
            </div>
        );
    }

    // MODE 2: Formulir PPDB Online (5 Steps)
    return (
        <div className="py-12 bg-slate-50 text-left min-h-screen">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Title */}
                <div className="text-center max-w-3xl mx-auto mb-10">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800">Revisi Data & Berkas</h1>
                    <div className="w-16 h-1 bg-teal-500 mx-auto mt-4 rounded"></div>
                    <p className="mt-4 text-slate-500 text-xs sm:text-sm">
                        Isi data dengan lengkap dan benar untuk mendaftarkan putra-putri Anda.
                    </p>
                </div>

                {/* Progress Indicators */}
                <div className="mb-10 flex justify-between items-center bg-white p-4 rounded-2xl shadow-md max-w-2xl mx-auto border-none">
                    {[
                        { num: 1, label: 'Kontak', icon: <HelpCircle size={16} /> },
                        { num: 2, label: 'Siswa', icon: <User size={16} /> },
                        { num: 3, label: 'Program', icon: <BookOpen size={16} /> },
                        { num: 4, label: 'Wali', icon: <Users size={16} /> },
                        { num: 5, label: 'Berkas', icon: <Upload size={16} /> },
                    ].map((item) => (
                        <div key={item.num} className="flex items-center gap-2">
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                                    step >= item.num
                                        ? 'bg-teal-600 text-white'
                                        : 'bg-slate-100 text-slate-400'
                                }`}
                            >
                                {item.icon}
                            </div>
                            <span
                                className={`text-xxs font-semibold hidden sm:inline ${
                                    step >= item.num ? 'text-teal-800' : 'text-slate-400'
                                }`}
                            >
                                {item.label}
                            </span>
                            {item.num < 5 && <ChevronRight size={14} className="text-slate-350 hidden sm:block" />}
                        </div>
                    ))}
                </div>

                {/* Form Wrapper */}
                <div className="bg-white rounded-3xl shadow-lg p-6 sm:p-10 border-none">
                    {submitError && (
                        <div className="p-4 bg-rose-50 text-rose-700 text-xs font-semibold rounded-xl mb-6 flex items-center gap-2">
                            <AlertCircle size={18} />
                            <span>{submitError}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit(handleNextStep)} className="space-y-8">
                        
                        {/* Step 1: Kontak Pendaftar */}
                        {step === 1 && (
                            <div className="space-y-6">
                                <h3 className="text-md sm:text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 flex justify-between items-center">
                                    <span>Langkah 1: Informasi Kontak</span>
                                    <span className="text-xxs font-bold text-teal-650 bg-teal-50 px-2.5 py-0.5 rounded-full">1/5 Selesai</span>
                                </h3>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xxs font-bold text-slate-500 uppercase tracking-wider mb-2">Alamat Email Orang Tua *</label>
                                        <input
                                            type="email"
                                            defaultValue={formData.email || ''}
                                            {...register('email')}
                                            className="w-full px-4 py-3 border border-slate-100 bg-slate-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-xs sm:text-sm font-semibold"
                                            placeholder="contoh: parent@gmail.com"
                                        />
                                        {errors.email && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.email.message as string}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-xxs font-bold text-slate-500 uppercase tracking-wider mb-2">Nomor HP / WhatsApp *</label>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            defaultValue={formData.phone || ''}
                                            {...register('phone')}
                                            onKeyDown={handleNumericKeyDown}
                                            onInput={(e) => handleNumericInput(e, 'phone', 16)}
                                            className="w-full px-4 py-3 border border-slate-100 bg-slate-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-xs sm:text-sm font-semibold"
                                            placeholder="contoh: 08123456789 (Hanya angka)"
                                        />
                                        {errors.phone && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.phone.message as string}</p>}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Student Data (Gambar 4 layout) */}
                        {step === 2 && (
                            <div className="space-y-6">
                                <h3 className="text-md sm:text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 flex justify-between items-center">
                                    <span>Langkah 2: Data Calon Siswa</span>
                                    <span className="text-xxs font-bold text-teal-650 bg-teal-50 px-2.5 py-0.5 rounded-full">2/5 Selesai</span>
                                </h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-xxs font-bold text-slate-500 uppercase tracking-wider mb-2">Nama Lengkap Siswa *</label>
                                        <input
                                            type="text"
                                            defaultValue={formData.full_name || ''}
                                            {...register('full_name')}
                                            onKeyDown={handleLetterKeyDown}
                                            onInput={(e) => handleLetterInput(e, 'full_name')}
                                            className="w-full px-4 py-3 border border-slate-100 bg-slate-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-xs sm:text-sm font-semibold"
                                            placeholder="Nama lengkap anak sesuai Akta (Hanya huruf)"
                                        />
                                        {errors.full_name && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.full_name.message as string}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-xxs font-bold text-slate-500 uppercase tracking-wider mb-2">Nama Panggilan *</label>
                                        <input
                                            type="text"
                                            defaultValue={formData.nickname || ''}
                                            {...register('nickname')}
                                            onKeyDown={handleLetterKeyDown}
                                            onInput={(e) => handleLetterInput(e, 'nickname')}
                                            className="w-full px-4 py-3 border border-slate-100 bg-slate-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-xs sm:text-sm font-semibold"
                                            placeholder="Panggilan (Hanya huruf)"
                                        />
                                        {errors.nickname && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.nickname.message as string}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-xxs font-bold text-slate-500 uppercase tracking-wider mb-2">Nomor NIK Anak *</label>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={16}
                                            defaultValue={formData.nik || ''}
                                            {...register('nik')}
                                            onKeyDown={handleNumericKeyDown}
                                            onInput={(e) => handleNumericInput(e, 'nik', 16)}
                                            className="w-full px-4 py-3 border border-slate-100 bg-slate-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-xs sm:text-sm font-semibold"
                                            placeholder="16 digit nomor NIK (Hanya angka)"
                                        />
                                        {errors.nik && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.nik.message as string}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-xxs font-bold text-slate-500 uppercase tracking-wider mb-2">Jenis Kelamin *</label>
                                        <select
                                            defaultValue={formData.gender || ''}
                                            {...register('gender')}
                                            className="w-full px-4 py-3.5 border border-slate-100 bg-slate-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-xs sm:text-sm font-semibold"
                                        >
                                            <option value="" disabled>-- Pilih --</option>
                                            <option value="L">Laki-laki (L)</option>
                                            <option value="P">Perempuan (P)</option>
                                        </select>
                                        {errors.gender && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.gender.message as string}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-xxs font-bold text-slate-500 uppercase tracking-wider mb-2">Agama *</label>
                                        <input
                                            type="text"
                                            defaultValue={formData.religion || 'Islam'}
                                            {...register('religion')}
                                            onKeyDown={handleLetterKeyDown}
                                            onInput={(e) => handleLetterInput(e, 'religion')}
                                            className="w-full px-4 py-3 border border-slate-100 bg-slate-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-xs sm:text-sm font-semibold"
                                        />
                                        {errors.religion && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.religion.message as string}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-xxs font-bold text-slate-500 uppercase tracking-wider mb-2">Tempat Lahir *</label>
                                        <input
                                            type="text"
                                            defaultValue={formData.birth_place || ''}
                                            {...register('birth_place')}
                                            onKeyDown={handleLetterKeyDown}
                                            onInput={(e) => handleLetterInput(e, 'birth_place')}
                                            className="w-full px-4 py-3 border border-slate-100 bg-slate-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-xs sm:text-sm font-semibold"
                                            placeholder="Kota tempat lahir (Hanya huruf)"
                                        />
                                        {errors.birth_place && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.birth_place.message as string}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-xxs font-bold text-slate-500 uppercase tracking-wider mb-2">Tanggal Lahir *</label>
                                        <input
                                            type="date"
                                            defaultValue={formData.birth_date || ''}
                                            {...register('birth_date')}
                                            className="w-full px-4 py-3 border border-slate-100 bg-slate-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-xs sm:text-sm font-semibold text-slate-500"
                                        />
                                        {errors.birth_date && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.birth_date.message as string}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-xxs font-bold text-slate-500 uppercase tracking-wider mb-2">Asal Sekolah Sebelumnya</label>
                                        <input
                                            type="text"
                                            defaultValue={formData.previous_school || ''}
                                            {...register('previous_school')}
                                            className="w-full px-4 py-3 border border-slate-100 bg-slate-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-xs sm:text-sm font-semibold"
                                            placeholder="Nama KB / Sekolah asal (jika ada)"
                                        />
                                    </div>

                                    <div className="md:col-span-3">
                                        <label className="block text-xxs font-bold text-slate-500 uppercase tracking-wider mb-2">Alamat Lengkap Rumah *</label>
                                        <textarea
                                            rows={3}
                                            defaultValue={formData.address || ''}
                                            {...register('address')}
                                            className="w-full px-4 py-3 border border-slate-100 bg-slate-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-xs sm:text-sm font-semibold"
                                            placeholder="Jalan, No. Rumah, RT/RW, Kecamatan, Sidoarjo"
                                        />
                                        {errors.address && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.address.message as string}</p>}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Pilih Program Kelas (Gambar 3 layout) */}
                        {step === 3 && (
                            <div className="space-y-6">
                                <h3 className="text-md sm:text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 flex justify-between items-center">
                                    <span>Langkah 3 - Pilih Program Kelas</span>
                                    <span className="text-xxs font-bold text-teal-650 bg-teal-50 px-2.5 py-0.5 rounded-full">3/5 Selesai</span>
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {[
                                        {
                                            id: '1',
                                            name: 'Kelompok Bermain',
                                            age: 'Usia 3 - 4 Tahun',
                                            desc: 'Optimalkan masa keemasan ananda dengan stimulasi sensorik, kemandirian, dan adab harian.',
                                            label: 'KB (Playgroup)',
                                            color: 'border-teal-500 ring-2 ring-teal-500/25'
                                        },
                                        {
                                            id: '2',
                                            name: 'TK A',
                                            age: 'Usia 4 - 5 Tahun',
                                            desc: 'Membiasakan shalat harian, wudhu, literasi, hafalan Al-Qur\'an menyenangkan, dan sains cilik.',
                                            label: 'Taman Kanak-Kanak A',
                                            color: 'border-teal-500 ring-2 ring-teal-500/25'
                                        },
                                        {
                                            id: '3',
                                            name: 'TK B',
                                            age: 'Usia 5 - 6 Tahun',
                                            desc: 'Kesiapan matang menuju jenjang SD (calistung ramah anak, Bahasa Arab/Inggris cilik, Tahfidz mandiri).',
                                            label: 'Taman Kanak-Kanak B',
                                            color: 'border-pink-500 ring-2 ring-pink-500/25'
                                        }
                                    ].map((prog) => {
                                        const isSelected = watchProgramId === prog.id || formData.program_id === prog.id;
                                        return (
                                            <div
                                                key={prog.id}
                                                onClick={() => setValue('program_id', prog.id, { shouldValidate: true })}
                                                className={`bg-white p-6 rounded-3xl shadow-md cursor-pointer transition-all duration-300 flex flex-col justify-between min-h-60 relative text-left ${
                                                    isSelected ? prog.color : 'border-none'
                                                }`}
                                            >
                                                <div className="space-y-3">
                                                    <span className="inline-block px-2.5 py-0.5 bg-slate-50 text-slate-450 text-[10px] font-bold rounded-full">{prog.age}</span>
                                                    <h4 className="font-extrabold text-slate-800 text-sm sm:text-base">{prog.name}</h4>
                                                    <p className="text-slate-450 text-[11px] leading-relaxed">{prog.desc}</p>
                                                </div>

                                                <div className="mt-6 pt-4 border-t border-slate-50 flex justify-between items-center">
                                                    <span className="text-xxs font-bold text-slate-400">{prog.label}</span>
                                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 ${
                                                        isSelected ? 'border-pink-500 bg-pink-500 text-white' : 'border-slate-300 bg-white'
                                                    }`}>
                                                        {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                {errors.program_id && <p className="text-xs text-rose-500 font-semibold">{errors.program_id.message as string}</p>}

                                {/* Additional special needs input matching Gambar 3 */}
                                <div className="pt-4">
                                    <label className="block text-xxs font-bold text-slate-500 uppercase tracking-wider mb-2">Catatan Tambahan / Kebutuhan Khusus Siswa (Opsional)</label>
                                    <textarea
                                        rows={4}
                                        defaultValue={formData.notes || ''}
                                        {...register('notes')}
                                        className="w-full px-4 py-3 border border-slate-100 bg-slate-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-xs sm:text-sm font-semibold"
                                        placeholder="Tuliskan kebiasaan unik ananda, riwayat kesehatan, alergi, atau info penting yang perlu guru ketahui saat mendampingi belajar."
                                    />
                                </div>
                            </div>
                        )}

                        {/* Step 4: Parent Data */}
                        {step === 4 && (
                            <div className="space-y-8">
                                <h3 className="text-md sm:text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 flex justify-between items-center">
                                    <span>Langkah 4: Data Orang Tua / Wali</span>
                                    <span className="text-xxs font-bold text-teal-650 bg-teal-50 px-2.5 py-0.5 rounded-full">4/5 Selesai</span>
                                </h3>
                                
                                {/* A. Father */}
                                <div className="space-y-4">
                                    <h4 className="font-semibold text-teal-800 text-xs sm:text-sm flex items-center gap-1.5">
                                        <div className="w-1.5 h-3 bg-teal-600 rounded"></div> Data Ayah Kandung *
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div>
                                            <label className="block text-xxs font-bold text-slate-500 uppercase mb-2">Nama Ayah *</label>
                                            <input
                                                type="text"
                                                defaultValue={formData.father_name || ''}
                                                {...register('father_name')}
                                                onKeyDown={handleLetterKeyDown}
                                                onInput={(e) => handleLetterInput(e, 'father_name')}
                                                className="w-full px-4 py-2.5 border border-slate-100 bg-slate-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-xs sm:text-sm font-semibold"
                                                placeholder="Nama lengkap ayah (Hanya huruf)"
                                            />
                                            {errors.father_name && <p className="text-xs text-rose-500 mt-1 font-semibold">{errors.father_name.message as string}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-xxs font-bold text-slate-500 uppercase mb-2">Pekerjaan</label>
                                            <input 
                                                type="text" 
                                                defaultValue={formData.father_occupation || ''} 
                                                {...register('father_occupation')} 
                                                onKeyDown={handleLetterKeyDown}
                                                onInput={(e) => handleLetterInput(e, 'father_occupation')}
                                                className="w-full px-4 py-2.5 border border-slate-100 bg-slate-50 rounded-xl focus:outline-none text-xs sm:text-sm font-semibold" 
                                                placeholder="Pekerjaan ayah (Hanya huruf)"
                                            />
                                            {errors.father_occupation && <p className="text-xs text-rose-500 mt-1 font-semibold">{errors.father_occupation.message as string}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-xxs font-bold text-slate-500 uppercase mb-2">Pendidikan Terakhir</label>
                                            <input type="text" defaultValue={formData.father_education || ''} {...register('father_education')} className="w-full px-4 py-2.5 border border-slate-100 bg-slate-50 rounded-xl focus:outline-none text-xs sm:text-sm font-semibold" />
                                        </div>
                                        <div>
                                            <label className="block text-xxs font-bold text-slate-500 uppercase mb-2">Nomor Telepon</label>
                                            <input 
                                                type="text" 
                                                inputMode="numeric"
                                                defaultValue={formData.father_phone || ''} 
                                                {...register('father_phone')} 
                                                onKeyDown={handleNumericKeyDown}
                                                onInput={(e) => handleNumericInput(e, 'father_phone', 16)}
                                                className="w-full px-4 py-2.5 border border-slate-100 bg-slate-50 rounded-xl focus:outline-none text-xs sm:text-sm font-semibold" 
                                                placeholder="Nomor HP/WA (Hanya angka)"
                                            />
                                            {errors.father_phone && <p className="text-xs text-rose-500 mt-1 font-semibold">{errors.father_phone.message as string}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-xxs font-bold text-slate-500 uppercase mb-2">Email</label>
                                            <input type="email" defaultValue={formData.father_email || ''} {...register('father_email')} className="w-full px-4 py-2.5 border border-slate-100 bg-slate-50 rounded-xl focus:outline-none text-xs sm:text-sm font-semibold" />
                                        </div>
                                        <div>
                                            <label className="block text-xxs font-bold text-slate-500 uppercase mb-2">Penghasilan Bulanan</label>
                                            <select defaultValue={formData.father_income || ''} {...register('father_income')} className="w-full px-4 py-3 border border-slate-100 bg-slate-50 rounded-xl focus:outline-none text-xs sm:text-sm font-semibold bg-slate-50">
                                                <option value="">-- Pilih --</option>
                                                <option value="Tidak Ada Pendapatan">Tidak Ada Pendapatan</option>
                                                <option value="< Rp 1.500.000">&lt; Rp 1.500.000</option>
                                                <option value="Rp 1.500.000 - Rp 3.000.000">Rp 1.500.000 - Rp 3.000.000</option>
                                                <option value="Rp 3.000.000 - Rp 5.000.000">Rp 3.000.000 - Rp 5.000.000</option>
                                                <option value="Rp 5.000.000 - Rp 10.000.000">Rp 5.000.000 - Rp 10.000.000</option>
                                                <option value="> Rp 10.000.000">&gt; Rp 10.000.000</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* B. Mother */}
                                <div className="space-y-4 pt-6 border-t border-slate-100">
                                    <h4 className="font-semibold text-teal-800 text-xs sm:text-sm flex items-center gap-1.5">
                                        <div className="w-1.5 h-3 bg-teal-600 rounded"></div> Data Ibu Kandung *
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div>
                                            <label className="block text-xxs font-bold text-slate-500 uppercase mb-2">Nama Ibu *</label>
                                            <input
                                                type="text"
                                                defaultValue={formData.mother_name || ''}
                                                {...register('mother_name')}
                                                onKeyDown={handleLetterKeyDown}
                                                onInput={(e) => handleLetterInput(e, 'mother_name')}
                                                className="w-full px-4 py-2.5 border border-slate-100 bg-slate-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-xs sm:text-sm font-semibold"
                                                placeholder="Nama lengkap ibu (Hanya huruf)"
                                            />
                                            {errors.mother_name && <p className="text-xs text-rose-500 mt-1 font-semibold">{errors.mother_name.message as string}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-xxs font-bold text-slate-500 uppercase mb-2">Pekerjaan</label>
                                            <input 
                                                type="text" 
                                                defaultValue={formData.mother_occupation || ''} 
                                                {...register('mother_occupation')} 
                                                onKeyDown={handleLetterKeyDown}
                                                onInput={(e) => handleLetterInput(e, 'mother_occupation')}
                                                className="w-full px-4 py-2.5 border border-slate-100 bg-slate-50 rounded-xl focus:outline-none text-xs sm:text-sm font-semibold" 
                                                placeholder="Pekerjaan ibu (Hanya huruf)"
                                            />
                                            {errors.mother_occupation && <p className="text-xs text-rose-500 mt-1 font-semibold">{errors.mother_occupation.message as string}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-xxs font-bold text-slate-500 uppercase mb-2">Pendidikan Terakhir</label>
                                            <input type="text" defaultValue={formData.mother_education || ''} {...register('mother_education')} className="w-full px-4 py-2.5 border border-slate-100 bg-slate-50 rounded-xl focus:outline-none text-xs sm:text-sm font-semibold" />
                                        </div>
                                        <div>
                                            <label className="block text-xxs font-bold text-slate-500 uppercase mb-2">Nomor Telepon</label>
                                            <input 
                                                type="text" 
                                                inputMode="numeric"
                                                defaultValue={formData.mother_phone || ''} 
                                                {...register('mother_phone')} 
                                                onKeyDown={handleNumericKeyDown}
                                                onInput={(e) => handleNumericInput(e, 'mother_phone', 16)}
                                                className="w-full px-4 py-2.5 border border-slate-100 bg-slate-50 rounded-xl focus:outline-none text-xs sm:text-sm font-semibold" 
                                                placeholder="Nomor HP/WA (Hanya angka)"
                                            />
                                            {errors.mother_phone && <p className="text-xs text-rose-500 mt-1 font-semibold">{errors.mother_phone.message as string}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-xxs font-bold text-slate-500 uppercase mb-2">Email</label>
                                            <input type="email" defaultValue={formData.mother_email || ''} {...register('mother_email')} className="w-full px-4 py-2.5 border border-slate-100 bg-slate-50 rounded-xl focus:outline-none text-xs sm:text-sm font-semibold" />
                                        </div>
                                        <div>
                                            <label className="block text-xxs font-bold text-slate-500 uppercase mb-2">Penghasilan Bulanan</label>
                                            <select defaultValue={formData.mother_income || ''} {...register('mother_income')} className="w-full px-4 py-3 border border-slate-100 bg-slate-50 rounded-xl focus:outline-none text-xs sm:text-sm font-semibold bg-slate-50">
                                                <option value="">-- Pilih --</option>
                                                <option value="Tidak Ada Pendapatan">Tidak Ada Pendapatan</option>
                                                <option value="< Rp 1.500.000">&lt; Rp 1.500.000</option>
                                                <option value="Rp 1.500.000 - Rp 3.000.000">Rp 1.500.000 - Rp 3.000.000</option>
                                                <option value="Rp 3.000.000 - Rp 5.000.000">Rp 3.000.000 - Rp 5.000.000</option>
                                                <option value="Rp 5.000.000 - Rp 10.000.000">Rp 5.000.000 - Rp 10.000.000</option>
                                                <option value="> Rp 10.000.000">&gt; Rp 10.000.000</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 5: Berkas & Pembayaran (Gambar 1 layout) */}
                        {step === 5 && (
                            <div className="space-y-6">
                                <h3 className="text-md sm:text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 flex justify-between items-center">
                                    <span>Langkah 5: Unggah Dokumen Persyaratan & Bukti Pembayaran</span>
                                    <span className="text-xxs font-bold text-teal-650 bg-teal-50 px-2.5 py-0.5 rounded-full">5/5 Selesai</span>
                                </h3>

                                {fileErrors && (
                                    <div className="p-4 bg-rose-50 text-rose-700 text-xs font-semibold rounded-xl">
                                        {fileErrors}
                                    </div>
                                )}

                                {/* Official 3-line Payment Breakdown & Transfer Information Box (Clean Light Theme) */}
                                {(() => {
                                    const calc = feeCalculation || getCalculatedFee(formData.program_id);
                                    const formatRp = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
                                    return (
                                        <div className="bg-[#F5FAFF] p-6 sm:p-7 rounded-3xl space-y-5 shadow-xs border border-sky-200/80 text-left">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-sky-200/60 pb-4">
                                                <div>
                                                    <span className="text-teal-700 text-xxs font-extrabold uppercase tracking-widest block">Rincian Resmi Pembayaran</span>
                                                    <h4 className="text-base sm:text-lg font-bold text-slate-800 mt-0.5">
                                                        Verifikasi Berkas & Uang Masuk PPDB
                                                    </h4>
                                                </div>
                                                {formData.full_name && (
                                                    <span className="px-3 py-1 bg-white text-teal-800 text-xs font-semibold rounded-full self-start sm:self-auto border border-teal-200/70 shadow-2xs">
                                                        Calon Siswa: <strong>{formData.full_name}</strong>
                                                    </span>
                                                )}
                                            </div>

                                            {/* Calculation Lines */}
                                            <div className="space-y-2.5 bg-white p-4 sm:p-5 rounded-2xl text-xs border border-sky-100 shadow-2xs">
                                                <div className="flex justify-between items-center text-slate-600">
                                                    <span className="font-medium">+ Biaya Masuk {calc.program_name}</span>
                                                    <span className="font-bold text-slate-800">{formatRp(calc.entry_fee)}</span>
                                                </div>
                                                {calc.form_fee > 0 && (
                                                    <div className="flex justify-between items-center text-slate-600">
                                                        <span className="font-medium">+ Biaya Form Pendaftaran</span>
                                                        <span className="font-bold text-slate-800">{formatRp(calc.form_fee)}</span>
                                                    </div>
                                                )}
                                                <div className="flex justify-between items-center text-emerald-700">
                                                    <span className="font-medium">− Cashback {calc.cashback_percent || 50}% Infaq Pendidikan ({calc.wave_name})</span>
                                                    <span className="font-bold">− {formatRp(calc.discount_amount)}</span>
                                                </div>
                                                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-sky-50/50 -mx-4 -mb-4 sm:-mx-5 sm:-mb-5 p-4 sm:p-5 rounded-b-2xl">
                                                    <div>
                                                        <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wide text-slate-800 block">
                                                            TOTAL YANG HARUS DITRANSFER:
                                                        </span>
                                                        <span className="text-[10px] text-slate-400 font-medium">
                                                            {formatRp(calc.entry_fee)} − {formatRp(calc.discount_amount)} ({calc.cashback_percent || 50}% × {formatRp(calc.infaq_amount || (calc.program_name?.includes('KB') ? 550000 : 750000))})
                                                        </span>
                                                    </div>
                                                    <span className="text-xl sm:text-2xl font-black text-teal-800 font-mono tracking-tight">
                                                        {formatRp(calc.total_transfer_amount)}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Destination Bank Account Information with Copy Button */}
                                            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-sky-100 shadow-2xs space-y-3 text-xs">
                                                <span className="text-teal-700 text-xxs font-bold uppercase tracking-wider block">Rekening Tujuan Transfer Resmi:</span>
                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-slate-700">
                                                    <div>
                                                        <span className="text-slate-400 text-xxs block">Bank:</span>
                                                        <strong className="text-slate-800 text-xs sm:text-sm">Bank Syariah Indonesia (BSI)</strong>
                                                    </div>
                                                    <div>
                                                        <span className="text-slate-400 text-xxs block">Nomor Rekening:</span>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <span className="font-mono font-bold text-slate-900 text-sm sm:text-base tracking-wider">7122107207</span>
                                                            <button
                                                                type="button"
                                                                onClick={handleCopyRekening}
                                                                className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 rounded-lg text-xxs font-bold transition flex items-center gap-1 cursor-pointer active:scale-95 shadow-2xs"
                                                                title="Salin Nomor Rekening"
                                                            >
                                                                {copiedRekening ? <Check size={12} className="text-teal-700" /> : <Copy size={12} />}
                                                                <span>{copiedRekening ? 'Tersalin ✓' : 'Salin'}</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <span className="text-slate-400 text-xxs block">Atas Nama (a/n):</span>
                                                        <strong className="text-slate-800 text-xs sm:text-sm">Rumi Salam Muhaimin</strong>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })()}

                                {/* Testing utility help info */}
                                <div className="p-4 bg-slate-50 rounded-2xl text-[10px] sm:text-xs text-slate-500 leading-relaxed border-none flex items-start gap-1.5">
                                    <span>💡</span>
                                    <span>Berkas yang diunggah harus dalam format JPG, PNG, atau PDF dengan kapasitas maksimal masing-masing 2MB. Untuk keperluan testing, Anda dapat mengunggah gambar/dokumen apa saja atau mengklik tombol upload untuk mensimulasikan berkas Anda.</span>
                                </div>

                                {/* Dashed files rows matching Gambar 1 */}
                                <div className="space-y-4 pt-4">
                                    {[
                                        {
                                            label: 'Akta Kelahiran Siswa *',
                                            desc: 'Scan dokumen asli Akta Kelahiran yang jelas terbaca.',
                                            file: birthCertificateFile,
                                            set: setBirthCertificateFile,
                                            btn: 'Pilih Berkas'
                                        },
                                        {
                                            label: 'Kartu Keluarga (KK) *',
                                            desc: 'Scan Kartu Keluarga terbaru yang memuat nama ananda.',
                                            file: familyCardFile,
                                            set: setFamilyCardFile,
                                            btn: 'Pilih Berkas'
                                        },
                                        {
                                            label: 'Foto Anak yang Ceria *',
                                            desc: 'Foto ananda setengah badan, berpakaian rapi, dengan pose senyum terbaik.',
                                            file: photoFile,
                                            set: setPhotoFile,
                                            btn: 'Pilih Foto'
                                        },
                                        {
                                            label: 'Upload Bukti Transfer Pembayaran *',
                                            desc: 'Pastikan foto atau bukti transfer terlihat jelas, mencantumkan tanggal transfer, dan nominal yang sesuai.',
                                            file: paymentReceiptFile,
                                            set: setPaymentReceiptFile,
                                            btn: 'Pilih Bukti'
                                        }
                                    ].map((row, i) => (
                                        <div key={i} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-white rounded-3xl shadow-sm hover:shadow transition-shadow gap-4 relative group border-none">
                                            <div className="flex items-start gap-3 text-left flex-1 min-w-0">
                                                <div className="w-10 h-10 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600 flex-shrink-0 mt-0.5">
                                                    <FilePlus size={18} />
                                                </div>
                                                <div className="flex-1 min-w-0 pr-2">
                                                    <h4 className="font-bold text-slate-800 text-xs sm:text-sm">{row.label}</h4>
                                                    <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5 leading-relaxed">{row.desc}</p>
                                                    
                                                    {row.file && (
                                                        <div className="mt-2 text-xxs font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-full inline-block max-w-[200px] truncate">
                                                            ✓ {row.file.name}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="relative cursor-pointer self-stretch sm:self-auto flex items-center justify-center flex-shrink-0">
                                                <button
                                                    type="button"
                                                    className="w-full sm:w-auto px-5 py-2.5 border border-slate-200 rounded-2xl text-slate-700 text-xxs sm:text-xs font-bold hover:bg-slate-50 transition flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap flex-shrink-0"
                                                >
                                                    <Upload size={14} className="flex-shrink-0" />
                                                    <span className="whitespace-nowrap">{row.btn}</span>
                                                </button>
                                                <input
                                                    type="file"
                                                    onChange={(e) => row.set(e.target.files?.[0] || null)}
                                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                                    accept=".pdf,.jpg,.jpeg,.png,image/*"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Confirmation checkbox */}
                                <div className="mt-6 p-4 bg-teal-50/50 rounded-2xl flex items-start gap-3 border-none">
                                    <input
                                        type="checkbox"
                                        id="confirm"
                                        checked={confirmationChecked}
                                        onChange={(e) => setConfirmationChecked(e.target.checked)}
                                        className="mt-1 accent-teal-650 rounded"
                                    />
                                    <label htmlFor="confirm" className="text-xxs sm:text-xs text-slate-600 cursor-pointer leading-relaxed">
                                        Saya menyatakan dengan sesungguhnya bahwa semua data yang saya masukkan dalam formulir PPDB online ini adalah benar, jujur, dan sesuai dengan dokumen berkas asli anak.
                                    </label>
                                </div>
                            </div>
                        )}

                        {/* Navigation controls */}
                        <div className="border-t border-slate-100 pt-6 flex justify-between gap-4">
                            {step > 1 ? (
                                <button
                                    type="button"
                                    onClick={handlePrevStep}
                                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition flex items-center gap-1.5 border-none cursor-pointer"
                                >
                                    <ChevronLeft size={16} /> Sebelumnya
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleBackToStatus}
                                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition flex items-center gap-1.5 border-none cursor-pointer"
                                >
                                    <ChevronLeft size={16} /> Kembali ke Cek Status
                                </button>
                            )}

                            {step < 5 ? (
                                <button
                                    type="submit"
                                    className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5 ml-auto border-none cursor-pointer"
                                >
                                    Selanjutnya <ChevronRight size={16} />
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    disabled={submitting}
                                    onClick={onSubmitFinal}
                                    className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs transition flex items-center gap-2 ml-auto shadow disabled:opacity-50 border-none cursor-pointer"
                                >
                                    {submitting ? 'Sedang Mengirim...' : 'Kirim Pendaftaran'} <ShieldCheck size={18} />
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
