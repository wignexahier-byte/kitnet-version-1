import React, { createContext, useContext, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType, title?: string, duration?: number) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    // Return a graceful fallback if outside provider
    return {
      showToast: () => {},
      success: () => {},
      error: () => {},
      warning: () => {},
      info: () => {},
      dismissToast: () => {},
    };
  }
  return context;
};

const toastConfig: Record<
  ToastType,
  { icon: React.ComponentType<{ className?: string }>; bg: string; border: string; text: string }
> = {
  success: {
    icon: CheckCircle2,
    bg: 'bg-emerald-950/90',
    border: 'border-emerald-500/40',
    text: 'text-emerald-300',
  },
  error: {
    icon: AlertCircle,
    bg: 'bg-rose-950/90',
    border: 'border-rose-500/40',
    text: 'text-rose-300',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-amber-950/90',
    border: 'border-amber-500/40',
    text: 'text-amber-300',
  },
  info: {
    icon: Info,
    bg: 'bg-indigo-950/90',
    border: 'border-indigo-500/40',
    text: 'text-indigo-300',
  },
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', title?: string, duration = 4000) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: ToastItem = { id, type, title, message, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          dismissToast(id);
        }, duration);
      }
    },
    [dismissToast]
  );

  const success = useCallback((msg: string, title?: string) => showToast(msg, 'success', title), [showToast]);
  const error = useCallback((msg: string, title?: string) => showToast(msg, 'error', title), [showToast]);
  const warning = useCallback((msg: string, title?: string) => showToast(msg, 'warning', title), [showToast]);
  const info = useCallback((msg: string, title?: string) => showToast(msg, 'info', title), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info, dismissToast }}>
      {children}
      {typeof document !== 'undefined' &&
        createPortal(
          <div className="fixed bottom-5 right-5 z-[200] flex flex-col gap-2.5 max-w-md w-[calc(100vw-2.5rem)] pointer-events-none">
            {toasts.map((toast) => {
              const cfg = toastConfig[toast.type];
              const IconComp = cfg.icon;

              return (
                <div
                  key={toast.id}
                  className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border shadow-2xl backdrop-blur-md animate-slideInRight ${cfg.bg} ${cfg.border}`}
                >
                  <IconComp className={`w-5 h-5 shrink-0 mt-0.5 ${cfg.text}`} />
                  <div className="flex-1 min-w-0">
                    {toast.title && (
                      <h4 className="text-sm font-bold text-white mb-0.5">{toast.title}</h4>
                    )}
                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed break-words">
                      {toast.message}
                    </p>
                  </div>
                  <button
                    onClick={() => dismissToast(toast.id)}
                    className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>,
          document.body
        )}
    </ToastContext.Provider>
  );
};
