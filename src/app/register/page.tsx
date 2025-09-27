import { redirect } from "next/navigation";
import { supabaseServer } from "@/server/db/supabase-server";

export const dynamic = "force-dynamic";

const REGISTRATION_OPEN = false;

async function register(formData: FormData) {
  "use server";
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
    <section className="mx-auto max-w-sm">
      <h1 className="text-xl font-semibold">Skapa konto</h1>
      {error && (
        <p className="mt-2 rounded-md bg-rose-50 border border-rose-200 p-2 text-sm text-rose-700">
          {error}
        </p>
      )}
      {!REGISTRATION_OPEN && (
        <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Registrering är för närvarande avstängd medan vi arbetar vidare med
          sidan. Kom tillbaka snart!
        </p>
      )}
      <form
        action={REGISTRATION_OPEN ? register : undefined}
        className="mt-6 space-y-4"
      >
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input
            name="email"
            type="email"
            required
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Lösenord</label>
          <input
            name="password"
            type="password"
            minLength={8}
            required
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>
        <button
          disabled={!REGISTRATION_OPEN}
          aria-disabled={!REGISTRATION_OPEN}
          title={
            !REGISTRATION_OPEN ? "Registrering är avstängd just nu" : undefined
          }
          className={
            "rounded-lg px-4 py-2 text-sm text-white " +
            (!REGISTRATION_OPEN
              ? "bg-slate-400 cursor-not-allowed opacity-60"
              : "bg-slate-900 hover:bg-slate-800 cursor-pointer")
          }
        >
          Skapa konto
        </button>
      </form>
    </section>
  );
}
