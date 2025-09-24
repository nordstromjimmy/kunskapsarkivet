import "server-only";
import { supabaseServer } from "@/server/db/supabase-server";

type MediaRow = {
  id: string;
  bucket: string;
  path: string;
  alt: string | null;
  width: number | null;
  height: number | null;
  created_at: string;
  kind: string;
};

export type MediaItem = MediaRow & {
  url: string;
  isPrivate: boolean;
};

const SELECT = "id, bucket, path, alt, width, height, created_at, kind";

/** Build a display URL (public or signed). */
async function resolveUrl(
  m: MediaRow,
  { ownerSigned }: { ownerSigned: boolean }
) {
  const sb = await supabaseServer();
  const isPrivate = m.bucket !== "topic-media-public";
  if (!isPrivate) {
    const { data } = sb.storage.from(m.bucket).getPublicUrl(m.path);
    return { url: data.publicUrl as string, isPrivate: false };
  }
  if (!ownerSigned) return { url: "", isPrivate: true }; // hide private for non-owner
  const { data } = await sb.storage.from(m.bucket).createSignedUrl(m.path, 60);
  return { url: data?.signedUrl ?? "", isPrivate: true };
}

export async function listMediaByDraftKey(
  draftKey: string
): Promise<MediaItem[]> {
  const sb = await supabaseServer();
  const { data, error } = await sb
    .from("topic_media")
    .select(SELECT)
    .eq("draft_key", draftKey)
    .order("created_at", { ascending: true });
  if (error) throw error;
  const rows = (data ?? []) as MediaRow[];
  const resolved = await Promise.all(
    rows.map(async (m) => {
      const r = await resolveUrl(m, { ownerSigned: true }); // draft is owned
      return { ...m, ...r };
    })
  );
  return resolved;
}

export async function listMediaByTopicId(
  topicId: string,
  opts: { ownerSigned: boolean }
): Promise<MediaItem[]> {
  const sb = await supabaseServer();
  const { data, error } = await sb
    .from("topic_media")
    .select(SELECT)
    .eq("topic_id", topicId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  const rows = (data ?? []) as MediaRow[];
  const resolved = await Promise.all(
    rows.map(async (m) => {
      const r = await resolveUrl(m, { ownerSigned: opts.ownerSigned });
      return { ...m, ...r };
    })
  );
  return resolved;
}
