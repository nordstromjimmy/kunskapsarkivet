"use client";
import { useEffect, useState, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/server/db/supabase-browser";

export default function ResetUpdatePage() {
  const router = useRouter();
  const params = useSearchParams();
  const sb = supabaseBrowser();

  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1) Verify the recovery token; this signs the user in
  useEffect(() => {
    (async () => {
      const tokenHash =
        params.get("token_hash") ??
        params.get("token") ?? // some setups use token=
        null;

      if (!tokenHash) {
        setError("Ogiltig återställningslänk.");
        setReady(true);
        return;
      }

      const { error } = await sb.auth.verifyOtp({
        type: "recovery",
        token_hash: tokenHash,
      });
      if (error) setError(error.message);
      setReady(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2) Update password now that we're authenticated
  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const fd = new FormData(e.currentTarget);
    const pw = String(fd.get("password") || "");
    const pw2 = String(fd.get("password2") || "");
    if (pw.length < 8) return setError("Lösenordet måste vara minst 8 tecken.");
    if (pw !== pw2) return setError("Lösenorden matchar inte.");

    setSaving(true);
    const { error } = await sb.auth.updateUser({ password: pw });
    setSaving(false);
    if (error) return setError(error.message);

    router.push(
      "/login?success=1&msg=" +
        encodeURIComponent("Lösenordet är uppdaterat. Logga in igen.")
    );
  }

  return (
    <section className="mx-auto max-w-sm py-14">
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <h1 className="text-lg font-semibold tracking-tight">
            Skapa nytt lösenord
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Ange ett nytt lösenord för ditt konto.
          </p>
        </div>

        <div className="px-6 py-6">
          {error && (
            <p className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </p>
          )}

          {!ready ? (
            <p className="text-sm text-slate-600">Kontrollerar länk…</p>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label htmlFor="password" className="mb-1 block text-sm">
                  Nytt lösenord
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  minLength={8}
                  required
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm
                             focus:outline-none focus:ring-2 focus:ring-slate-400/50"
                  placeholder="Minst 8 tecken"
                />
              </div>
              <div>
                <label htmlFor="password2" className="mb-1 block text-sm">
                  Bekräfta lösenord
                </label>
                <input
                  id="password2"
                  name="password2"
                  type="password"
                  minLength={8}
                  required
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm
                             focus:outline-none focus:ring-2 focus:ring-slate-400/50"
                  placeholder="Skriv igen"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800 disabled:opacity-50 cursor-pointer"
              >
                {saving ? "Sparar…" : "Uppdatera lösenord"}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
