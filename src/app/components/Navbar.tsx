"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { categories } from "../lib/sampleData";
import { Suspense } from "react";

export function Navbar() {
  const searchParams = useSearchParams();
  const active = decodeURIComponent(searchParams.get("k") || "");

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur">
      <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          <Link
            href="/"
            className="font-semibold tracking-tight text-2xl hover:opacity-80"
          >
            Kunskapsarvet
          </Link>
          <nav className="hidden sm:flex items-center gap-5 text-sm text-grey-600">
            <Link
              href="/"
              className="hover:text-slate-900 bg-yellow-300 p-2 rounded-lg"
            >
              Skapa konto
            </Link>
            <Link href="/" className="hover:text-slate-900 ">
              Logga in
            </Link>
          </nav>
        </div>
      </div>

      {/* Category scroller */}
      <div className="border-t-1">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 overflow-x-auto">
          <div className="flex gap-3 py-4">
            <Suspense fallback={<div>Loading...</div>}>
              <CategoryLink label="Alla" href="/" active={active === ""} />
              {categories.map((c) => (
                <CategoryLink
                  key={c}
                  label={c}
                  href={`/?k=${encodeURIComponent(c)}`}
                  active={active === c}
                />
              ))}
            </Suspense>
          </div>
        </div>
      </div>
    </header>
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
          : "border-slate-200 hover:bg-slate-50",
      ].join(" ")}
    >
      {label}
    </Link>
  );
}
