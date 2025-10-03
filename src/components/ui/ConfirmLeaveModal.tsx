"use client";

export default function ConfirmLeaveModal({
  open,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onCancel} />
      <div className="relative w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
        <h2 className="text-base font-semibold">Lämna sidan?</h2>
        <p className="mt-2 text-sm text-slate-600">
          Du har osparade ändringar. Är du säker på att du vill lämna sidan?
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <button
            className="rounded-lg border px-3 py-1.5 text-sm hover:bg-slate-50 cursor-pointer"
            onClick={onCancel}
          >
            Avbryt
          </button>
          <button
            className="rounded-lg bg-rose-600 px-3 py-1.5 text-sm text-white hover:bg-rose-700 cursor-pointer"
            onClick={onConfirm}
          >
            Lämna
          </button>
        </div>
      </div>
    </div>
  );
}
