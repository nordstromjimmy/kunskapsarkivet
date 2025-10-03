"use client";

import { useEffect, useRef } from "react";

type Props = {
  open: boolean;
  title?: string;
  description?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "default";
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmModal({
  open,
  title = "Är du säker?",
  description = "Den här åtgärden kan inte ångras.",
  confirmLabel = "Bekräfta",
  cancelLabel = "Avbryt",
  tone = "default",
  onConfirm,
  onCancel,
}: Props) {
  const confirmRef = useRef<HTMLButtonElement | null>(null);

  // Focus the confirm button when the modal opens
  useEffect(() => {
    if (open) {
      confirmRef.current?.focus();
    }
  }, [open]);

  // ESC closes
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;

  const confirmBase =
    tone === "danger"
      ? "bg-rose-600 hover:bg-rose-700 text-white"
      : "bg-slate-900 hover:bg-slate-800 text-white";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onCancel} />
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-xl"
      >
        <h2 className="text-base font-semibold">{title}</h2>
        <div className="mt-2 text-sm text-slate-600">{description}</div>
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            className="rounded-lg border px-3 py-1.5 text-sm hover:bg-slate-50 cursor-pointer"
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            type="button"
            className={`rounded-lg px-3 py-1.5 text-sm cursor-pointer ${confirmBase}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
