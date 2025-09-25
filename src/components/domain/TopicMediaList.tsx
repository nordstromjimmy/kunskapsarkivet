import Image from "next/image";
import {
  listMediaByDraftKey,
  listMediaByTopicId,
  type MediaItem,
} from "@/server/repos/media";
import { updateMediaAltAction, deleteMediaAction } from "@/actions/media";
import PendingButton from "../ui/PendingButton";

type DraftProps = {
  mode: "draft";
  draftKey: string;
  editable?: boolean;
  slug?: string;
};
type TopicProps = {
  mode: "topic";
  topicId: string;
  ownerSigned: boolean;
  editable?: boolean;
  slug?: string;
};
type Props = DraftProps | TopicProps;

export default async function TopicMediaList(props: Props) {
  let items: MediaItem[] = [];

  if (props.mode === "draft") {
    items = await listMediaByDraftKey(props.draftKey);
  } else {
    items = await listMediaByTopicId(props.topicId, {
      ownerSigned: props.ownerSigned,
    });
  }

  if (!items.length) return null;

  return (
    <div className="mt-4 space-y-6">
      {items
        .filter((m) => m.url)
        .map((m) => (
          <figure key={m.id} className="my-6">
            <div
              className="relative overflow-hidden rounded-lg border"
              style={{ aspectRatio: "3 / 2" }}
            >
              <Image
                src={m.url}
                alt={m.alt ?? ""}
                fill
                sizes="(min-width: 1024px) 800px, (min-width: 640px) 600px, 100vw"
                className="object-contain"
                unoptimized={m.isPrivate}
              />
            </div>

            {props.editable ? (
              <div className="mt-3">
                <form
                  action={updateMediaAltAction}
                  className="min-w-0 space-y-2"
                >
                  <input type="hidden" name="media_id" value={m.id} />
                  {"slug" in props ? (
                    <input type="hidden" name="slug" value={props.slug ?? ""} />
                  ) : null}

                  <label
                    htmlFor={`alt-text-${m.id}`}
                    className="block text-sm text-slate-600"
                  >
                    Bildtext (valfritt)
                  </label>

                  <textarea
                    id={`alt-text-${m.id}`}
                    name="alt"
                    defaultValue={m.alt ?? ""}
                    rows={3}
                    placeholder="Lägg till bildtext"
                    className="w-full resize-y rounded-lg border px-3 py-2 text-sm leading-6
                   focus:outline-none focus:ring-2 focus:ring-slate-400/50"
                  />

                  <div className="mt-2 flex justify-between gap-2">
                    <PendingButton
                      pendingText="Sparar…"
                      className="bg-slate-900 text-white hover:bg-slate-800"
                    >
                      Spara text
                    </PendingButton>

                    <PendingButton
                      pendingText="Raderar…"
                      formAction={deleteMediaAction}
                      className="border border-rose-300 text-rose-700 hover:bg-rose-50"
                    >
                      Radera bild
                    </PendingButton>
                  </div>
                </form>
              </div>
            ) : (
              m.alt && (
                <figcaption className="mt-2 text-xs text-slate-500">
                  {m.alt}
                </figcaption>
              )
            )}
          </figure>
        ))}
    </div>
  );
}
