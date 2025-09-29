"use server";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/server/db/supabase-server";
import { categories, slugify, toCategory } from "@/lib/schema/post";
import { claimDraftMedia, promoteDraftMediaForTopic } from "./media";
import { revalidatePath } from "next/cache";

/**
 * Creates a topic as the logged-in user, computes a unique slug, then redirects.
 * Keeps your old behavior: 200/500 char limits, checkbox publish flag, Swedish errors.
 */
export async function createTopicFromFormAction(formData: FormData) {
  "use server";
  const supabase = await supabaseServer(); // ← if your helper is sync, drop the await

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/new");
  }

  const title = String(formData.get("title") || "")
    .slice(0, 200)
    .trim();
  const excerpt = String(formData.get("excerpt") || "")
    .slice(0, 500)
    .trim();
  const rawCategory = String(formData.get("category") || categories[0]).trim();
  const body_md = String(formData.get("body_md") || "").trim();
  const author_display = String(formData.get("author_display") || "").trim();
  const is_published = formData.get("is_published") === "on";
  const draft_key = String(formData.get("draft_key") || "").trim();

  // minimal validation (no zod)
  if (!title || !body_md) {
    redirect(`/new?error=${encodeURIComponent("Titel och innehåll krävs")}`);
  }

  const category = toCategory(rawCategory);
  if (!category) {
    redirect(`/new?error=${encodeURIComponent("Ogiltig kategori")}`);
  }

  // Compute a unique slug (base + -2, -3, ...)
  const baseSlug = slugify(title);
  const { data: siblings, error: siblingsErr } = await supabase
    .from("topics")
    .select("slug")
    .like("slug", `${baseSlug}%`);

  if (siblingsErr) {
    redirect(`/new?error=${encodeURIComponent(siblingsErr.message)}`);
  }

  const taken = new Set((siblings ?? []).map((s: { slug: string }) => s.slug));
  let slug = baseSlug;
  if (taken.has(baseSlug)) {
    let i = 2;
    while (taken.has(`${baseSlug}-${i}`)) i++;
    slug = `${baseSlug}-${i}`;
  }

  const { data: topic, error: insertErr } = await supabase
    .from("topics")
    .insert({
      slug,
      title,
      excerpt,
      category,
      body_md,
      author_display: author_display || null,
      is_published,
      author_id: user.id,
    })
    .select("id, slug")
    .single();

  if (insertErr) {
    redirect(
      `/new?error=${encodeURIComponent(insertErr.message)}${draft_key ? `&draft=${draft_key}` : ""}`
    );
  }

  if (is_published && draft_key) {
    try {
      await claimDraftMedia(draft_key, topic!.id);
    } catch (e) {
      console.error("claimDraftMedia:error", e);
    }
  }

  if (draft_key) {
    try {
      await claimDraftMedia(draft_key, topic!.id); // moves + clears draft_key + updates path
    } catch (e) {
      console.error("claimDraftMedia:error", e);
      // don't block creation on media issues
    }
  }
  revalidatePath(`/post/${topic!.slug}`);
  redirect(`/post/${slug}`);
}

