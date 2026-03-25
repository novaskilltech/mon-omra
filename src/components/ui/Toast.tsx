'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = 'success') => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);

        // Auto remove after 5 seconds
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 5000);
    }, []);

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed bottom-6 right-6 z-[60] flex flex-col gap-3 max-w-md w-full">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={cn(
                            "glass p-4 rounded-2xl border flex items-center gap-4 shadow-2xl animate-in slide-in-from-right-full duration-500",
                            toast.type === 'success' && "border-emerald-500/20 bg-emerald-500/[0.05]",
                            toast.type === 'error' && "border-red-500/20 bg-red-500/[0.05]",
                            toast.type === 'info' && "border-blue-500/20 bg-blue-500/[0.05]"
                        )}
                    >
                        <div className={cn(
                            "p-2 rounded-xl shrink-0",
                            toast.type === 'success' && "bg-emerald-500/10 text-emerald-500",
                            toast.type === 'error' && "bg-red-500/10 text-red-500",
                            toast.type === 'info' && "bg-blue-500/10 text-blue-500"
                        )}>
                            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
                            {toast.type === 'error' && <AlertCircle className="w-5 h-5" />}
                            {toast.type === 'info' && <Info className="w-5 h-5" />}
                        </div>
                        
                        <div className="flex-1">
                            <p className="text-[11px] font-black uppercase tracking-widest text-main/90 leading-tight">
                                {toast.message}
                            </p>
                        </div>

                        <button 
                            onClick={() => removeToast(toast.id)}
                            className="p-1 text-dim hover:text-main transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}
