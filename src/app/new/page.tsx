import { supabaseServer } from "@/server/db/supabase-server";
import { categories } from "@/lib/schema/post";
import { createTopicFromFormAction } from "@/actions/topics";

export const dynamic = "force-dynamic";

export default async function NewTopicPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  const supabase = await supabaseServer(); // ← if your helper is sync, drop await
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const disabled = !user;

  return (
    <section className="max-w-2xl">
      <h1 className="text-xl font-semibold tracking-tight">
        Lägg till nytt ämne
      </h1>

      {!user && (
        <p className="mt-2 text-sm text-slate-600">
          Du behöver vara inloggad för att publicera nya ämnen.
        </p>
      )}

      {error && (
        <p className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </p>
      )}

      {!user && (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Du är inte inloggad.{" "}
          <a className="underline" href="/login?next=/new">
            Logga in
          </a>{" "}
          för att kunna spara.
        </div>
      )}

      <NewTopicForm action={createTopicFromFormAction} disabled={disabled} />
    </section>
  );
}

function NewTopicForm({
  action,
  disabled,
}: {
  action: (fd: FormData) => Promise<void>;
  disabled: boolean;
}) {
  return (
    <form action={action} className="mt-6 space-y-4">
      <div>
        <label className="mb-1 block text-sm">Titel</label>
        <input
          name="title"
          required
          disabled={disabled}
          className="w-full rounded-lg border px-3 py-2"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm">Kategori</label>
        <select
          name="category"
          disabled={disabled}
          className="w-full rounded-lg border px-3 py-2"
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm">
          Utdrag (kort sammanfattning)
        </label>
        <input
          name="excerpt"
          disabled={disabled}
          className="w-full rounded-lg border px-3 py-2"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm">Författare att visa</label>
        <input
          name="author_display"
          disabled={disabled}
          className="w-full rounded-lg border px-3 py-2"
          placeholder="t.ex. Karin, Härnösand"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm">Innehåll (Markdown)</label>
        <textarea
          name="body_md"
          required
          disabled={disabled}
          className="h-56 w-full rounded-lg border px-3 py-2"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          id="pub"
          type="checkbox"
          name="is_published"
          className="h-4 w-4"
          defaultChecked
          disabled={disabled}
        />
        <label htmlFor="pub" className="text-sm">
          Publicera direkt
        </label>
      </div>

      <button
        disabled={disabled}
        className="cursor-pointer rounded-lg bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800 disabled:opacity-50"
      >
        Spara
      </button>
    </form>
  );
}
