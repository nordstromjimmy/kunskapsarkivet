import Image from "next/image";
import {
  listMediaByDraftKey,
  listMediaByTopicId,
  type MediaItem,
} from "@/server/repos/media";
import { updateMediaAltAction, deleteMediaAction } from "@/actions/media";
import MediaEditorRow from "./MediaEditorRow";

type DraftProps = {
  mode: "draft";
  draftKey: string;
  editable?: boolean;
  slug?: string;
  kinds?: ReadonlyArray<MediaItem["kind"]>; // ← NEW
};
type TopicProps = {
  mode: "topic";
  topicId: string;
  ownerSigned: boolean;
  editable?: boolean;
  slug?: string;
  kinds?: ReadonlyArray<MediaItem["kind"]>; // ← NEW
};
type Props = DraftProps | TopicProps;

export default async function TopicMediaList(props: Props) {
  const items: MediaItem[] =
    props.mode === "draft"
      ? await listMediaByDraftKey(props.draftKey)
      : await listMediaByTopicId(props.topicId, {
          ownerSigned: props.ownerSigned,
        });

  // NEW: filter by kind if provided
  const filtered = props.kinds?.length
    ? items.filter((m) => props.kinds!.includes(m.kind))
    : items;

  if (!filtered.length) return null;

  return (
    <div className="mt-4 space-y-6">
      {filtered
        .filter((m) => m.url)
        .map((m) => (
          <figure key={m.id} className="my-6">
            {m.kind === "youtube" ? (
              <div
                className="relative overflow-hidden"
                style={{ aspectRatio: "16 / 9" }}
              >
                <iframe
                  src={m.url}
                  title={m.alt || "YouTube-video"}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
            ) : (
              <div
                className="relative overflow-hidden"
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
            )}

            {props.editable ? (
              <MediaEditorRow
                mediaId={m.id}
                defaultAlt={m.alt ?? ""}
                slug={props.mode === "topic" ? (props.slug ?? "") : undefined}
                onSave={updateMediaAltAction}
                onDelete={deleteMediaAction}
              />
            ) : (
              m.alt && (
                <figcaption className="mt-2 text-md text-center text-slate-500">
                  {m.alt}
                </figcaption>
              )
            )}
          </figure>
        ))}
    </div>
  );
}
