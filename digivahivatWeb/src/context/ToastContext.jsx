/**
 * src/context/ToastContext.jsx
 * Unified Toast Notification Provider for DigiVahivat Web
 */
import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    ({ type = 'info', title, message, duration = 4000 }) => {
      const id = Date.now() + Math.random().toString(36).substring(2, 9);
      const newToast = { id, type, title, message };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const showSuccess = useCallback(
    (message, title = 'Success') => {
      addToast({ type: 'success', title, message });
    },
    [addToast]
  );

  const showError = useCallback(
    (message, title = 'Error') => {
      addToast({ type: 'error', title, message });
    },
    [addToast]
  );

  const showWarning = useCallback(
    (message, title = 'Warning') => {
      addToast({ type: 'warning', title, message });
    },
    [addToast]
  );

  const showInfo = useCallback(
    (message, title = 'Info') => {
      addToast({ type: 'info', title, message });
    },
    [addToast]
  );

  return (
    <ToastContext.Provider
      value={{ showSuccess, showError, showWarning, showInfo, addToast }}
    >
      {children}
      {/* Toast Render Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => {
          const config = {
            success: {
              border: 'border-emerald-500/30',
              bg: 'bg-emerald-50/95 text-emerald-900',
              icon: <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />,
            },
            error: {
              border: 'border-rose-500/30',
              bg: 'bg-rose-50/95 text-rose-900',
              icon: <XCircle className="w-5 h-5 text-rose-600 shrink-0" />,
            },
            warning: {
              border: 'border-amber-500/30',
              bg: 'bg-amber-50/95 text-amber-900',
              icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
            },
            info: {
              border: 'border-sky-500/30',
              bg: 'bg-sky-50/95 text-sky-900',
              icon: <Info className="w-5 h-5 text-sky-600 shrink-0" />,
            },
          }[toast.type] || {
            border: 'border-slate-300',
            bg: 'bg-white text-slate-800',
            icon: <Info className="w-5 h-5 text-slate-600 shrink-0" />,
          };

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-lg backdrop-blur-sm transition-all duration-300 animate-in fade-in slide-in-from-bottom-3 ${config.bg} ${config.border}`}
            >
              {config.icon}
              <div className="flex-1 min-w-0">
                {toast.title && (
                  <h4 className="text-sm font-semibold tracking-tight leading-snug">
                    {toast.title}
                  </h4>
                )}
                <p className="text-xs font-normal mt-0.5 leading-relaxed opacity-90 break-words">
                  {toast.message}
                </p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-slate-600 p-1 -mr-1 -mt-1 rounded-md transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};
