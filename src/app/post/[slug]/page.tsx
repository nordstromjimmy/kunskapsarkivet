import { DeleteButton } from "@/app/components/DeleteButton";
import { FavoriteButton } from "@/app/components/FavoriteButton";
import { createClientSA } from "@/lib/supabase/actions";
import { createClientRSC } from "@/lib/supabase/rsc";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

async function deleteTopicAction(formData: FormData) {
  "use server";
  const slug = String(formData.get("slug") || "");
  if (!slug) redirect("/");

  const supabase = await createClientSA();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/post/${slug}`);

  // Delete only if current user is the owner (RLS also enforces this)
  const { error } = await supabase
    .from("topics")
    .delete()
    .eq("slug", slug)
    .eq("author_id", user.id);

  if (error) {
    redirect(`/post/${slug}?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/profile"); // or "/"
}

export const dynamic = "force-dynamic";

export default async function TopicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const supabase = await createClientRSC();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch topic (only published or owned by user — depending on RLS)
  const { data: topic, error } = await supabase
    .from("topics")
    .select("*")
    .eq("slug", slug)
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!topic) return notFound();

  const isOwner = !!user && topic.author_id === user.id;

  const { data: media } = await supabase
    .from("topic_media")
    .select("bucket, path, alt, created_at")
    .eq("topic_id", topic.id)
    .order("created_at", { ascending: true });

  // Fetch images
  const withUrls =
    (await Promise.all(
      (media ?? []).map(async (m) => {
        if (m.bucket === "topic-media-public") {
          const { data } = supabase.storage.from(m.bucket).getPublicUrl(m.path);
          return { ...m, url: data.publicUrl };
        } else {
          if (!isOwner) return { ...m, url: "" }; // non-owner can’t see private
          const { data } = await supabase.storage
            .from(m.bucket)
            .createSignedUrl(m.path, 60);
          return { ...m, url: data?.signedUrl ?? "" };
        }
      })
    )) || [];

  // Check if this topic is already in favorites (if logged in)
  let initialFav = false;
  if (user) {
    const { data: fav } = await supabase
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
      <h1>{topic.title}</h1>
      <p className="text-sm text-slate-500">
        {topic.author_display ?? "Okänd"} ·{" "}
        {new Date(topic.created_at).toLocaleDateString("sv-SE")}
      </p>
      {/* Owner controls */}
      {isOwner && (
        <div className="mt-4 mb-4 flex flex-wrap items-center gap-3">
          <Link
            href={`/post/${slug}/edit`}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50"
          >
            Redigera
          </Link>

          {/* Delete with server action + client confirm */}
          <form action={deleteTopicAction}>
            <input type="hidden" name="slug" value={slug} />
            <DeleteButton />
          </form>
          {user && (
            <div className="mx-2">
              <FavoriteButton topicId={topic.id} initial={initialFav} />
            </div>
          )}
        </div>
      )}
      <hr />
      <div className="whitespace-pre-wrap">{topic.body_md}</div>
      {withUrls
        .filter((x) => x.url)
        .map((m, i) => (
          <figure key={i} className="my-6">
            <img
              src={m.url}
              alt={m.alt || ""}
              className="rounded-lg border max-w-full h-auto"
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
