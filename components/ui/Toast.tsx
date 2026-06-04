"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, CheckCircle, AlertTriangle, Info, AlertOctagon } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((message: string, type: ToastType = "info", duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, duration }]);

    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ toast, removeToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((item) => (
            <ToastCard key={item.id} item={item} onClose={removeToast} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

const ToastCard: React.FC<{ item: ToastItem; onClose: (id: string) => void }> = ({ item, onClose }) => {
  const { id, message, type } = item;

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />,
    error: <AlertOctagon className="w-5 h-5 text-rose-500 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-500 shrink-0" />,
  };

  const bgColors = {
    success: "border-emerald-500/30 bg-emerald-50/90 dark:bg-emerald-950/80 text-emerald-950 dark:text-emerald-50",
    error: "border-rose-500/30 bg-rose-50/90 dark:bg-rose-950/80 text-rose-950 dark:text-rose-50",
    warning: "border-amber-500/30 bg-amber-50/90 dark:bg-amber-950/80 text-amber-950 dark:text-amber-50",
    info: "border-blue-500/30 bg-blue-50/90 dark:bg-blue-950/80 text-blue-950 dark:text-blue-50",
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.15 } }}
      className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-md ${bgColors[type]}`}
    >
      {icons[type]}
      <p className="text-sm font-medium leading-5 flex-1">{message}</p>
      <button
        onClick={() => onClose(id)}
        className="text-muted-foreground hover:text-foreground transition-colors shrink-0 rounded-lg p-0.5"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
};
