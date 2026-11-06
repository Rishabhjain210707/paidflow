'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Icons } from './Icons';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  message: string;
  description?: string;
  type?: ToastType;
  duration?: number;
}

interface ToastContextValue {
  toast: (message: string, options?: { description?: string; type?: ToastType; duration?: number }) => void;
  success: (message: string, description?: string) => void;
  error: (message: string, description?: string) => void;
  warning: (message: string, description?: string) => void;
  info: (message: string, description?: string) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (
      message: string,
      options?: { description?: string; type?: ToastType; duration?: number }
    ) => {
      const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const duration = options?.duration ?? 4000;
      const type = options?.type ?? 'info';

      const newToast: ToastItem = {
        id,
        message,
        description: options?.description,
        type,
        duration,
      };

      setToasts((prev) => [...prev.slice(-4), newToast]); // Keep maximum 5 toasts

      if (duration > 0) {
        setTimeout(() => {
          dismiss(id);
        }, duration);
      }
    },
    [dismiss]
  );

  const success = useCallback(
    (message: string, description?: string) => {
      toast(message, { description, type: 'success' });
    },
    [toast]
  );

  const error = useCallback(
    (message: string, description?: string) => {
      toast(message, { description, type: 'error', duration: 5500 });
    },
    [toast]
  );

  const warning = useCallback(
    (message: string, description?: string) => {
      toast(message, { description, type: 'warning' });
    },
    [toast]
  );

  const info = useCallback(
    (message: string, description?: string) => {
      toast(message, { description, type: 'info' });
    },
    [toast]
  );

  return (
    <ToastContext.Provider value={{ toast, success, error, warning, info, dismiss }}>
      {children}
      {/* Toast Notification Container (Fixed Top Right) */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none p-2">
        {toasts.map((t) => {
          const isSuccess = t.type === 'success';
          const isError = t.type === 'error';
          const isWarning = t.type === 'warning';

          return (
            <div
              key={t.id}
              className={`pointer-events-auto rounded-2xl p-4 shadow-xl border backdrop-blur-md flex items-start gap-3 transition-all duration-200 animate-in slide-in-from-top-3 fade-in ${
                isSuccess
                  ? 'bg-slate-900/95 border-emerald-500/40 text-white'
                  : isError
                  ? 'bg-slate-900/95 border-rose-500/40 text-white'
                  : isWarning
                  ? 'bg-slate-900/95 border-amber-500/40 text-white'
                  : 'bg-slate-900/95 border-slate-700/60 text-white'
              }`}
            >
              <div className="shrink-0 mt-0.5">
                {isSuccess && <Icons.CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                {isError && <Icons.AlertCircle className="w-4 h-4 text-rose-400" />}
                {isWarning && <Icons.AlertTriangle className="w-4 h-4 text-amber-400" />}
                {!isSuccess && !isError && !isWarning && (
                  <Icons.Sparkles className="w-4 h-4 text-indigo-400" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold leading-snug">{t.message}</p>
                {t.description && (
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                    {t.description}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => dismiss(t.id)}
                className="shrink-0 text-slate-400 hover:text-white p-0.5 rounded transition-colors cursor-pointer"
              >
                <Icons.X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    // Fallback if rendered outside provider
    return {
      toast: (msg) => console.log('Toast:', msg),
      success: (msg) => console.log('Success:', msg),
      error: (msg) => console.error('Error:', msg),
      warning: (msg) => console.warn('Warning:', msg),
      info: (msg) => console.info('Info:', msg),
      dismiss: () => {},
    };
  }
  return context;
}
