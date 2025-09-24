"use client";

import { useRef, useTransition, useState } from "react";

/** What <form action={...}> accepts */
export type FormAction = (formData: FormData) => void | Promise<void>;

type DraftProps = {
  mode: "draft";
  draftKey: string;
  disabled?: boolean;
  action: FormAction;
};

type TopicProps = {
  mode: "topic";
  topicId: string;
  slug: string;
  disabled?: boolean;
  action: FormAction;
};

type Props = DraftProps | TopicProps;

export default function AutoUpload(props: Props) {
  const ref = useRef<HTMLFormElement>(null);
  const [pending, start] = useTransition();
  const [alt, setAlt] = useState("");

  const disabled = props.disabled ?? false;

  return (
    <form ref={ref} action={props.action} className="space-y-3">
      {props.mode === "draft" ? (
        <input type="hidden" name="draft_key" value={props.draftKey} />
      ) : (
        <>
          <input type="hidden" name="topic_id" value={props.topicId} />
          <input type="hidden" name="slug" value={props.slug} />
        </>
      )}

      <div className="grid gap-2 sm:grid-cols-[1fr,2fr]">
        {/*         <div>
          <label className="mb-1 block text-sm">Alt-text (valfritt)</label>
          <input
            name="alt"
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            placeholder="Beskriv bilden"
            className="w-full rounded-lg border px-3 py-2 text-sm"
            disabled={disabled || pending}
          />
        </div> */}

        <div>
          <label className="mb-1 block text-sm">Välj bild</label>
          <input
            type="file"
            name="file"
            accept="image/*"
            disabled={disabled || pending}
            onChange={(e) => {
              const f = e.currentTarget.files?.[0];
              if (!f) return;
              if (f.size > 12 * 1024 * 1024) {
                alert("Filen är för stor (max 12MB).");
                e.currentTarget.value = "";
                return;
              }
              start(() => ref.current?.requestSubmit());
            }}
          />
          {pending && (
            <p className="mt-1 text-xs text-slate-500">Laddar upp…</p>
          )}
        </div>
      </div>
    </form>
  );
}
