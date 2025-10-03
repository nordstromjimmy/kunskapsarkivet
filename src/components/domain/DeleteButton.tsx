"use client";
import { useRef, useState, useTransition } from "react";
import ConfirmModal from "@/components/ui/ConfirmModal";

type Props = {
  children?: React.ReactNode;
  className?: string;
  formId?: string; // optional: force-submit a specific form by id
  confirmTitle?: string;
  confirmText?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
};

export default function DeleteButton({
  children = "Radera",
  className = "",
  formId,
  confirmTitle = "Radera inlägg?",
  confirmText = "Detta tar bort inlägget och alla dess bilder. Åtgärden kan inte ångras.",
  confirmLabel = "Radera",
  cancelLabel = "Avbryt",
}: Props) {
  const [open, setOpen] = useState(false);
  const [submitting, startTransition] = useTransition();
  const btnRef = useRef<HTMLButtonElement | null>(null);

  const onConfirm = () => {
    // prevent double clicks
    if (submitting) return;

    startTransition(() => {
      // Find the target form
      const form: HTMLFormElement | null = formId
        ? (document.getElementById(formId) as HTMLFormElement | null)
        : (btnRef.current?.closest("form") as HTMLFormElement | null);

      setOpen(false);
      form?.requestSubmit();
    });
  };

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen(true)}
        disabled={submitting}
        className={[
          "rounded-lg border border-rose-300 px-3 py-1.5 text-sm text-rose-700 hover:bg-rose-50 cursor-pointer",
          submitting ? "opacity-60 cursor-not-allowed" : "",
          className,
        ].join(" ")}
      >
        {children}
      </button>

      <ConfirmModal
        open={open}
        title={confirmTitle}
        description={confirmText}
        confirmLabel={confirmLabel}
        cancelLabel={cancelLabel}
        tone="danger"
        onCancel={() => setOpen(false)}
        onConfirm={onConfirm}
      />
    </>
  );
}
