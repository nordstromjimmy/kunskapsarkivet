// app/post/[slug]/delete-image.action.ts
import { supabaseServer } from "@/server/db/supabase-server";

export async function deleteImageAction(formData: FormData) {
  "use server";
  const supabase = await supabaseServer();

  const media_id = String(formData.get("media_id") || "");
  const bucket = String(formData.get("bucket") || "");
  const path = String(formData.get("path") || "");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !media_id || !bucket || !path) return;

  // fetch topic_id & validate ownership via join
  const { data: media, error: mErr } = await supabase
    .from("topic_media")
    .select("id, topic_id, bucket, path, topics!inner(author_id, slug)")
    .eq("id", media_id)
    .maybeSingle();

  if (mErr || !media) return;

  // Delete file from storage
  await supabase.storage.from(bucket).remove([path]);

  // Delete DB row
  await supabase.from("topic_media").delete().eq("id", media_id);

  // Redirect back (optional – you can no-op and let RSC refresh)
  // If you know the slug, you could redirect(`/post/${media.topics.slug}/edit`);
}
