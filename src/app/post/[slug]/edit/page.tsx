// app/post/[slug]/edit/page.tsx
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { supabaseServer } from "@/server/db/supabase-server";
import { categories } from "@/lib/schema/post";
import { updateTopicFromFormAction } from "@/actions/topics";
import { uploadImageAction } from "@/actions/upload-image.action"; // keep your path if different
import { TopicMediaList } from "../_components/TopicMediaList";

export const dynamic = "force-dynamic";

export default async function EditTopicPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ err?: string }>;
}) {
  const { slug } = await params;
  const { err } = await searchParams;

  const sb = await supabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();

  // Fetch topic (RLS lets owner see drafts)
  const { data: topic, error } = await sb
    .from("topics")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  if (!topic) return notFound();

  // Owner gate (belt + suspenders with RLS)
  if (!user || topic.author_id !== user.id) {
    redirect(`/post/${slug}`);
  }

  return (
    <section className="mx-auto max-w-2xl">
      <h1 className="text-xl font-semibold tracking-tight">Redigera ämne</h1>

      {err && (
        <p className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {err}
        </p>
      )}

      {/* ===== Edit form ===== */}
      <form action={updateTopicFromFormAction} className="mt-6 space-y-4">
        <input type="hidden" name="original_slug" value={slug} />

        <div>
          <label className="mb-1 block text-sm">Titel</label>
          <input
            name="title"
            defaultValue={topic.title}
            required
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm">Slug (valfritt)</label>
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
          <label className="mb-1 block text-sm">Kategori</label>
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
          <label className="mb-1 block text-sm">Utdrag</label>
          <input
            name="excerpt"
            defaultValue={topic.excerpt ?? ""}
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm">Författare att visa</label>
          <input
            name="author_display"
            defaultValue={topic.author_display ?? ""}
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm">Innehåll (Markdown)</label>
          <textarea
            name="body_md"
            defaultValue={topic.body_md ?? ""}
            required
            className="h-56 w-full rounded-lg border px-3 py-2"
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
          <button
            className="cursor-pointer rounded-lg bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800"
            type="submit"
          >
            Spara ändringar
          </button>
          <Link
            href={`/post/${slug}`}
            className="cursor-pointer rounded-lg border px-4 py-2 text-sm hover:bg-slate-50"
          >
            Avbryt
          </Link>
        </div>
      </form>

      {/* ===== Images section ===== */}
      {/*       <section className="mt-10 space-y-4">
        <h2 className="text-lg font-medium">Bilder</h2>

        <form action={uploadImageAction} className="space-y-3">
          <input type="hidden" name="topic_id" value={topic.id} />
          <input type="hidden" name="slug" value={topic.slug} />
          <div>
            <label className="mb-1 block text-sm">Välj bild</label>
            <input type="file" name="file" accept="image/*" required />
          </div>
          <div>
            <label className="mb-1 block text-sm">Alt-text</label>
            <input name="alt" className="w-full rounded-lg border px-3 py-2" />
          </div>
          <button
            className="rounded-md border px-3 py-1.5 text-sm"
            type="submit"
          >
            Ladda upp
          </button>
        </form>

        <TopicMediaList topicId={topic.id} />
      </section> */}
    </section>
  );
}
