"use client";
import { useRef, useTransition, useState } from "react";
import InfoModal from "@/components/ui/InfoModal";

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

const MAX_CLIENT_BYTES = 25 * 1024 * 1024; // 25MB

export default function AutoUpload(props: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, start] = useTransition();
  const [fileName, setFileName] = useState<string>("");
  const [tooLargeOpen, setTooLargeOpen] = useState(false);

  const disabled = props.disabled ?? false;

  return (
    <>
      <form ref={formRef} action={props.action} className="space-y-3">
        {props.mode === "draft" ? (
          <input type="hidden" name="draft_key" value={props.draftKey} />
        ) : (
          <>
            <input type="hidden" name="topic_id" value={props.topicId} />
            <input type="hidden" name="slug" value={props.slug} />
          </>
        )}

        <div className="grid gap-2 sm:grid-cols-[1fr,2fr]">
          <div>
            <input
              ref={fileRef}
              type="file"
              name="file"
              accept="image/*"
              className="sr-only"
              aria-hidden="true"
              tabIndex={-1}
              onChange={(e) => {
                const f = e.currentTarget.files?.[0];
                if (!f) return;

                if (f.size > MAX_CLIENT_BYTES) {
                  // show modal instead of alert()
                  setTooLargeOpen(true);
                  e.currentTarget.value = "";
                  setFileName("");
                  return;
                }

                setFileName(f.name);
                start(() => formRef.current?.requestSubmit());
              }}
            />

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={disabled || pending}
                className="cursor-pointer rounded-lg border px-3 py-1.5 text-sm hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Välj fil
              </button>

              <span className="max-w-[220px] truncate text-xs text-slate-600">
                {pending ? "Laddar upp…" : fileName || "Ingen fil vald"}
              </span>
            </div>
          </div>
        </div>
      </form>

      {/* One-button modal for oversize files */}
      <InfoModal
        open={tooLargeOpen}
        title="Filen är för stor"
        description={
          <>
            Maximal filstorlek är <strong>25&nbsp;MB</strong>. Välj en mindre
            bild eller komprimera den innan uppladdning.
          </>
        }
        confirmLabel="Okej"
        onClose={() => setTooLargeOpen(false)}
      />
    </>
  );
}
