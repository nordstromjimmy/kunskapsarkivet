import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto max-w-2xl py-16 text-center">
      <div className="mb-6 text-2xl text-slate-500">404</div>
      <h1 className="text-3xl font-semibold tracking-tight">
        Sidan kunde inte hittas
      </h1>
      <p className="mx-auto mt-3 max-w-prose text-slate-600">
        Ledsen! Vi hittar inte sidan du letar efter. Den kan vara borttagen
        eller flyttad.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800"
        >
          Till startsidan
        </Link>

        {/*         <Link
          href="/?k=Hus%20%26%20Hem"
          className="rounded-lg border px-4 py-2 text-sm hover:bg-slate-50"
        >
          Utforska inlägg
        </Link> */}
      </div>
    </section>
  );
}
