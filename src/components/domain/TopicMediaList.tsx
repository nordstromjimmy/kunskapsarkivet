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
