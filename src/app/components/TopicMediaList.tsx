import { createClientRSC } from "@/lib/supabase/rsc";
import Image from "next/image";
import { deleteImageAction } from "../post/[slug]/delete-image.action";

export async function TopicMediaList({ topicId }: { topicId: string }) {
  const supabase = await createClientRSC();

  const { data: media } = await supabase
    .from("topic_media")
    .select("id, bucket, path, alt, width, height, created_at")
    .eq("topic_id", topicId)
    .order("created_at", { ascending: false });

  if (!media?.length) {
    return <p className="text-sm text-slate-600">Inga bilder ännu.</p>;
  }

  // Build URLs (public vs signed)
  const items = await Promise.all(
    media.map(async (m) => {
      if (m.bucket === "topic-media-public") {
        const { data } = supabase.storage.from(m.bucket).getPublicUrl(m.path);
        return { ...m, url: data.publicUrl };
      } else {
        // signed URL (60s) for private images
        const { data } = await supabase.storage
          .from(m.bucket)
          .createSignedUrl(m.path, 60);
        return { ...m, url: data?.signedUrl ?? "" };
      }
    })
  );

  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {items.map((m) => (
        <li key={m.id} className="rounded-lg border p-3">
          {m.url ? (
            <Image
              src={m.url}
              alt={m.alt || ""}
              width={600}
              height={400}
              className="h-auto w-full rounded-md object-cover"
            />
          ) : (
            <div className="aspect-video rounded-md bg-slate-100" />
          )}
          {m.alt && <p className="mt-2 text-xs text-slate-500">{m.alt}</p>}

          <form action={deleteImageAction} className="mt-3">
            <input type="hidden" name="media_id" value={m.id} />
            <input type="hidden" name="bucket" value={m.bucket} />
            <input type="hidden" name="path" value={m.path} />
            <button className="rounded-md bg-rose-600 px-3 py-1.5 text-xs text-white hover:bg-rose-700">
              Ta bort
            </button>
          </form>
        </li>
      ))}
    </ul>
  );
}
