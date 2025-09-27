import { headers } from "next/headers";
import { supabaseServer } from "@/server/db/supabase-server";
import PendingButton from "@/components/ui/PendingButton";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

async function baseUrl() {
  const env = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (env) return env;
  const h = headers(); // no await
  const proto = (await h).get("x-forwarded-proto") ?? "http";
  const host = (await h).get("host") ?? "localhost:3000";
  return `${proto}://${host}`;
}

async function sendReset(formData: FormData) {
  "use server";
  const email = String(formData.get("email") || "").trim();
  if (!email) {
    redirect(
      `/reset?error=${encodeURIComponent("Ange en giltig e-postadress")}`
    );
  }

  const sb = await supabaseServer();
  const redirectTo = `${baseUrl()}/reset/update`; // absolute

  const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo });
  if (error) {
    redirect(`/reset?error=${encodeURIComponent(error.message)}`);
  }

  // ✅ triggers a new request with ?sent=1 so your banner renders
  redirect(`/reset?sent=1`);
}

export default async function ResetPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; sent?: string }>;
}) {
  const { error, sent } = await searchParams;

  return (
    <section className="mx-auto max-w-sm py-14">
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <h1 className="text-lg font-semibold tracking-tight">
            Återställ lösenord
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Ange din e-post så skickar vi en länk för att skapa ett nytt
            lösenord.
          </p>
        </div>

        <div className="px-6 py-6">
          {error && (
            <p className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </p>
          )}
          {sent && (
            <p className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              Om en användare med den e-postadressen finns har vi skickat en
              återställningslänk. Kolla inkorgen (och skräppost).
            </p>
          )}

          <form id="reset-form" action={sendReset} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1 block text-sm">
                E-post
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm
                           shadow-sm placeholder:text-slate-400
                           focus:outline-none focus:ring-2 focus:ring-slate-400/50"
                placeholder="namn@example.com"
              />
            </div>

            <div className="pt-2">
              <PendingButton
                pendingText="Skickar…"
                className="w-full rounded-lg bg-slate-900 text-white hover:bg-slate-800 cursor-pointer"
              >
                Skicka återställningslänk
              </PendingButton>
            </div>
          </form>

          <div className="mt-4 text-right text-xs text-slate-600">
            <a className="hover:underline" href="/login">
              Tillbaka till inloggning
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
