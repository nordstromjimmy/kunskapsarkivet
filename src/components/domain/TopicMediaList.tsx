import Image from "next/image";
import {
  listMediaByDraftKey,
  listMediaByTopicId,
  type MediaItem,
} from "@/server/repos/media";
import { updateMediaAltAction, deleteMediaAction } from "@/actions/media";

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
              <div className="mt-2 flex items-center gap-2">
                <form
                  action={updateMediaAltAction}
                  className="flex w-full items-center gap-2"
                >
                  <input type="hidden" name="media_id" value={m.id} />
                  <input
                    name="alt"
                    defaultValue={m.alt ?? ""}
                    placeholder="Beskriv bilden"
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                  />
                  <button
                    className="rounded-lg border px-3 py-1.5 text-sm cursor-pointer"
                    type="submit"
                  >
                    Spara
                  </button>
                </form>

                <form action={deleteMediaAction}>
                  <input type="hidden" name="media_id" value={m.id} />
                  {props.slug ? (
                    <input type="hidden" name="slug" value={props.slug} />
                  ) : null}
                  <button
                    className="text-xs text-rose-600 hover:underline"
                    type="submit"
                  >
                    Ta bort
                  </button>
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
