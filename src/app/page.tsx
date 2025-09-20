import { PostCard } from "./components/PostCard";
import { posts } from "./lib/sampleData";

function dailySeed() {
  const d = new Date();
  const s = Number(
    `${d.getFullYear()}${(d.getMonth() + 1).toString().padStart(2, "0")}${d.getDate().toString().padStart(2, "0")}`
  );
  const x = Math.sin(s) * 10000;
  return x - Math.floor(x);
}
function shuffleDeterministic<T>(arr: T[]) {
  const a = [...arr];
  let r = dailySeed();
  for (let i = a.length - 1; i > 0; i--) {
    r = (r * 9301 + 49297) % 233280;
    const j = Math.floor((r / 233280) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default async function HomePage() {
  const random = shuffleDeterministic(posts).slice(0, 6);

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
        {random.map((p) => (
          <PostCard key={p.id} post={p} />
        ))}
      </div>
    </section>
  );
}
