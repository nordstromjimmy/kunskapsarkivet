import "server-only";
import { supabaseServer } from "@/server/db/supabase-server";

export type MediaItem = {
  id: string;
  kind: "image" | "youtube";
  url: string;
  alt: string | null;
  isPrivate: boolean;
  width: number | null;
  height: number | null;
  created_at: string;
};

function youtubeEmbedUrlFromPath(path: string) {
  // path stored as 'youtube/<id>'
  const id = path.split("/")[1] || "";
  return id ? `https://www.youtube.com/embed/${id}?rel=0` : "";
}

async function mapRowToItem(
  sb: ReturnType<typeof supabaseServer> extends Promise<infer C> ? C : never,
  row: {
    id: string;
    kind: string;
    bucket: string;
    path: string;
    alt: string | null;
    width: number | null;
    height: number | null;
    created_at: string;
  },
  opts?: { ownerSigned?: boolean }
): Promise<MediaItem | null> {
  if (row.kind === "youtube") {
    return {
      id: row.id,
      kind: "youtube",
      url: youtubeEmbedUrlFromPath(row.path),
      alt: row.alt,
      isPrivate: false,
      width: row.width,
      height: row.height,
      created_at: row.created_at,
    };
  }

  // images: public or private
  if (row.bucket === "topic-media-public") {
    const { data } = sb.storage.from(row.bucket).getPublicUrl(row.path);
    return {
      id: row.id,
      kind: "image",
      url: data.publicUrl,
      alt: row.alt,
      isPrivate: false,
      width: row.width,
      height: row.height,
      created_at: row.created_at,
    };
  }

  // private bucket → signed URL only for owner
  if (opts?.ownerSigned) {
    const { data } = await sb.storage
      .from(row.bucket)
      .createSignedUrl(row.path, 60);
    return {
      id: row.id,
      kind: "image",
      url: data?.signedUrl ?? "",
      alt: row.alt,
      isPrivate: true,
      width: row.width,
      height: row.height,
      created_at: row.created_at,
    };
  }

  // not owner: no URL
  return {
    id: row.id,
    kind: "image",
    url: "",
    alt: row.alt,
    isPrivate: true,
    width: row.width,
    height: row.height,
    created_at: row.created_at,
  };
}

export async function listMediaByDraftKey(
  draftKey: string
): Promise<MediaItem[]> {
  const sb = await supabaseServer();
  const { data } = await sb
    .from("topic_media")
    .select("id, kind, bucket, path, alt, width, height, created_at")
    .eq("draft_key", draftKey)
    .order("created_at", { ascending: true });

  const rows = data ?? [];
  const out: MediaItem[] = [];
  for (const r of rows) {
    const m = await mapRowToItem(sb, r);
    if (m && m.url) out.push(m);
  }
  return out;
}

export async function listMediaByTopicId(
  topicId: string,
  opts: { ownerSigned: boolean }
): Promise<MediaItem[]> {
  const sb = await supabaseServer();
  const { data } = await sb
    .from("topic_media")
    .select("id, kind, bucket, path, alt, width, height, created_at")
    .eq("topic_id", topicId)
    .order("created_at", { ascending: true });

  const rows = data ?? [];
  const out: MediaItem[] = [];
  for (const r of rows) {
    const m = await mapRowToItem(sb, r, { ownerSigned: opts.ownerSigned });
    if (m && m.url) out.push(m);
  }
  return out;
}
