"use client";
import { ButtonHTMLAttributes } from "react";
import { useFormStatus } from "react-dom";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  pendingText?: string;
};

export default function PendingButton({
  pendingText = "Sparar…",
  className = "",
  children,
  ...rest
}: Props) {
  const { pending } = useFormStatus();

  return (
    <button
      {...rest}
      type={rest.type ?? "submit"}
      aria-busy={pending || undefined}
      disabled={pending || rest.disabled}
      className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm disabled:opacity-50 ${className}`}
    >
      {pending && (
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
      <span>{pending ? pendingText : children}</span>
    </button>
  );
}
