import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ShieldAlert } from 'lucide-react';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(_: Error): State {
        return { hasError: true };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 px-4 text-center">
                    <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-4 shadow-sm">
                        <ShieldAlert size={32} />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800">Terjadi Kesalahan Sistem</h2>
                    <p className="text-slate-500 text-xs sm:text-sm mt-2 max-w-sm leading-relaxed">
                        Aplikasi mengalami kendala teknis dalam memproses data. Silakan muat ulang halaman atau kembali ke beranda.
                    </p>
                    <div className="mt-6 flex gap-3 justify-center">
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded shadow hover:bg-emerald-700 transition"
                        >
                            Muat Ulang Halaman
                        </button>
                        <a
                            href="/"
                            className="px-4 py-2 bg-slate-200 text-slate-700 text-xs font-bold rounded hover:bg-slate-300 transition"
                        >
                            Kembali ke Beranda
                        </a>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
