"use client";
import { useRef, useTransition, useState } from "react";

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

export default function AddYoutube(props: Props) {
  const ref = useRef<HTMLFormElement>(null);
  const [pending, start] = useTransition();
  const [url, setUrl] = useState("");
  const [alt, setAlt] = useState("");

  return (
    <form
      ref={ref}
      action={props.action}
      className="space-y-2"
      onSubmit={() => start(() => {})}
    >
      {props.mode === "draft" ? (
        <input type="hidden" name="draft_key" value={props.draftKey} />
      ) : (
        <>
          <input type="hidden" name="topic_id" value={props.topicId} />
          <input type="hidden" name="slug" value={props.slug} />
        </>
      )}

      <div>
        <label className="mb-1 block text-sm">YouTube-länk</label>
        <input
          name="youtube_url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://youtu.be/… eller https://www.youtube.com/watch?v=…"
          className="w-full rounded-lg border px-3 py-2 text-sm"
          disabled={props.disabled || pending}
          required
        />
      </div>

      <div>
        <label className="mb-1 block text-sm">Bildtext (valfritt)</label>
        <input
          name="alt"
          value={alt}
          onChange={(e) => setAlt(e.target.value)}
          placeholder="Beskriv videon"
          className="w-full rounded-lg border px-3 py-2 text-sm"
          disabled={props.disabled || pending}
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={props.disabled || pending}
          className="rounded-md border text-black px-3 py-2 text-xs hover:bg-gray-50 cursor-pointer"
        >
          {pending ? "Lägger till…" : "Lägg till video"}
        </button>
      </div>
    </form>
  );
}
