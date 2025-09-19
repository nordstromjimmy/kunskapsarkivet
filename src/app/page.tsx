import { PostCard } from "./components/PostCard";
import { posts } from "./lib/sampleData";

function shuffle<T>(arr: T[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default async function HomePage() {
  // Pick a handful of random posts for the homepage
  const random = shuffle(posts).slice(0, 6);

  return (
    <section className="space-y-8">
      <header className="max-w-none">
        <h1 className="text-2xl sm:text-1xl font-semibold text-center text-red-400 tracking-tight mt-6">
          Denna hemsida är under uppbyggnad!
        </h1>
        <h1 className="text-xl sm:text-1xl font-semibold tracking-tight mt-6">
          Utforska gammal kunskap
        </h1>
        <p className="text-slate-600">Några blandade inlägg från arkivet</p>
      </header>

      <div className="grid gap-6 sm:grid-cols-1">
        {random.map((p) => (
          <PostCard key={p.id} post={p} />
        ))}
      </div>
    </section>
  );
}
