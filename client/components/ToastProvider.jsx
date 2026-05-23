"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CheckCircle, Info, WarningCircle, X } from "@phosphor-icons/react";

const ToastContext = createContext(null);

const toastStyles = {
  success: {
    icon: CheckCircle,
    accent: "text-emerald-400",
    ring: "bg-emerald-500/10 border-emerald-500/30",
  },
  error: {
    icon: WarningCircle,
    accent: "text-red-400",
    ring: "bg-red-500/10 border-red-500/30",
  },
  warning: {
    icon: WarningCircle,
    accent: "text-yellow-300",
    ring: "bg-yellow-500/10 border-yellow-500/30",
  },
  info: {
    icon: Info,
    accent: "text-primary",
    ring: "bg-primary/10 border-primary/30",
  },
};

const createToastId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    ({ type = "info", title, message, duration = 3500 }) => {
      const id = createToastId();
      setToasts((prev) => [
        ...prev,
        {
          id,
          type,
          title,
          message,
        },
      ]);

      if (duration > 0) {
        setTimeout(() => removeToast(id), duration);
      }
    },
    [removeToast],
  );

  const value = useMemo(() => ({ addToast }), [addToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-6 right-4 sm:right-6 z-[60] flex flex-col gap-3 w-[min(360px,calc(100vw-2rem))] pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => {
            const style = toastStyles[toast.type] || toastStyles.info;
            const Icon = style.icon;
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, x: 40, scale: 0.98 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 40, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className={`glass-panel border ${style.ring} rounded-2xl px-4 py-3 shadow-xl pointer-events-auto`}
                role="status"
                aria-live="polite"
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl border ${style.ring}`}>
                    <Icon size={18} weight="fill" className={style.accent} />
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-semibold ${style.accent}`}>
                      {toast.title || "Update"}
                    </p>
                    {toast.message && (
                      <p className="text-xs text-neutral-400 mt-0.5 leading-relaxed">
                        {toast.message}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeToast(toast.id)}
                    className="text-neutral-500 hover:text-neutral-200 transition-colors"
                    aria-label="Dismiss notification"
                  >
                    <X size={16} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
