"use client";

import { useState } from "react";

type Props = {
  formId: string;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
  pendingText?: string;
};

export default function FormSubmitButton({
  formId,
  disabled,
  className = "",
  children,
  pendingText = "Sparar…",
}: Props) {
  const [submitting, setSubmitting] = useState(false);

  const handleClick = () => {
    const form = document.getElementById(formId) as HTMLFormElement | null;
    if (!form) return;

    // Don’t show spinner if the form is invalid; show native messages instead
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    setSubmitting(true); // show spinner immediately on first click
    form.requestSubmit(); // submit via the real form (server action handles redirect/revalidate)
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || submitting}
      className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm disabled:opacity-50 ${className}`}
    >
      {submitting && (
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4 animate-spin"
          fill="none"
          aria-hidden
        >
          <circle
            cx="12"
            cy="12"
            r="9"
            stroke="currentColor"
            strokeOpacity="0.2"
            strokeWidth="3"
          />
          <path
            d="M21 12a9 9 0 0 0-9-9"
            stroke="currentColor"
            strokeWidth="3"
          />
        </svg>
      )}
      <span>{submitting ? pendingText : children}</span>
    </button>
  );
}
