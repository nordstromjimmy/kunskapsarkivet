import { notFound, redirect } from "next/navigation";
import { createClientRSC } from "@/lib/supabase/rsc";
import { createClientSA } from "@/lib/supabase/actions";
import { slugify } from "@/lib/utils/slugify";
import { categories } from "@/app/model/Post";
import Link from "next/link";

export const dynamic = "force-dynamic";

// --- Server Action: update (owner only)
async function updateTopicAction(formData: FormData) {
  "use server";

  const originalSlug = String(formData.get("original_slug") || "");
  const title = String(formData.get("title") || "")
    .slice(0, 200)
    .trim();
  const excerpt = String(formData.get("excerpt") || "")
    .slice(0, 500)
    .trim();
  const category = String(formData.get("category") || categories[0]).trim();
  const body_md = String(formData.get("body_md") || "").trim();
  const author_display = String(formData.get("author_display") || "").trim();
  const is_published = formData.get("is_published") === "on";
  const updateSlug = String(formData.get("slug") || "").trim();

  const supabase = await createClientSA();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/post/${originalSlug}/edit`);

  // Compute final slug: allow changing slug, ensure uniqueness
  let finalSlug = originalSlug;
  if (updateSlug && updateSlug !== originalSlug) {
    const base = slugify(updateSlug);
    const { data: siblings, error: siblingsErr } = await supabase
      .from("topics")
      .select("slug")
      .like("slug", `${base}%`);

    if (siblingsErr) {
      redirect(
        `/post/${originalSlug}/edit?error=${encodeURIComponent(siblingsErr.message)}`
      );
    }
    const taken = new Set((siblings ?? []).map((s) => s.slug));
    finalSlug = base;
    if (taken.has(base)) {
      let i = 2;
      while (taken.has(`${base}-${i}`)) i++;
      finalSlug = `${base}-${i}`;
    }
  }

  // Update only if owner (RLS also enforces this)
  const { error } = await supabase
    .from("topics")
    .update({
      slug: finalSlug,
      title,
      excerpt,
      category,
      body_md,
      author_display,
      is_published,
      updated_at: new Date().toISOString(),
    })
    .eq("slug", originalSlug);

  if (error) {
    redirect(
      `/post/${originalSlug}/edit?error=${encodeURIComponent(error.message)}`
    );
  }

  redirect(`/post/${finalSlug}`);
}

export default async function EditTopicPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ err?: string }>;
}) {
  const { slug } = await params;
  const { err } = await searchParams;

  const supabase = await createClientRSC();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch the topic (RLS should let owner see drafts)
  const { data: topic, error } = await supabase
    .from("topics")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  if (!topic) return notFound();

  // Owner gate (extra safety; RLS also covers it)
  if (!user || topic.author_id !== user.id) {
    redirect(`/post/${slug}`); // not owner → bounce to view page
  }

  return (
    <section className="mx-auto max-w-2xl">
      <h1 className="text-xl font-semibold tracking-tight">Redigera ämne</h1>

      {err && (
        <p className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {err}
        </p>
      )}

      <form action={updateTopicAction} className="mt-6 space-y-4">
        <input type="hidden" name="original_slug" value={slug} />

        <div>
          <label className="block text-sm mb-1">Titel</label>
          <input
            name="title"
            defaultValue={topic.title}
            required
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Slug (valfritt)</label>
          <input
            name="slug"
            placeholder={topic.slug}
            className="w-full rounded-lg border px-3 py-2"
          />
          <p className="mt-1 text-xs text-slate-500">
            Lämna tomt för att behålla samma slug.
          </p>
        </div>

        <div>
          <label className="block text-sm mb-1">Kategori</label>
          <select
            name="category"
            defaultValue={topic.category}
            className="w-full rounded-lg border px-3 py-2"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1">Utdrag</label>
          <input
            name="excerpt"
            defaultValue={topic.excerpt ?? ""}
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Författare att visa</label>
          <input
            name="author_display"
            defaultValue={topic.author_display ?? ""}
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Innehåll (Markdown)</label>
          <textarea
            name="body_md"
            defaultValue={topic.body_md ?? ""}
            required
            className="w-full rounded-lg border px-3 py-2 h-56"
          />
        </div>

        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            name="is_published"
            defaultChecked={!!topic.is_published}
            className="h-4 w-4"
          />
          <span>Publicera</span>
        </label>

        <div className="flex items-center gap-3">
          <button className="rounded-lg bg-slate-900 text-white px-4 py-2 text-sm hover:bg-slate-800 cursor-pointer">
            Spara ändringar
          </button>
          <Link
            href={`/post/${slug}`}
            className="rounded-lg border px-4 py-2 text-sm hover:bg-slate-50 cursor-pointer"
          >
            Avbryt
          </Link>
        </div>
      </form>
    </section>
  );
}
