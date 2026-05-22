"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "warning" | "error" | "info";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextProps {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextProps | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = "info", duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, duration }]);

    setTimeout(() => {
      hideToast(id);
    }, duration);
  }, [hideToast]);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      
      {/* Dynamic Animated Toast Container overlay */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={hideToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used inside a ToastProvider");
  }
  return context;
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: (id: string) => void }) {
  const icons = {
    success: <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />,
    warning: <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0" />,
    error: <XCircle className="h-5 w-5 text-rose-400 shrink-0" />,
    info: <Info className="h-5 w-5 text-sky-400 shrink-0" />,
  };

  const borderColors = {
    success: "border-emerald-500/20 hover:border-emerald-500/40 bg-emerald-950/20",
    warning: "border-amber-500/20 hover:border-amber-500/40 bg-amber-950/20",
    error: "border-rose-500/20 hover:border-rose-500/40 bg-rose-950/20",
    info: "border-sky-500/20 hover:border-sky-500/40 bg-sky-950/20",
  };

  return (
    <div
      className={`pointer-events-auto flex items-center justify-between gap-3 rounded-2xl border backdrop-blur-xl p-4 shadow-xl animate-in slide-in-from-bottom-5 duration-300 ${borderColors[toast.type]}`}
    >
      <div className="flex items-center gap-3">
        {icons[toast.type]}
        <p className="text-sm font-medium text-white/95">{toast.message}</p>
      </div>
      <button
        onClick={() => onClose(toast.id)}
        className="text-white/40 hover:text-white/75 transition-colors p-1 rounded-lg hover:bg-white/5"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
