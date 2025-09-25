// src/components/ui/PendingButton.tsx
"use client";

import { ButtonHTMLAttributes, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";

export type FormAction = (formData: FormData) => void | Promise<void>;

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  pendingText?: string;
  formAction?: string | FormAction; // allow per-button server action override
};

export default function PendingButton({
  pendingText = "Skickar…",
  className = "",
  children,
  onClick,
  onPointerDown,
  ...rest
}: Props) {
  const { pending } = useFormStatus();
  const [clicked, setClicked] = useState(false);

  useEffect(() => {
    if (!pending) setClicked(false);
  }, [pending]);

  const showPending = pending && clicked;

  return (
    <button
      {...rest}
      type={rest.type ?? "submit"}
      aria-busy={showPending || undefined}
      disabled={pending || rest.disabled}
      className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm disabled:opacity-50 cursor-pointer ${className}`}
      onPointerDown={(e) => {
        setClicked(true);
        onPointerDown?.(e);
      }}
      onClick={(e) => {
        setClicked(true);
        onClick?.(e);
      }}
    >
      {showPending && (
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
      <span>{showPending ? pendingText : children}</span>
    </button>
  );
}
