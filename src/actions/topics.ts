"use server";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/server/db/supabase-server";
import { categories, slugify, toCategory } from "@/lib/schema/post";

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
  const draft_key = String(formData.get("draft_key") || "");

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

  if (draft_key) {
    const { error: claimErr } = await supabase
      .from("topic_media")
      .update({ topic_id: topic!.id, draft_key: null })
      .eq("draft_key", draft_key)
      .eq("created_by", user.id); // ensure only the uploader’s rows are claimed
    if (claimErr) {
      // don’t block publishing if claim fails, but do log so you can see it
      console.error("claim:error", claimErr);
    }
  }

  /*   if (insertErr) {
    if (insertErr.code === "23505") {
      slug = `${baseSlug}-${Date.now()}`;
      const { error: retryErr } = await supabase.from("topics").insert({
        slug,
        title,
        excerpt,
        category,
        body_md,
        author_display: author_display || null,
        is_published,
        author_id: user.id,
      });
      if (retryErr) {
        redirect(`/new?error=${encodeURIComponent(retryErr.message)}`);
      }
    } else {
      redirect(`/new?error=${encodeURIComponent(insertErr.message)}`);
    }
  } */

  redirect(`/post/${slug}`); // adjust to /topic/ if you change routing
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

  if (!user) {
    redirect(`/login?next=/post/${originalSlug}/edit`);
  }

  // Validate category (typed union)
  const category = toCategory(rawCategory);
  if (!category) {
    redirect(
      `/post/${originalSlug}/edit?err=${encodeURIComponent("Ogiltig kategori")}`
    );
  }

  // Compute final slug only when changed by user
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

  // Update (RLS should enforce owner, but we still try-catch and surface message)
  const { error } = await sb
    .from("topics")
    .update({
      slug: finalSlug,
      title,
      excerpt: excerpt || null,
      category, // union ensures correct value
      body_md,
      author_display: author_display || null,
      is_published,
      updated_at: new Date().toISOString(),
    })
    .eq("slug", originalSlug);

  if (error) {
    // if rare unique-violation race: fallback once with timestamp
    if (error.code === "23505") {
      finalSlug = `${slugify(updateSlug || originalSlug)}-${Date.now()}`;
      const { error: retryErr } = await sb
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
        .eq("slug", originalSlug);
      if (retryErr) {
        redirect(
          `/post/${originalSlug}/edit?err=${encodeURIComponent(retryErr.message)}`
        );
      }
    } else {
      redirect(
        `/post/${originalSlug}/edit?err=${encodeURIComponent(error.message)}`
      );
    }
  }

  redirect(`/post/${finalSlug}`);
}

export async function deleteTopicBySlugAction(formData: FormData) {
  const slug = String(formData.get("slug") ?? "");
  if (!slug) redirect("/");

  const sb = await supabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();

  if (!user) redirect(`/login?next=/post/${slug}`);

  // RLS should already enforce ownership; we also add author_id match.
  const { error } = await sb
    .from("topics")
    .delete()
    .eq("slug", slug)
    .eq("author_id", user.id);

  if (error) {
    redirect(`/post/${slug}?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/profile"); // or '/'
}

async function deleteTopicAction(formData: FormData) {
  "use server";
  const slug = String(formData.get("slug") || "");
  if (!slug) return;

  const sb = await supabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) redirect(`/login?next=/post/${slug}`);

  // 1) Find topic (owner enforced by RLS + double check)
  const { data: topic } = await sb
    .from("topics")
    .select("id, author_id")
    .eq("slug", slug)
    .maybeSingle();
  if (!topic || topic.author_id !== user.id) redirect(`/post/${slug}`);

  // 2) List media for this topic
  const { data: media, error: mediaErr } = await sb
    .from("topic_media")
    .select("bucket, path")
    .eq("topic_id", topic.id);
  if (mediaErr) throw mediaErr;

  // 3) Remove from storage (group by bucket to minimize calls)
  const byBucket = new Map<string, string[]>();
  for (const m of media ?? []) {
    if (!byBucket.has(m.bucket)) byBucket.set(m.bucket, []);
    byBucket.get(m.bucket)!.push(m.path);
  }
  for (const [bucket, paths] of byBucket) {
    if (paths.length) {
      const { error } = await sb.storage.from(bucket).remove(paths);
      if (error) {
        console.error("storage.remove (topic) error", { bucket, error });
        // you could abort here if you prefer to keep DB rows until storage is clean
      }
    }
  }

  const { error: delMediaErr } = await sb
    .from("topic_media")
    .delete()
    .eq("topic_id", topic.id);
  if (delMediaErr) console.error("topic_media bulk delete error", delMediaErr);

  // 5) Delete the topic
  const { error: delTopicErr } = await sb
    .from("topics")
    .delete()
    .eq("id", topic.id);
  if (delTopicErr) throw delTopicErr;

  redirect("/profile");
}
