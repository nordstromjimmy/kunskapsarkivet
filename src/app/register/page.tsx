import { redirect } from "next/navigation";
import { supabaseServer } from "@/server/db/supabase-server";
import FormSubmitButton from "@/components/ui/FormSubmitButton";

export const dynamic = "force-dynamic";

const REGISTRATION_OPEN = false;

async function register(formData: FormData) {
  "use server";
  if (!REGISTRATION_OPEN) {
    return undefined;
  }
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");

  const supabase = await supabaseServer();
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) redirect(`/register?error=${encodeURIComponent(error.message)}`);

  if (data.session) redirect("/");
  redirect(
    `/login?m=${encodeURIComponent("Kolla din e-post för att bekräfta kontot.")}`
  );
}

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <section className="mx-auto max-w-sm py-14">
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <h1 className="text-lg font-semibold tracking-tight">Skapa konto</h1>
          <p className="mt-1 text-sm text-slate-600">
            Fyll i dina uppgifter nedan för att skapa ett konto.
          </p>
        </div>

        <div className="px-6 py-6">
          {error && (
            <p className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </p>
          )}

          {!REGISTRATION_OPEN && (
            <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              Registrering är för närvarande avstängd medan vi arbetar vidare
              med sidan. Kom tillbaka snart!
            </p>
          )}

          <form action={register} className="space-y-4" id="create-form">
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
                minLength={8}
                required
                autoComplete="new-password"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm
                           shadow-sm placeholder:text-slate-400
                           focus:outline-none focus:ring-2 focus:ring-slate-400/50"
                placeholder="Minst 8 tecken"
              />
            </div>

            <div className="pt-2">
              <button
                disabled={!REGISTRATION_OPEN}
                aria-disabled={!REGISTRATION_OPEN}
                title={
                  !REGISTRATION_OPEN
                    ? "Registrering är avstängd just nu"
                    : undefined
                }
                className={
                  "w-full rounded-lg px-4 py-2 text-sm text-white " +
                  (!REGISTRATION_OPEN
                    ? "bg-slate-400 cursor-not-allowed opacity-60"
                    : "bg-slate-900 hover:bg-slate-800 cursor-pointer")
                }
              >
                Skapa konto
              </button>

              {/* If you want a spinner when open, swap to FormSubmitButton and keep the comment */}
              {/* <FormSubmitButton
                formId="create-form"
                pendingText="Skapar konto…"
                className="w-full cursor-pointer rounded-lg bg-slate-900 text-white hover:bg-slate-800"
              >
                Skapa konto
              </FormSubmitButton> */}
            </div>
          </form>

          <div className="mt-4 text-center text-xs text-slate-600">
            Har du redan ett konto?{" "}
            <a className="hover:underline" href="/login">
              Logga in
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
