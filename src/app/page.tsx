import { PostCard } from "./components/PostCard";
import { supabaseServer } from "./lib/supabase/server";
import { categories as VALID_CATEGORIES } from "./model/Post";

export const dynamic = "force-dynamic"; // ensure no implicit caching

type PageProps = {
  searchParams?: Promise<{ k?: string }>;
};

function normalizeCategory(k?: string) {
  if (!k) return undefined;
  try {
    const decoded = decodeURIComponent(k);
    return VALID_CATEGORIES.includes(decoded) ? decoded : undefined;
  } catch {
    return undefined;
  }
}

export default async function HomePage({ searchParams }: PageProps) {
  const activeCategory = normalizeCategory((await searchParams)?.k);

  const supabase = supabaseServer();

  let query = supabase
    .from("topics")
    .select("id, slug, title, excerpt, category, author_display, created_at")
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(6);

  if (activeCategory) {
    query = query.eq("category", activeCategory);
  }

  const { data: topics, error } = await query;
  if (error) throw error;

  const list = topics ?? [];

  return (
    <section className="space-y-10">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white">
        <div className="absolute inset-0 bg-[radial-gradient(40rem_40rem_at_20%_-10%,rgba(56,189,248,0.15),transparent),radial-gradient(40rem_40rem_at_110%_10%,rgba(244,114,182,0.15),transparent)]" />
        <div className="relative px-6 py-10 sm:px-10 sm:py-12">
          <h1 className="text-center text-3xl sm:text-4xl font-semibold tracking-tight">
            Utforska gammal kunskap – dela för framtiden
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-center text-slate-600">
            Några blandade inlägg från arkivet. Sidan byggs löpande – fler ämnen
            läggs till efterhand.
          </p>
          <div className="mt-6 flex justify-center">
            <span className="rounded-full bg-rose-100 px-3 py-1 text-sm font-medium text-rose-700">
              Denna hemsida är under uppbyggnad
            </span>
          </div>
        </div>
      </div>

      {/* Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {(topics ?? []).map((t) => (
          <PostCard
            key={t.id}
            post={{
              id: t.id,
              slug: t.slug,
              title: t.title,
              excerpt: t.excerpt ?? "",
              category: t.category,
              author: t.author_display ?? "Okänd",
              date: t.created_at,
            }}
          />
        ))}
      </div>
    </section>
  );
}
