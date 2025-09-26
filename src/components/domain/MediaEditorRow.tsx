"use client";

import { useState, useTransition } from "react";

type FormAction = (formData: FormData) => Promise<void> | void;

export default function MediaEditorRow({
  mediaId,
  defaultAlt,
  slug, // pass on topic pages; empty on /new
  onSave, // server action: updateMediaAltAction
  onDelete, // server action: deleteMediaAction
}: {
  mediaId: string;
  defaultAlt: string;
  slug?: string;
  onSave: FormAction;
  onDelete: FormAction;
}) {
  const [alt, setAlt] = useState(defaultAlt ?? "");
  const [saving, startSave] = useTransition();
  const [deleting, startDelete] = useTransition();

  const save = () => {
    const fd = new FormData();
    fd.set("media_id", mediaId);
    fd.set("alt", alt);
    if (slug) fd.set("slug", slug);
    startSave(async () => {
      await onSave(fd);
      // optimistic state already matches `alt`; server revalidation will refresh too
    });
  };

  const remove = () => {
    const fd = new FormData();
    fd.set("media_id", mediaId);
    if (slug) fd.set("slug", slug);
    startDelete(async () => {
      await onDelete(fd);
    });
  };

  return (
    <div className="mt-3 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
      <div className="min-w-0 space-y-2">
        <label
          htmlFor={`alt-${mediaId}`}
          className="block text-sm text-slate-600"
        >
          Bildtext (valfritt)
        </label>
        <textarea
          id={`alt-${mediaId}`}
          value={alt}
          onChange={(e) => setAlt(e.target.value)}
          rows={3}
          placeholder="Lägg till bildtext"
          className="w-full resize-y rounded-lg border px-3 py-2 text-sm leading-6 focus:outline-none focus:ring-2 focus:ring-slate-400/50"
          disabled={deleting}
        />
        <div className="mb-2">
          <div className="flex justify-between gap-2">
            <button
              type="button"
              onClick={save}
              disabled={saving || deleting}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-1.5 text-sm text-white hover:bg-slate-800 disabled:opacity-50 cursor-pointer"
            >
              {saving && <Spinner />}
              {saving ? "Sparar…" : "Spara text"}
            </button>
            <button
              type="button"
              onClick={remove}
              disabled={saving || deleting}
              className="inline-flex items-center gap-2 rounded-lg border border-rose-300 px-3 py-1.5 text-sm text-rose-700 hover:bg-rose-50 disabled:opacity-50 cursor-pointer"
            >
              {deleting && <Spinner />}
              {deleting ? "Raderar…" : "Radera bild"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Spinner() {
  return (
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
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" />
    </svg>
  );
}
