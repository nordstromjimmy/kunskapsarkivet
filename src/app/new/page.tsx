import crypto from "node:crypto";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/server/db/supabase-server";
import { createTopicFromFormAction } from "@/actions/topics";
import { uploadTopicImageAction } from "@/actions/media";
import TopicMediaList from "@/components/domain/TopicMediaList";
import AutoUpload from "@/components/domain/AutoUpload";
import FormSubmitButton from "@/components/ui/FormSubmitButton";
import NewTopicFormClient from "./NewTopicFormClient";

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

      <NewTopicFormClient
        id="create-topic-form"
        action={createTopicFromFormAction}
        disabled={!user}
        draftKey={draftKey}
        className="mt-6 space-y-4"
      />

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

      <div className="flex flex-col items-center gap-2 border-t mt-12 py-12">
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
