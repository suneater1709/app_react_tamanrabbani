import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ label, error, className = '', ...props }, ref) => {
    return (
        <div className="w-full">
            {label && <label className="block text-xxs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>}
            <input
                ref={ref}
                className={`w-full px-4 py-2.5 border border-slate-200 bg-slate-50 rounded-xl text-slate-800 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all placeholder-slate-400 disabled:bg-slate-100 disabled:text-slate-400 read-only:bg-slate-100 read-only:text-slate-400 ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-200/50' : ''} ${className}`}
                {...props}
            />
            {error && <p className="text-xs text-rose-500 mt-1 font-medium">{error}</p>}
        </div>
    );
});

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({ label, error, className = '', children, ...props }, ref) => {
    return (
        <div className="w-full">
            {label && <label className="block text-xxs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>}
            <select
                ref={ref}
                className={`w-full px-4 py-3 border border-slate-200 bg-slate-50 rounded-xl text-slate-850 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all disabled:bg-slate-100 disabled:text-slate-400 ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-200/50' : ''} ${className}`}
                {...props}
            >
                {children}
            </select>
            {error && <p className="text-xs text-rose-500 mt-1 font-medium">{error}</p>}
        </div>
    );
});

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ label, error, className = '', ...props }, ref) => {
    return (
        <div className="w-full">
            {label && <label className="block text-xxs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>}
            <textarea
                ref={ref}
                className={`w-full px-4 py-3 border border-slate-200 bg-slate-50 rounded-xl text-slate-800 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all placeholder-slate-400 disabled:bg-slate-100 disabled:text-slate-400 read-only:bg-slate-100 read-only:text-slate-400 ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-200/50' : ''} ${className}`}
                {...props}
            />
            {error && <p className="text-xs text-rose-500 mt-1 font-medium">{error}</p>}
        </div>
    );
});
