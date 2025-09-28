import Link from "next/link";
import { isCategory } from "../lib/schema/post";
import { PostCard } from "./post/[slug]/_components/PostCard";
import { listTopics, listTopicsByCategory } from "@/server/repos/topics";

// Choose one strategy:
// export const dynamic = 'force-dynamic'          // always dynamic
export const revalidate = 60; // or cache for 60s; actions will revalidatePath()

type PageProps = {
  searchParams?: Promise<{ k?: string }>;
};

function normalizeCategory(k?: string) {
  if (!k) return undefined;
  try {
    const decoded = decodeURIComponent(k);
    return isCategory(decoded) ? decoded : undefined;
  } catch {
    return undefined;
  }
}

export default async function HomePage({ searchParams }: PageProps) {
  const activeCategory = normalizeCategory((await searchParams)?.k);

  const topics = activeCategory
    ? await listTopicsByCategory(activeCategory, { limit: 6 })
    : await listTopics({ limit: 6 });

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
            Några blandade inlägg från arkivet visas nedan. <br></br> Sidan
            byggs löpande – fler ämnen läggs till eftersom.
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
        {topics.map((t) => (
          <PostCard
            key={t.id}
            post={{
              id: t.id,
              slug: t.slug,
              title: t.title,
              excerpt: t.excerpt,
              category: t.category,
              author: t.author || "Okänd",
              date: t.date,
            }}
          />
        ))}
      </div>
      <Link
        href="/posts"
        className="rounded-lg px-4 py-2 text-sm bg-slate-900 text-white hover:bg-slate-800 cursor-pointer"
      >
        Visa alla ämnen
      </Link>
    </section>
  );
}
