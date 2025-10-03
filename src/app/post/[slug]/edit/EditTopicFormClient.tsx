// app/post/[slug]/edit/EditTopicFormClient.tsx
"use client";

import { useRef } from "react";
import { useFormDirty } from "@/components/ui/useFormDirty";
import UnsavedChangesGuard from "@/components/ui/UnsavedChangesGuard";
import { categories, type Category, isCategory } from "@/lib/schema/post";

type TopicFormValues = {
  originalSlug: string; // current slug
  slug: string; // used as placeholder (user may change it)
  title: string;
  excerpt?: string | null;
  category: Category | string; // we’ll coerce to Category in the UI
  body_md: string;
  author_display?: string | null;
  is_published: boolean;
};

type Props = {
  action: (fd: FormData) => void | Promise<void>;
  disabled: boolean;
  topic: TopicFormValues;
  id?: string;
  className?: string;
};

export default function EditTopicFormClient({
  action,
  disabled,
  topic,
  id,
  className,
}: Props) {
  const formRef = useRef<HTMLFormElement | null>(null);
  const { dirty } = useFormDirty(formRef);

  const formId = id ?? "edit-topic-form";
  const formClass = ["mt-6 space-y-4", className].filter(Boolean).join(" ");

  // ensure category is a valid union value (fallback to first)
  const initialCategory = isCategory(topic.category)
    ? (topic.category as Category)
    : (categories[0] as Category);

  return (
    <>
      <UnsavedChangesGuard when={dirty} />

      <form ref={formRef} id={formId} action={action} className={formClass}>
        <input type="hidden" name="original_slug" value={topic.originalSlug} />

        <div>
          <label className="mb-1 block text-sm">Titel</label>
          <input
            name="title"
            defaultValue={topic.title}
            required
            disabled={disabled}
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm">Slug (valfritt)</label>
          <input
            name="slug"
            placeholder={topic.slug}
            disabled={disabled}
            className="w-full rounded-lg border px-3 py-2"
          />
          <p className="mt-1 text-xs text-slate-500">
            Lämna tomt för att behålla samma slug.
          </p>
        </div>

        <div>
          <label className="mb-1 block text-sm">Kategori</label>
          <select
            name="category"
            defaultValue={initialCategory}
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
          <label className="mb-1 block text-sm">Utdrag</label>
          <input
            name="excerpt"
            defaultValue={topic.excerpt ?? ""}
            disabled={disabled}
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm">Författare att visa</label>
          <input
            name="author_display"
            defaultValue={topic.author_display ?? ""}
            disabled={disabled}
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm">Innehåll (Markdown)</label>
          <textarea
            name="body_md"
            defaultValue={topic.body_md ?? ""}
            required
            disabled={disabled}
            className="h-56 w-full rounded-lg border px-3 py-2"
          />
        </div>
        <label className="mt-2 inline-flex items-center gap-2">
          <input
            id="pub"
            type="checkbox"
            name="is_published"
            className="h-4 w-4"
            defaultChecked={!!topic.is_published}
            disabled={disabled}
          />
          <span className="text-sm">Publicera</span>
        </label>
      </form>
    </>
  );
}
