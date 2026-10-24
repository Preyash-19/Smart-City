import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, title?: string, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const lastToastRef = useRef<{ message: string; timestamp: number } | null>(null);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((
    message: string, 
    type: ToastType = 'info', 
    title?: string, 
    duration: number = 3500
  ) => {
    // Deduplicate rapid identical messages within 1.5 seconds
    const now = Date.now();
    if (
      lastToastRef.current &&
      lastToastRef.current.message === message &&
      now - lastToastRef.current.timestamp < 1500
    ) {
      return;
    }
    lastToastRef.current = { message, timestamp: now };

    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const newToast: ToastMessage = { id, type, title, message, duration };

    setToasts((prev) => [...prev.slice(-4), newToast]); // Keep at most 5 toasts visible

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const getToastIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />;
      case 'info':
      default:
        return <Info className="w-4 h-4 text-cyan-500 shrink-0" />;
    }
  };

  const getToastStyles = (type: ToastType) => {
    switch (type) {
      case 'success':
        return 'border-emerald-500/30 bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-white shadow-emerald-500/10';
      case 'error':
        return 'border-rose-500/30 bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-white shadow-rose-500/10';
      case 'warning':
        return 'border-amber-500/30 bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-white shadow-amber-500/10';
      case 'info':
      default:
        return 'border-cyan-500/30 bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-white shadow-cyan-500/10';
    }
  };

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      {/* Toast Render Portal */}
      <div 
        aria-live="polite" 
        className="fixed bottom-4 right-4 sm:top-5 sm:bottom-auto z-[9999] flex flex-col gap-2.5 max-w-sm sm:max-w-md w-full px-4 sm:px-0 pointer-events-none"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl border backdrop-blur-xl shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-3 sm:slide-in-from-top-3 ${getToastStyles(toast.type)}`}
          >
            <div className="mt-0.5">{getToastIcon(toast.type)}</div>
            <div className="flex-1 min-w-0">
              {toast.title && (
                <h4 className="text-xs font-bold leading-tight mb-0.5 text-slate-900 dark:text-white">
                  {toast.title}
                </h4>
              )}
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed break-words font-medium">
                {toast.message}
              </p>
            </div>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded-lg transition-colors cursor-pointer"
              aria-label="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
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
