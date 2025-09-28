import { categories } from "@/lib/schema/post";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

export default function CategoryScroller() {
  const pathname = usePathname();
  const base = pathname.startsWith("/posts") ? "/posts" : "/";
  const searchParams = useSearchParams();
  const active = decodeURIComponent(searchParams.get("k") ?? "");

  return (
    <section className="w-full">
      <h2 className="mb-4 text-center text-xl font-semibold">Kategorier</h2>

      <nav
        aria-label="Kategorier"
        className="flex flex-wrap justify-center gap-2 sm:gap-3"
      >
        <CategoryLink label="Alla" href={base} active={active === ""} />
        {categories.map((c) => (
          <CategoryLink
            key={c}
            label={c}
            href={`${base}?k=${encodeURIComponent(c)}`}
            active={active === c}
          />
        ))}
      </nav>
    </section>
  );
}

function CategoryLink({
  label,
  href,
  active,
}: {
  label: string;
  href: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={[
        "whitespace-nowrap rounded-full border px-3 py-1.5 text-sm",
        active
          ? "border-slate-900 bg-slate-900 text-white"
          : "border-slate-2 00 hover:bg-slate-50",
      ].join(" ")}
    >
      {label}
    </Link>
  );
}
