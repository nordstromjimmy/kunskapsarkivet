"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import type { User } from "@supabase/supabase-js";
import CategoryScroller from "../domain/CategoryBar";

export function Navbar({ user }: { user: User | null }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const hideCategories =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/reset" ||
    pathname === "/about" ||
    pathname.startsWith("/reset/");

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 640) setOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  async function handleLogout() {
    await fetch("/logout", { method: "POST" });
    window.location.href = "/";
  }

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur">
      <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 border-b">
        <div className="flex h-14 items-center justify-between">
          {/* Brand */}
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold tracking-tight text-2xl hover:opacity-80"
          >
            <Image
              src="/logo.png"
              alt="Kunskapsarvet logo"
              width={40}
              height={40}
              priority
            />
            <span>Kunskapsarvet</span>
          </Link>

          {/* Desktop actions */}
          <nav className="hidden sm:flex items-center gap-5 text-sm text-grey-600">
            {user ? (
              <>
                <Link href="/profile" className="hover:text-slate-900">
                  Min sida
                </Link>
                {/* NEW: Nytt inlägg */}
                <Link
                  href="/new"
                  className="rounded-md px-3 py-2 hover:bg-slate-50 cursor-pointer"
                >
                  Nytt inlägg
                </Link>
                <button
                  onClick={handleLogout}
                  className="hover:bg-slate-800 bg-slate-900 text-white px-3 py-2 rounded-lg cursor-pointer"
                >
                  Logga ut
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/register"
                  className="hover:text-slate-900 bg-yellow-300 px-3 py-2 rounded-lg"
                >
                  Skapa konto
                </Link>
                <Link href="/login" className="hover:text-slate-900">
                  Logga in
                </Link>
              </>
            )}
          </nav>

          {/* Mobile hamburger */}
          <button
            type="button"
            aria-label="Öppna meny"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="sm:hidden inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 hover:bg-slate-50"
          >
            <HamburgerIcon open={open} />
          </button>
        </div>

        {/* Mobile menu panel */}
        <div
          className={[
            "sm:hidden overflow-hidden transition-[max-height] duration-200",
            open ? "max-h-60" : "max-h-0",
          ].join(" ")}
        >
          <div className="mt-2 rounded-lg bg-white p-3 shadow-sm">
            <div className="flex flex-col gap-2 text-sm">
              {user ? (
                <>
                  <Link
                    href="/profile"
                    className="rounded-md px-3 py-2 hover:bg-slate-50"
                    onClick={() => setOpen(false)}
                  >
                    Min sida
                  </Link>
                  {/* NEW: Nytt inlägg (mobile) */}
                  <Link
                    href="/new"
                    className="rounded-md px-3 py-2 hover:bg-slate-50"
                    onClick={() => setOpen(false)}
                  >
                    Nytt inlägg
                  </Link>
                  <button
                    onClick={() => {
                      setOpen(false);
                      handleLogout();
                    }}
                    className="rounded-md px-3 py-2 text-left hover:bg-slate-50"
                  >
                    Logga ut
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/register"
                    className="rounded-md px-3 py-2 hover:bg-slate-50"
                    onClick={() => setOpen(false)}
                  >
                    Skapa konto
                  </Link>
                  <Link
                    href="/login"
                    className="rounded-md px-3 py-2 hover:bg-slate-50"
                    onClick={() => setOpen(false)}
                  >
                    Logga in
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Category scroller */}
      {!hideCategories && (
        <div className="">
          <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 overflow-x-auto">
            <div className="flex gap-3 py-4">
              <Suspense fallback={<div>Loading...</div>}>
                <CategoryScroller />
              </Suspense>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        d={open ? "M6 18L18 6M6 6l12 12" : "M3 6h18M3 12h18M3 18h18"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
