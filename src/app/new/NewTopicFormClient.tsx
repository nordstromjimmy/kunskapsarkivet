"use client";

import { useRef } from "react";
import { useFormDirty } from "@/components/ui/useFormDirty";
import UnsavedChangesGuard from "@/components/ui/UnsavedChangesGuard";
import { categories } from "@/lib/schema/post";

type Props = {
  action: (fd: FormData) => void | Promise<void>;
  disabled: boolean;
  draftKey: string;
  id?: string; // optional
  className?: string; // optional
  children?: React.ReactNode; // optional
};

export default function NewTopicFormClient({
  action,
  disabled,
  draftKey,
  id,
  className,
  children,
}: Props) {
  const formRef = useRef<HTMLFormElement | null>(null);
  const { dirty } = useFormDirty(formRef);

  const formId = id ?? "create-topic-form";
  const formClass = ["mt-6 space-y-4", className].filter(Boolean).join(" ");

  return (
    <>
      <UnsavedChangesGuard when={dirty} />

      <form ref={formRef} id={formId} action={action} className={formClass}>
        <input type="hidden" name="draft_key" value={draftKey} />

        <div>
          <label className="mb-1 block text-sm">Titel</label>
          <input
            name="title"
            required
            disabled={disabled}
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm">Kategori</label>
          <select
            name="category"
            disabled={disabled}
            className="w-full rounded-lg border px-3 py-2"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm">
            Utdrag (kort sammanfattning)
          </label>
          <input
            name="excerpt"
            disabled={disabled}
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm">Författare att visa</label>
          <input
            name="author_display"
            disabled={disabled}
            className="w-full rounded-lg border px-3 py-2"
            placeholder="t.ex. Karin, Härnösand"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm">Innehåll (Markdown)</label>
          <textarea
            name="body_md"
            required
            disabled={disabled}
            className="h-56 w-full rounded-lg border px-3 py-2"
          />
        </div>
        {children}
        <label className="mt-2 inline-flex items-center gap-2">
          <input
            id="pub"
            type="checkbox"
            name="is_published"
            className="h-4 w-4"
            disabled={disabled}
          />
          <span className="text-sm">Publicera</span>
        </label>
      </form>
    </>
  );
}
