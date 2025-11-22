'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
    id: string;
    type: ToastType;
    message: string;
    duration?: number;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = 'info', duration: number = 5000) => {
        const id = Math.random().toString(36).substring(7);
        const newToast: Toast = { id, type, message, duration };

        setToasts(prev => [...prev, newToast]);

        if (duration > 0) {
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== id));
            }, duration);
        }
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
}

function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) {
    return (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 pointer-events-none">
            {toasts.map(toast => (
                <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
            ))}
        </div>
    );
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
    const getToastStyles = () => {
        switch (toast.type) {
            case 'success':
                return 'bg-green-50 border-green-600 text-green-800';
            case 'error':
                return 'bg-red-50 border-red-600 text-red-800';
            case 'warning':
                return 'bg-yellow-50 border-yellow-600 text-yellow-800';
            default:
                return 'bg-blue-50 border-blue-600 text-blue-800';
        }
    };

    const getIcon = () => {
        switch (toast.type) {
            case 'success':
                return '✅';
            case 'error':
                return '❌';
            case 'warning':
                return '⚠️';
            default:
                return 'ℹ️';
        }
    };

    return (
        <div
            className={`
                pointer-events-auto
                card-sketch
                ${getToastStyles()}
                border-2
                p-4
                pr-12
                min-w-[320px]
                max-w-[480px]
                animate-toast-slide-in
                shadow-sketch-hover
                relative
                transform
                hover:scale-105
                transition-transform
                duration-200
            `}
        >
            <button
                onClick={() => onRemove(toast.id)}
                className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center hover:bg-black/5 rounded-full transition-colors font-bold text-lg"
                aria-label="Close"
            >
                ×
            </button>

            <div className="flex items-start gap-3">
                <div className="text-2xl flex-shrink-0 mt-0.5">
                    {getIcon()}
                </div>
                <div className="flex-1">
                    <p className="font-bold text-sm leading-relaxed break-words">
                        {toast.message}
                    </p>
                </div>
            </div>

            {/* Sketch-style progress bar */}
            {toast.duration && toast.duration > 0 && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10 overflow-hidden">
                    <div
                        className="h-full bg-current opacity-50 animate-toast-progress"
                        style={{ animationDuration: `${toast.duration}ms` }}
                    />
                </div>
            )}
        </div>
    );
}
