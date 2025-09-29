import { supabaseServer } from "@/server/db/supabase-server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import sharp from "sharp";

//const MAX_UPLOAD_BYTES = 25 * 1024 * 1024; // 25MB client+server guard
const MAX_W = 1600;
const MAX_H = 1600;
const OUTPUT_QUALITY = 82; // WebP quality

export async function uploadTopicImageAction(
  formData: FormData
): Promise<void> {
  "use server";
  const sb = await supabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) {
    redirect("/login?next=/new");
  }

  const file = formData.get("file");
  const topicId = (formData.get("topic_id") as string) || "";
  const draftKey = (formData.get("draft_key") as string) || "";
  const slug = (formData.get("slug") as string) || "";
  const alt = ((formData.get("alt") as string) || "").slice(0, 200).trim();

  // basic guards (no throws; action must return void)
  if (!(file instanceof File)) return;
  if (!topicId && !draftKey) return;
  // Set max file size limit
  //if (file.size > MAX_UPLOAD_BYTES) return;

  // allowlist
  const okTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/avif",
    "image/gif",
  ];
  if (!okTypes.includes(file.type)) return;

  // read & process -> webp
  const buf = Buffer.from(await file.arrayBuffer());

  let pipeline = sharp(buf).rotate(); // auto-orient
  const meta = await pipeline.metadata();
  pipeline = pipeline.resize({
    width: MAX_W,
    height: MAX_H,
    fit: "inside",
    withoutEnlargement: true,
  });

  const webp = await pipeline
    .webp({ quality: OUTPUT_QUALITY, effort: 4 })
    .toBuffer();
  const outMeta = await sharp(webp).metadata();

  const width = outMeta.width ?? meta.width ?? null;
  const height = outMeta.height ?? meta.height ?? null;
  const bytes = webp.length;
  const mime = "image/webp";

  // storage target
  const bucket = "topic-media-public"; // adjust if you want private-by-default
  const filenameSafe = (file.name || "image")
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-");
  const stamp = Date.now();
  const path = topicId
    ? `topics/${topicId}/${stamp}-${filenameSafe}.webp`
    : `drafts/${user.id}/${draftKey}/${stamp}-${filenameSafe}.webp`;

  // upload
  const { error: upErr } = await sb.storage.from(bucket).upload(path, webp, {
    contentType: mime,
    upsert: false,
  });
  if (upErr) {
    console.error("upload:error", upErr);
    return;
  }

  // DB row (topic_id OR draft_key)
  const { error: insErr } = await sb.from("topic_media").insert({
    topic_id: topicId || null,
    draft_key: topicId ? null : draftKey,
    bucket,
    path,
    alt: alt || null,
    width,
    height,
    bytes,
    mime_type: mime,
    created_by: user.id,
    kind: "image",
  });
  if (insErr) {
    console.error("insert:error", insErr);
    return;
  }

  if (draftKey) {
    revalidatePath("/new");
  }
  // revalidate the post page when editing (slug present)
  if (slug) {
    revalidatePath(`/post/${slug}`);
    revalidatePath(`/post/${slug}/edit`);
  }
  console.log("upload:ok", { path });
}

export async function updateMediaAltAction(formData: FormData): Promise<void> {
  "use server";
  const id = String(formData.get("media_id") ?? "");
  const alt = String(formData.get("alt") ?? "")
    .slice(0, 200)
    .trim();
  const slug = (formData.get("slug") as string) || "";
  if (!id) return;
  const sb = await supabaseServer();
  const { error } = await sb
    .from("topic_media")
    .update({ alt: alt || null })
    .eq("id", id);
  if (error) throw new Error(error.message);

  if (slug) {
    revalidatePath(`/post/${slug}`);
    revalidatePath(`/post/${slug}/edit`);
  } else {
    revalidatePath("/new");
  }
}

export async function deleteMediaAction(formData: FormData): Promise<void> {
  "use server";
  const id = String(formData.get("media_id") ?? "");
  const slug = (formData.get("slug") as string) || ""; // optional; pass from edit page
  if (!id) return;

  const sb = await supabaseServer();

  // 1) Read the media row first (RLS ensures ownership)
  const { data: m, error: readErr } = await sb
    .from("topic_media")
    .select("id, bucket, path, topic_id, draft_key")
    .eq("id", id)
    .maybeSingle();
  if (readErr || !m) return;

  // 2) Remove from storage (first!)
  const { error: rmErr } = await sb.storage.from(m.bucket).remove([m.path]);
  if (rmErr) {
    console.error("storage.remove error", rmErr);
    return; // don’t remove DB row if object still exists
  }

  // 3) Remove DB row
  const { error: delErr } = await sb.from("topic_media").delete().eq("id", id);
  if (delErr) {
    console.error("topic_media delete error", delErr);
    return;
  }

  // 4) Revalidate UI
  if (m.draft_key) revalidatePath("/new");
  if (slug) {
    revalidatePath(`/post/${slug}`);
    revalidatePath(`/post/${slug}/edit`);
  }
}

export async function claimDraftMedia(draftKey: string, topicId: string) {
  if (!draftKey) return;

  const sb = await supabaseServer();

  // Find staged rows
  const { data: rows, error } = await sb
    .from("topic_media")
    .select("id, bucket, path")
    .eq("draft_key", draftKey);

  if (error) throw error;
  if (!rows?.length) return;

  for (const m of rows) {
    const filename = m.path.split("/").pop()!;
    const destPath = `topics/${topicId}/${filename}`;

    // Try move (same bucket). If move is unsupported, fallback to copy+remove.
    let moved = false;
    const { error: moveErr } = await sb.storage
      .from(m.bucket)
      .move(m.path, destPath);
    if (!moveErr) moved = true;

    if (!moved) {
      const { error: copyErr } = await sb.storage
        .from(m.bucket)
        .copy(m.path, destPath);
      if (!copyErr) {
        await sb.storage.from(m.bucket).remove([m.path]);
        moved = true;
      }
    }

    if (!moved) continue; // keep row pointing at drafts if move failed

    await sb
      .from("topic_media")
      .update({ topic_id: topicId, draft_key: null, path: destPath })
      .eq("id", m.id);
  }
}

/** Move all draft media for a topic into topics/{topicId}/... and clear draft_key. */
export async function promoteDraftMediaForTopic(topicId: string) {
  const sb = await supabaseServer();

  // Find rows still tied to drafts for this topic
  const { data: rows, error } = await sb
    .from("topic_media")
    .select("id, bucket, path")
    .eq("topic_id", topicId)
    .not("draft_key", "is", null); // i.e., draft_key IS NOT NULL

  if (error || !rows?.length) return;

  for (const m of rows) {
    const filename = m.path.split("/").pop()!;
    const destPath = `topics/${topicId}/${filename}`;

    // Move within same bucket (fallback: copy+remove)
    let moved = false;
    const { error: moveErr } = await sb.storage
      .from(m.bucket)
      .move(m.path, destPath);
    if (!moveErr) moved = true;

    if (!moved) {
      const { error: copyErr } = await sb.storage
        .from(m.bucket)
        .copy(m.path, destPath);
      if (!copyErr) {
        await sb.storage.from(m.bucket).remove([m.path]);
        moved = true;
      }
    }

    if (!moved) continue;

    await sb
      .from("topic_media")
      .update({ draft_key: null, path: destPath })
      .eq("id", m.id);
  }
}
