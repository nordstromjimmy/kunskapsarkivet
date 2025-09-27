import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseServer } from "@/server/db/supabase-server";
import { DeleteButton } from "@/components/domain/DeleteButton";
import { FavoriteButton } from "@/components/domain/FavoriteButton";
import { deleteTopicBySlugAction } from "@/actions/topics";
import TopicMediaList from "@/components/domain/TopicMediaList";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function TopicPage({ params }: PageProps) {
  const { slug } = await params;
  const sb = await supabaseServer();

  const {
    data: { user },
  } = await sb.auth.getUser();

  const { data: topic, error } = await sb
    .from("topics")
    .select(
      "id, slug, title, category, author_display, body_md, created_at, author_id"
    )
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  if (!topic) return notFound();

  const isOwner = !!user && topic.author_id === user.id;

  let initialFav = false;
  if (user) {
    const { data: fav } = await sb
      .from("favorites")
      .select("topic_id")
      .eq("user_id", user.id)
      .eq("topic_id", topic.id)
      .maybeSingle();
    initialFav = !!fav;
  }

  return (
    <article className="prose max-w-none">
      <p className="text-xs text-slate-500">{topic.category}</p>

      <header className="mb-4">
        <h1>{topic.title}</h1>
        <p className="text-sm text-slate-500">
          {topic.author_display ?? "Okänd"} ·{" "}
          {new Date(topic.created_at).toLocaleDateString("sv-SE")}
        </p>

        {user && (
          <div className="mt-2">
            <FavoriteButton topicId={topic.id} initial={initialFav} />
          </div>
        )}

        {isOwner && (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Link
              href={`/post/${slug}/edit`}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50"
            >
              Redigera ämne
            </Link>

            <form action={deleteTopicBySlugAction}>
              <input type="hidden" name="slug" value={slug} />
              <DeleteButton />
            </form>
          </div>
        )}
      </header>

      <hr />

      <div className="whitespace-pre-wrap">{topic.body_md}</div>

      <TopicMediaList mode="topic" topicId={topic.id} ownerSigned={isOwner} />
    </article>
  );
}
