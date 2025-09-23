import { redirect } from "next/navigation";
import { supabaseServer } from "@/server/db/supabase-server";

export const dynamic = "force-dynamic";

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
      <form action={register} className="mt-6 space-y-4">
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
        <button className="rounded-lg bg-slate-900 text-white px-4 py-2 text-sm cursor-pointer">
          Skapa konto
        </button>
      </form>
    </section>
  );
}
