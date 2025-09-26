import crypto from "node:crypto";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/server/db/supabase-server";
import { categories } from "@/lib/schema/post";
import { createTopicFromFormAction } from "@/actions/topics";
import { uploadTopicImageAction } from "@/actions/media";
import TopicMediaList from "@/components/domain/TopicMediaList";
import AutoUpload from "@/components/domain/AutoUpload";
import FormSubmitButton from "@/components/ui/FormSubmitButton";

async function listDraftMediaWithUrls(draftKey: string) {
  const sb = await supabaseServer();
  const { data } = await sb
    .from("topic_media")
    .select("id, bucket, path, alt, width, height, created_at")
    .eq("draft_key", draftKey)
    .order("created_at", { ascending: true });

  const rows = data ?? [];
  return rows.map((m) => {
    const { data: pub } = sb.storage.from(m.bucket).getPublicUrl(m.path);
    return { ...m, url: pub.publicUrl as string };
  });
}

export const dynamic = "force-dynamic";

export default async function NewTopicPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; draft?: string }>;
}) {
  const { error, draft } = await searchParams;
  if (!draft) {
    const newKey = crypto.randomUUID();
    const qs = new URLSearchParams();
    if (error) qs.set("error", error);
    qs.set("draft", newKey);
    redirect(`/new?${qs.toString()}`);
  }

  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const disabled = !user;

  const draftKey = draft;

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

      <form
        id="create-topic-form"
        action={createTopicFromFormAction}
        className="mt-6 space-y-4"
      >
        <input type="hidden" name="draft_key" value={draftKey} />

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
      </form>

      <section className="mt-10 space-y-4">
        <h2 className="text-lg font-medium">Ladda upp bilder</h2>
        <AutoUpload
          mode="draft"
          draftKey={draftKey}
          disabled={disabled}
          action={uploadTopicImageAction}
        />
        <TopicMediaList mode="draft" draftKey={draftKey} editable />
      </section>

      <div className="flex flex-col items-center gap-2 border-t-1 mt-12 py-8">
        <input
          id="pub"
          type="checkbox"
          name="is_published"
          className="h-4 w-4"
          defaultChecked
          form="create-topic-form"
          disabled={disabled}
        />
        <label htmlFor="pub" className="text-sm">
          Publicera direkt
        </label>
        <FormSubmitButton
          formId="create-topic-form"
          pendingText="Sparar…"
          disabled={disabled}
          className="cursor-pointer rounded-lg bg-slate-900 text-white hover:bg-slate-800"
        >
          Spara
        </FormSubmitButton>
      </div>
    </section>
  );
}
