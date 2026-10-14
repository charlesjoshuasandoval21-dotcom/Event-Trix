import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

const STYLES = {
  success: { icon: CheckCircle2, bar: 'bg-emerald-500', text: 'text-emerald-600' },
  error: { icon: AlertCircle, bar: 'bg-red-500', text: 'text-red-600' },
  info: { icon: Info, bar: 'bg-electric-500', text: 'text-electric-600' },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const push = useCallback(
    (type, message) => {
      const id = nextId.current++;
      setToasts((t) => [...t.slice(-3), { id, type, message }]);
      setTimeout(() => dismiss(id), 5000);
    },
    [dismiss]
  );

  const api = useMemo(
    () => ({
      success: (m) => push('success', m),
      error: (m) => push('error', m),
      info: (m) => push('info', m),
    }),
    [push]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <ToastNotifications toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function ToastNotifications({ toasts, onDismiss }) {
  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex flex-col items-end gap-2 p-4 sm:bottom-4 sm:right-4 sm:left-auto sm:max-w-sm"
      aria-live="polite"
    >
      {toasts.map((t) => {
        const s = STYLES[t.type];
        const Icon = s.icon;
        return (
          <div
            key={t.id}
            role={t.type === 'error' ? 'alert' : 'status'}
            className="pointer-events-auto relative flex w-full animate-toast-in items-start gap-3 overflow-hidden rounded-lg border border-slate-200 bg-white py-3 pl-5 pr-3 shadow-lift"
          >
            <span className={`absolute inset-y-0 left-0 w-1.5 ${s.bar}`} />
            <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${s.text}`} aria-hidden="true" />
            <p className="flex-1 text-sm text-slate-700">{t.message}</p>
            <button
              onClick={() => onDismiss(t.id)}
              className="rounded p-0.5 text-slate-400 hover:text-slate-700"
              aria-label="Dismiss notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
