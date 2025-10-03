"use client";

export default function InfoModal({
  open,
  title = "Meddelande",
  description,
  confirmLabel = "Okej",
  onClose,
}: {
  open: boolean;
  title?: string;
  description?: React.ReactNode;
  confirmLabel?: string;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
        <h2 className="text-base font-semibold">{title}</h2>
        {description && (
          <div className="mt-2 text-sm text-slate-600">{description}</div>
        )}
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg bg-slate-900 px-3 py-1.5 text-sm text-white hover:bg-slate-800"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
