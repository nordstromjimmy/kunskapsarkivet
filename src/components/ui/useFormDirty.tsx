// components/ui/useFormDirty.tsx
"use client";

import { useEffect, useRef, useState } from "react";

export function useFormDirty(formRef: React.RefObject<HTMLFormElement | null>) {
  const [dirty, setDirty] = useState(false);
  const submitting = useRef(false);

  useEffect(() => {
    const form = formRef.current;
    if (!form) return;

    const onInput = () => {
      if (!submitting.current) setDirty(true);
    };
    const onSubmit = () => {
      submitting.current = true;
      setDirty(false);
    };

    form.addEventListener("input", onInput);
    form.addEventListener("change", onInput);
    form.addEventListener("submit", onSubmit);

    return () => {
      form.removeEventListener("input", onInput);
      form.removeEventListener("change", onInput);
      form.removeEventListener("submit", onSubmit);
    };
  }, [formRef]);

  return { dirty, setDirty, submitting };
}
