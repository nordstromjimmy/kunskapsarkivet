import { notFound, redirect } from "next/navigation";
import { slugify } from "../lib/utils/slugify";
import { createClientSA } from "../lib/supabase/actions";

export const dynamic = "force-dynamic";

const CATEGORIES = [
  "Slöjd & Hantverk",
  "Mat & Förvaring",
  "Livet på Landet",
  "Folktro & Berättelser",
  "Språk & Ord",
  "Hus & Hem",
] as const;

export default function NewTopicPage() {
  if (process.env.NODE_ENV !== "development") return notFound();
  return (
    <section className="max-w-2xl">
      <h1 className="text-xl font-semibold tracking-tight">
        Lägg till nytt ämne (endast utveckling)
      </h1>
      <p className="mt-2 text-sm text-slate-600">
        Formuläret sparar direkt i Supabase.
      </p>
      <DevOnlyBanner />
      <NewTopicForm />
    </section>
  );
}

function DevOnlyBanner() {
  return (
    <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
      Den här sidan visas bara i utvecklingsläget och använder service-nyckeln
      på servern.
    </div>
  );
}

async function insertTopic(formData: FormData) {
  "use server";
  if (process.env.NODE_ENV !== "development") notFound();

  const title = String(formData.get("title") || "").slice(0, 200);
  const excerpt = String(formData.get("excerpt") || "").slice(0, 500);
  const category = String(formData.get("category") || CATEGORIES[0]);
  const body_md = String(formData.get("body_md") || "");
  const author_display = String(formData.get("author_display") || "");
  const is_published = formData.get("is_published") === "on";

  if (!title || !body_md) throw new Error("Titel och innehåll krävs");

  const baseSlug = slugify(title);
  const supabase = createClientSA();

  // ensure unique slug
  let slug = baseSlug;
  for (let i = 1; i < 50; i++) {
    const { data: existing } = await (await supabase)
      .from("topics")
      .select("id")
      .eq("slug", slug)
      .limit(1);
    if (!existing || existing.length === 0) break;
    slug = `${baseSlug}-${i + 1}`;
  }

  const { error } = await (await supabase).from("topics").insert({
    slug,
    title,
    excerpt,
    category,
    body_md,
    author_display,
    is_published,
  });

  if (error) throw error;
  redirect(`/post/${slug}`);
}

function NewTopicForm() {
  return (
    <form action={insertTopic} className="mt-6 space-y-4">
      <div>
        <label className="block text-sm mb-1">Titel</label>
        <input
          name="title"
          required
          className="w-full rounded-lg border px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm mb-1">Kategori</label>
        <select name="category" className="w-full rounded-lg border px-3 py-2">
          {CATEGORIES.map((c) => (
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
        <input name="excerpt" className="w-full rounded-lg border px-3 py-2" />
      </div>

      <div>
        <label className="block text-sm mb-1">Författare att visa</label>
        <input
          name="author_display"
          className="w-full rounded-lg border px-3 py-2"
          placeholder="t.ex. Karin, Härnösand"
        />
      </div>

      <div>
        <label className="block text-sm mb-1">Innehåll (Markdown)</label>
        <textarea
          name="body_md"
          required
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
        />
        <label htmlFor="pub" className="text-sm">
          Publicera direkt
        </label>
      </div>

      <button className="rounded-lg bg-slate-900 text-white px-4 py-2 text-sm hover:bg-slate-800 cursor-pointer">
        Spara
      </button>
    </form>
  );
}
