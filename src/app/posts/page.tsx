import { listTopicsFiltered } from "@/server/repos/topics";
import { PostCard } from "../post/[slug]/_components/PostCard";
import { isCategory } from "@/lib/schema/post";

export const dynamic = "force-dynamic";

function normalizeCategory(k?: string) {
  if (!k) return undefined;
  try {
    const decoded = decodeURIComponent(k);
    return isCategory(decoded) ? decoded : undefined;
  } catch {
    return undefined;
  }
}

export default async function PostsPage({
  searchParams,
}: {
  searchParams: Promise<{ k?: string; q?: string }>;
}) {
  const { k, q } = await searchParams;
  const activeCategory = normalizeCategory(k);
  const query = (q ?? "").trim();

  const topics = await listTopicsFiltered({
    category: activeCategory,
    q: query,
  });

  return (
    <section className="space-y-6">
      {/* Search bar */}
      <form
        role="search"
        action="/posts"
        method="GET"
        className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"
      >
        {/* Preserve category in the URL when searching */}
        {activeCategory ? (
          <input type="hidden" name="k" value={activeCategory} />
        ) : null}

        <div className="relative">
          {/* icon */}
          <svg
            viewBox="0 0 24 24"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden
          >
            <path
              d="M21 21l-4.3-4.3M10 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          <input
            name="q"
            defaultValue={query}
            placeholder="Sök ämne…"
            className="w-full rounded-xl border border-slate-300 pl-9 pr-28 py-2.5 text-sm shadow-sm
                       focus:outline-none focus:ring-2 focus:ring-slate-400/50"
          />

          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">
            {topics.length} träff{topics.length === 1 ? "" : "ar"}
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-3">
          {/* Clear keeps you on /posts and preserves category if present */}
          <a
            href={
              activeCategory
                ? `/posts?k=${encodeURIComponent(activeCategory)}`
                : "/posts"
            }
            className="rounded-lg border px-3 py-1.5 text-sm hover:bg-slate-50"
          >
            Rensa
          </a>
          <button className="cursor-pointer rounded-lg bg-slate-900 px-4 py-1.5 text-sm text-white hover:bg-slate-800">
            Sök
          </button>
        </div>
      </form>

      {/* Results */}
      {topics.length === 0 ? (
        <p className="text-sm text-slate-600">Inga träffar för din sökning.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {topics.map((t) => (
            <PostCard
              key={t.id}
              post={{
                id: t.id,
                slug: t.slug,
                title: t.title,
                excerpt: t.excerpt ?? "",
                category: t.category,
                author: t.author ?? "Okänd",
                date: t.date,
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}
