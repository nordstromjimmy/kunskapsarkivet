import { redirect } from "next/navigation";
import { slugify } from "../../lib/utils/slugify";
import { createClientRSC } from "../../lib/supabase/rsc";
import { createClientSA } from "../../lib/supabase/actions";
import { categories } from "../model/Post";

export const dynamic = "force-dynamic";

// --- Server Action: insert topic as the logged-in user
async function insertTopic(formData: FormData) {
  "use server";

  const supabase = await createClientSA();
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
  const category = String(formData.get("category") || categories[0]).trim();
  const body_md = String(formData.get("body_md") || "").trim();
  const author_display = String(formData.get("author_display") || "").trim();
  const is_published = formData.get("is_published") === "on";

  if (!title || !body_md) {
    redirect(`/new?error=${encodeURIComponent("Titel och innehåll krävs")}`);
  }

  // Create a unique slug with ONE query: fetch similar slugs and compute next suffix in code
  const baseSlug = slugify(title);
  const { data: siblings, error: siblingsErr } = await supabase
    .from("topics")
    .select("slug")
    .like("slug", `${baseSlug}%`);

  if (siblingsErr) {
    redirect(`/new?error=${encodeURIComponent(siblingsErr.message)}`);
  }

  const taken = new Set((siblings ?? []).map((s) => s.slug));
  let slug = baseSlug;
  if (taken.has(baseSlug)) {
    let i = 2;
    while (taken.has(`${baseSlug}-${i}`)) i++;
    slug = `${baseSlug}-${i}`;
  }

  const { error: insertErr } = await supabase.from("topics").insert({
    slug,
    title,
    excerpt,
    category,
    body_md,
    author_display,
    is_published,
    author_id: user.id, // <- ownership
  });

  if (insertErr) {
    redirect(`/new?error=${encodeURIComponent(insertErr.message)}`);
  }

  redirect(`/post/${slug}`);
}

// --- Page (Server Component)
export default async function NewTopicPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  const supabase = await createClientRSC();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const disabled = !user;

  return (
    <section className="max-w-2xl">
      <h1 className="text-xl font-semibold tracking-tight">
        Lägg till nytt ämne
      </h1>
      {!user && (
        <p className="mt-2 text-sm text-slate-600">
          Du behöver vara inloggad för att publicera nya ämnen.
        </p>
      )}

      {error && (
        <p className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </p>
      )}

      {!user && (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Du är inte inloggad.{" "}
          <a className="underline" href="/login?next=/new">
            Logga in
          </a>{" "}
          för att kunna spara.
        </div>
      )}

      <NewTopicForm action={insertTopic} disabled={disabled} />
    </section>
  );
}

// --- Form (Server Component wrapper passing the action)
function NewTopicForm({
  action,
  disabled,
}: {
  action: (fd: FormData) => Promise<void>;
  disabled: boolean;
}) {
  return (
    <form action={action} className="mt-6 space-y-4">
      <div>
        <label className="block text-sm mb-1">Titel</label>
        <input
          name="title"
          required
          disabled={disabled}
          className="w-full rounded-lg border px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm mb-1">Kategori</label>
        <select
          name="category"
          disabled={disabled}
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
        <label className="block text-sm mb-1">
          Utdrag (kort sammanfattning)
        </label>
        <input
          name="excerpt"
          disabled={disabled}
          className="w-full rounded-lg border px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm mb-1">Författare att visa</label>
        <input
          name="author_display"
          disabled={disabled}
          className="w-full rounded-lg border px-3 py-2"
          placeholder="t.ex. Karin, Härnösand"
        />
      </div>

      <div>
        <label className="block text-sm mb-1">Innehåll (Markdown)</label>
        <textarea
          name="body_md"
          required
          disabled={disabled}
          className="w-full rounded-lg border px-3 py-2 h-56"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          id="pub"
          type="checkbox"
          name="is_published"
          className="h-4 w-4"
          defaultChecked
          disabled={disabled}
        />
        <label htmlFor="pub" className="text-sm">
          Publicera direkt
        </label>
      </div>

      <button
        disabled={disabled}
        className="rounded-lg bg-slate-900 text-white px-4 py-2 text-sm hover:bg-slate-800 disabled:opacity-50 cursor-pointer"
      >
        Spara
      </button>
    </form>
  );
}
