"use client";

import * as React from "react";

export type ToastTone = "success" | "error" | "info";

export type ToastItem = {
  id: string;
  title: string;
  description?: string;
  tone: ToastTone;
};

type ToastContextValue = {
  push: (toast: Omit<ToastItem, "id">) => void;
};

const ToastContext = React.createContext<ToastContextValue | null>(null);

function uid() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  const push = React.useCallback((t: Omit<ToastItem, "id">) => {
    const id = uid();
    setToasts((prev) => [{ ...t, id }, ...prev].slice(0, 3));
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== id));
    }, 2600);
  }, []);

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[9999] flex justify-center px-4 print:hidden">
        <div className="flex w-full max-w-md flex-col gap-2">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={[
                "pointer-events-auto rounded-2xl border px-4 py-3 shadow-lg backdrop-blur",
                "bg-card/95",
                t.tone === "success"
                  ? "border-emerald-200 text-emerald-950 dark:border-emerald-900/60 dark:text-emerald-100"
                  : t.tone === "error"
                    ? "border-rose-200 text-rose-950 dark:border-rose-900/60 dark:text-rose-100"
                    : "border-border text-foreground",
              ].join(" ")}
              role="status"
              aria-live="polite"
            >
              <div className="text-sm font-semibold">{t.title}</div>
              {t.description ? <div className="mt-1 text-xs text-muted-foreground">{t.description}</div> : null}
            </div>
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

