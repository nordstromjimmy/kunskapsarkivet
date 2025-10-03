import { notFound, redirect } from "next/navigation";
import { supabaseServer } from "@/server/db/supabase-server";
import { updateTopicFromFormAction } from "@/actions/topics";
import { uploadTopicImageAction } from "@/actions/media";
import AutoUpload from "@/components/domain/AutoUpload";
import TopicMediaList from "@/components/domain/TopicMediaList";
import FormSubmitButton from "@/components/ui/FormSubmitButton";
import EditTopicFormClient from "./EditTopicFormClient";

export const dynamic = "force-dynamic";

export default async function EditTopicPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ err?: string }>;
}) {
  const { slug } = await params;
  const { err } = await searchParams;

  const sb = await supabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();

  const disabled = !user;

  const { data: topic, error } = await sb
    .from("topics")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  if (!topic) return notFound();

  if (!user || topic.author_id !== user.id) {
    redirect(`/post/${slug}`);
  }

  return (
    <section className="mx-auto max-w-2xl">
      <h1 className="text-xl font-semibold tracking-tight">Redigera ämne</h1>

      {err && (
        <p className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {err}
        </p>
      )}

      <EditTopicFormClient
        id="edit-topic-form"
        action={updateTopicFromFormAction}
        disabled={!user}
        topic={{
          originalSlug: slug,
          slug: topic.slug,
          title: topic.title,
          excerpt: topic.excerpt,
          category: topic.category,
          body_md: topic.body_md ?? "",
          author_display: topic.author_display,
          is_published: !!topic.is_published,
        }}
      />

      <section className="mt-10 space-y-4">
        <h2 className="text-lg font-medium">Ladda upp bilder</h2>

        <AutoUpload
          mode="topic"
          topicId={topic.id}
          slug={topic.slug}
          action={uploadTopicImageAction}
        />

        <TopicMediaList
          mode="topic"
          topicId={topic.id}
          ownerSigned
          editable
          slug={topic.slug}
        />
      </section>

      <div className="flex flex-col items-center gap-2 border-t mt-12 py-8">
        {/*         <div className="flex flex-row items-center gap-2 py-2">
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
            Publicera
          </label>
        </div> */}
        <FormSubmitButton
          formId="edit-topic-form"
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
