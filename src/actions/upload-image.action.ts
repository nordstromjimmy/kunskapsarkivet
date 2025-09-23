// app/post/[slug]/upload-image.action.ts
import { supabaseServer } from "@/server/db/supabase-server";
import { redirect } from "next/navigation";
import crypto from "node:crypto";

export async function uploadImageAction(formData: FormData) {
  "use server";

  const file = formData.get("file") as File | null;
  const topicId = String(formData.get("topic_id") || "");
  const slug = String(formData.get("slug") || "");
  if (!file || !topicId) return;

  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    redirect(`/login?next=/post/${encodeURIComponent(slug || topicId)}/edit`);

  if (!file.type.startsWith("image/")) {
    redirect(
      `/post/${encodeURIComponent(slug || topicId)}/edit?err=Endast%20bilder%20st%C3%B6ds`
    );
  }
  if (file.size > 8 * 1024 * 1024) {
    redirect(
      `/post/${encodeURIComponent(slug || topicId)}/edit?err=Max%208%20MB`
    );
  }

  // 👇 Check topic to decide bucket
  const { data: topic, error: tErr } = await supabase
    .from("topics")
    .select("id, is_published")
    .eq("id", topicId)
    .maybeSingle();
  if (tErr || !topic) {
    redirect(
      `/post/${encodeURIComponent(slug || topicId)}/edit?err=Kunde%20inte%20hitta%20%C3%A4mnet`
    );
  }

  const bucket = topic.is_published
    ? "topic-media-public"
    : "topic-media-private";

  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const keyPrefix = topic.is_published ? "public" : "private";
  const key = `${keyPrefix}/${topicId}/${crypto.randomUUID()}.${ext}`;

  const arrayBuf = await file.arrayBuffer();
  const { error: upErr } = await supabase.storage
    .from(bucket)
    .upload(key, Buffer.from(arrayBuf), {
      contentType: file.type,
      upsert: false,
    });
  if (upErr) {
    redirect(
      `/post/${encodeURIComponent(slug || topicId)}/edit?err=${encodeURIComponent(upErr.message)}`
    );
  }

  const { error: dbErr } = await supabase.from("topic_media").insert({
    topic_id: topicId,
    kind: "image",
    bucket,
    path: key,
    alt: String(formData.get("alt") || ""),
  });
  if (dbErr) {
    redirect(
      `/post/${encodeURIComponent(slug || topicId)}/edit?err=${encodeURIComponent(dbErr.message)}`
    );
  }

  redirect(`/post/${encodeURIComponent(slug || topicId)}/edit`);
}
