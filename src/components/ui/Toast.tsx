"use client";

import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

export interface ToastContextValue {
  show: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
  dismiss: (id: string) => void;
  toast: {
    show: (message: string, type?: ToastType) => void;
    success: (message: string) => void;
    error: (message: string) => void;
    info: (message: string) => void;
    warning: (message: string) => void;
    dismiss: (id: string) => void;
  };
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timeoutsRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timeoutsRef.current.delete(id);
    }
  }, []);

  const show = useCallback((message: string, type: ToastType = "info") => {
    const trimmed = message.trim();
    if (!trimmed) return;

    // Deduplicate: avoid spamming identical messages if already showing
    setToasts((prev) => {
      if (prev.some((t) => t.message === trimmed && t.type === type)) {
        return prev;
      }
      const id = "toast_" + Math.random().toString(36).substring(2, 9);
      const newToast: ToastItem = { id, type, message: trimmed };

      // Set auto dismiss timer (3.2 seconds)
      const timer = setTimeout(() => {
        dismiss(id);
      }, 3200);
      timeoutsRef.current.set(id, timer);

      // Keep maximum 3 toasts visible at once to prevent clutter
      return [...prev.slice(-2), newToast];
    });
  }, [dismiss]);

  const success = useCallback((message: string) => show(message, "success"), [show]);
  const error = useCallback((message: string) => show(message, "error"), [show]);
  const info = useCallback((message: string) => show(message, "info"), [show]);
  const warning = useCallback((message: string) => show(message, "warning"), [show]);

  const icons: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />,
    error: <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />,
    info: <Info className="w-4 h-4 text-brand-500 shrink-0" />,
  };

  const contextValue: ToastContextValue = {
    show,
    success,
    error,
    info,
    warning,
    dismiss,
    toast: { show, success, error, info, warning, dismiss },
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {/* Toast Notification Container */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="fixed bottom-4 inset-x-4 sm:inset-x-auto sm:right-6 sm:bottom-6 z-50 flex flex-col gap-2 pointer-events-none pb-safe max-w-sm ml-auto"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role={toast.type === "error" ? "alert" : "status"}
            className={cn(
              "pointer-events-auto flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium backdrop-blur-md shadow-card border transition-all animate-in fade-in slide-in-from-bottom-2 duration-150",
              toast.type === "success" && "bg-white/95 dark:bg-zinc-900/95 text-gray-900 dark:text-gray-100 border-gray-200/80 dark:border-zinc-800",
              toast.type === "error" && "bg-white/95 dark:bg-zinc-900/95 text-gray-900 dark:text-gray-100 border-rose-200/80 dark:border-rose-900/50",
              toast.type === "warning" && "bg-white/95 dark:bg-zinc-900/95 text-gray-900 dark:text-gray-100 border-amber-200/80 dark:border-amber-900/50",
              toast.type === "info" && "bg-white/95 dark:bg-zinc-900/95 text-gray-900 dark:text-gray-100 border-brand-200/80 dark:border-zinc-800"
            )}
          >
            <div className="flex items-center gap-2 min-w-0">
              {icons[toast.type]}
              <span className="truncate">{toast.message}</span>
            </div>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              aria-label="Dismiss notification"
              className="p-1 rounded-md text-gray-400 hover:text-gray-700 dark:hover:text-zinc-200 transition-colors shrink-0"
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
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
