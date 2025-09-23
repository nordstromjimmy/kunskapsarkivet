import { redirect } from "next/navigation";
import { supabaseServer } from "@/server/db/supabase-server";

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
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error, next } = await searchParams;

  return (
    <section className="mx-auto max-w-sm">
      <h1 className="text-xl font-semibold">Logga in</h1>
      {error && (
        <p className="mt-2 rounded-md bg-rose-50 border border-rose-200 p-2 text-sm text-rose-700">
          {error}
        </p>
      )}
      <form action={login} className="mt-6 space-y-4">
        <input type="hidden" name="next" value={next || "/"} />
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
            required
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>
        <button className="rounded-lg bg-slate-900 text-white px-4 py-2 text-sm cursor-pointer">
          Logga in
        </button>
      </form>
    </section>
  );
}
