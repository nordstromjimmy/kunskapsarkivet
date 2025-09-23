import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseServer } from "@/server/db/supabase-server";
import { DeleteButton } from "@/components/domain/DeleteButton";
import { FavoriteButton } from "@/components/domain/FavoriteButton";
import { deleteTopicBySlugAction } from "@/actions/topics";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function TopicPage({ params }: PageProps) {
  const { slug } = await params;
  const sb = await supabaseServer();

  // Current user
  const {
    data: { user },
  } = await sb.auth.getUser();

  // Topic (RLS decides visibility: published or owned)
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

  // Media (grab an id so keys are stable)
  const { data: media } = await sb
    .from("topic_media")
    .select("id, bucket, path, alt, created_at")
    .eq("topic_id", topic.id)
    .order("created_at", { ascending: true });

  // Resolve URLs: public -> publicUrl, private -> signed URL (owner only)
  const mediaWithUrls =
    (await Promise.all(
      (media ?? []).map(async (m) => {
        if (m.bucket === "topic-media-public") {
          const { data } = sb.storage.from(m.bucket).getPublicUrl(m.path);
          return { ...m, url: data.publicUrl };
        }
        // Private buckets: only the owner should see signed URLs
        if (!isOwner) return { ...m, url: "" };
        const { data } = await sb.storage
          .from(m.bucket)
          .createSignedUrl(m.path, 60);
        return { ...m, url: data?.signedUrl ?? "" };
      })
    )) ?? [];

  // Initial favorite state (only if logged in)
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

        {/* Favorite for any signed-in user */}
        {user && (
          <div className="mt-2">
            <FavoriteButton topicId={topic.id} initial={initialFav} />
          </div>
        )}

        {/* Owner controls */}
        {isOwner && (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Link
              href={`/post/${slug}/edit`}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50"
            >
              Redigera
            </Link>

            {/* Delete with server action + client confirm button */}
            <form action={deleteTopicBySlugAction}>
              <input type="hidden" name="slug" value={slug} />
              <DeleteButton />
            </form>
          </div>
        )}
      </header>

      <hr />

      <div className="whitespace-pre-wrap">{topic.body_md}</div>

      {/* Images */}
      {mediaWithUrls
        .filter((x) => x.url)
        .map((m) => (
          <figure key={m.id} className="my-6">
            <img
              src={m.url}
              alt={m.alt || ""}
              className="h-auto max-w-full rounded-lg border"
            />
            {m.alt && (
              <figcaption className="mt-2 text-xs text-slate-500">
                {m.alt}
              </figcaption>
            )}
          </figure>
        ))}
    </article>
  );
}
