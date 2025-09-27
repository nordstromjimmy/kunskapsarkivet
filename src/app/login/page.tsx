import { redirect } from "next/navigation";
import { supabaseServer } from "@/server/db/supabase-server";
import FormSubmitButton from "@/components/ui/FormSubmitButton";

export const dynamic = "force-dynamic";

async function login(formData: FormData) {
  "use server";
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");
  const next = String(formData.get("next") || "/");

  const supabase = await supabaseServer();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect(`/login?error=${encodeURIComponent(error.message)}`);

  redirect(next || "/");
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string;
    next?: string;
    success?: string;
    msg?: string;
  }>;
}) {
  const { error, next = "/", success, msg } = await searchParams;

  return (
    <section className="mx-auto max-w-sm py-14">
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <h1 className="text-lg font-semibold tracking-tight">Logga in</h1>
          <p className="mt-1 text-sm text-slate-600">
            Välkommen tillbaka! Ange dina uppgifter nedan.
          </p>
        </div>

        <div className="px-6 py-6">
          {success && (
            <p className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              {msg ?? "Åtgärden lyckades."}
            </p>
          )}
          {error && (
            <p className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </p>
          )}

          <form action={login} className="space-y-4" id="login-form">
            <input type="hidden" name="next" value={next} />

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

            <div>
              <label htmlFor="password" className="mb-1 block text-sm">
                Lösenord
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm
                           shadow-sm placeholder:text-slate-400
                           focus:outline-none focus:ring-2 focus:ring-slate-400/50"
                placeholder="••••••••"
              />
            </div>

            <div className="pt-2">
              <FormSubmitButton
                formId="login-form"
                pendingText="Loggar in.."
                className="cursor-pointer rounded-lg bg-slate-900 text-white hover:bg-slate-800"
              >
                Logga in
              </FormSubmitButton>
            </div>
          </form>

          {/* Optional row under the form */}
          <div className="mt-4 flex items-center justify-between text-xs text-slate-600">
            <div className="mt-4 text-center text-xs text-slate-600">
              Har du inget konto?{" "}
              <a className="hover:underline" href="/register">
                Skapa konto
              </a>
            </div>
            <div className="mt-4 text-center text-xs text-slate-600">
              <a className="hover:underline" href="/reset">
                Glömt lösenord?
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