export async function updateTopicFromFormAction(formData: FormData) {
  const originalSlug = String(formData.get("original_slug") || "");
  const title = String(formData.get("title") || "")
    .slice(0, 200)
    .trim();
  const excerpt = String(formData.get("excerpt") || "")
    .slice(0, 500)
    .trim();
  const rawCategory = String(formData.get("category") || "").trim();
  const body_md = String(formData.get("body_md") || "").trim();
  const author_display = String(formData.get("author_display") || "").trim();
  const is_published = formData.get("is_published") === "on";
  const updateSlug = String(formData.get("slug") || "").trim();

  const sb = await supabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) redirect(`/login?next=/post/${originalSlug}/edit`);

  const category = toCategory(rawCategory);
  if (!category) {
    redirect(
      `/post/${originalSlug}/edit?err=${encodeURIComponent("Ogiltig kategori")}`
    );
  }

  // Load current topic to get id + previous publish state
  const { data: current, error: curErr } = await sb
    .from("topics")
    .select("id, is_published")
    .eq("slug", originalSlug)
    .single();
  if (curErr || !current) {
    redirect(
      `/post/${originalSlug}/edit?err=${encodeURIComponent(curErr?.message || "Saknas")}`
    );
  }

  // Compute final slug if changed
  let finalSlug = originalSlug;
  if (updateSlug && updateSlug !== originalSlug) {
    const base = slugify(updateSlug);
    const { data: siblings, error: siblingsErr } = await sb
      .from("topics")
      .select("slug")
      .like("slug", `${base}%`);

    if (siblingsErr) {
      redirect(
        `/post/${originalSlug}/edit?err=${encodeURIComponent(siblingsErr.message)}`
      );
    }

    const taken = new Set(
      (siblings ?? []).map((s: { slug: string }) => s.slug)
    );
    finalSlug = base;
    if (taken.has(base)) {
      let i = 2;
      while (taken.has(`${base}-${i}`)) i++;
      finalSlug = `${base}-${i}`;
    }
  }

  // Update
  const { error } = await sb
    .from("topics")
    .update({
      slug: finalSlug,
      title,
      excerpt: excerpt || null,
      category,
      body_md,
      author_display: author_display || null,
      is_published,
      updated_at: new Date().toISOString(),
    })
    .eq("id", current.id); // use id for stability
  if (error) {
    // (same retry branch as you had if you want)
    redirect(
      `/post/${originalSlug}/edit?err=${encodeURIComponent(error.message)}`
    );
  }

  // If we just flipped from draft → published, move any remaining draft media
  if (!current.is_published && is_published) {
    try {
      await promoteDraftMediaForTopic(current.id);
    } catch (e) {
      console.error("promoteDraftMediaForTopic:error", e);
      // do not block publish on media move
    }
  }

  // Revalidate both old and new slug pages
  revalidatePath(`/post/${originalSlug}`);
  revalidatePath(`/post/${finalSlug}`);
  revalidatePath(`/post/${finalSlug}/edit`);

  redirect(`/post/${finalSlug}`);
}

export async function deleteTopicBySlugAction(formData: FormData) {
  "use server";
  const slug = String(formData.get("slug") ?? "");
  if (!slug) redirect("/");

  const sb = await supabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) redirect(`/login?next=/post/${slug}`);

  // 1) Load topic (id + owner)
  const { data: topic, error: tErr } = await sb
    .from("topics")
    .select("id, author_id")
    .eq("slug", slug)
    .single();

  if (tErr || !topic) {
    redirect(
      `/post/${slug}?error=${encodeURIComponent(tErr?.message ?? "Okänt fel")}`
    );
  }
  if (topic.author_id !== user.id) redirect(`/post/${slug}`);

  // 2) Fetch media rows BEFORE deleting anything
  const { data: media, error: mErr } = await sb
    .from("topic_media")
    .select("bucket, path")
    .eq("topic_id", topic.id);

  if (mErr) {
    redirect(`/post/${slug}?error=${encodeURIComponent(mErr.message)}`);
  }

  // 3) Delete storage objects (grouped by bucket)
  const byBucket = new Map<string, string[]>();
  for (const row of media ?? []) {
    if (!byBucket.has(row.bucket)) byBucket.set(row.bucket, []);
    byBucket.get(row.bucket)!.push(row.path);
  }
  for (const [bucket, paths] of byBucket) {
    if (paths.length) {
      const { error } = await sb.storage.from(bucket).remove(paths);
      if (error) {
        // don’t block the rest, but log so you can investigate
        console.error("storage.remove failed", bucket, error);
      }
    }
  }

  // 4) Delete rows (media then topic). If you have FK ON DELETE CASCADE you can skip the first line.
  await sb.from("topic_media").delete().eq("topic_id", topic.id);
  const { error: delTopicErr } = await sb
    .from("topics")
    .delete()
    .eq("id", topic.id);
  if (delTopicErr) {
    redirect(`/post/${slug}?error=${encodeURIComponent(delTopicErr.message)}`);
  }

  // 5) Revalidate + redirect
  revalidatePath("/profile");
  redirect("/profile");
}
