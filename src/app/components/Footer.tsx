import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t mt-26">
      <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 grid gap-8 sm:grid-cols-3">
        <div>
          <div className="font-semibold">Kunskapsarvet</div>
          <p className="mt-2 text-sm text-slate-600">
            Ett levande svenskt arkiv för äldre kunskap, hantverk och
            berättelser. Dela innan det försvinner – och visa hur vi kan föra
            det vidare.
          </p>
        </div>

        <nav className="text-sm">
          <div className="font-medium text-slate-900">Sidor</div>
          <ul className="mt-2 space-y-2 text-slate-600">
            <li>
              <Link href="/" className="hover:text-slate-900">
                Hem
              </Link>
            </li>
            {/*             <li>
              <Link href="/submit" className="hover:text-slate-900">
                Lägg till
              </Link>
            </li> */}
            <li>
              <Link href="/about" className="hover:text-slate-900">
                Om
              </Link>
            </li>
          </ul>
        </nav>

        <div className="text-sm">
          <div className="font-medium text-slate-900">Kontakt</div>
          <ul className="mt-2 space-y-2 text-slate-600">
            <li>
              E‑post:{" "}
              <a
                className="hover:text-slate-900"
                href="mailto:info@kunskapsarvet.se"
              >
                info@kunskapsarvet.se
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
