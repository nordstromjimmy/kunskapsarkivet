import { redirect } from "next/navigation";
import Link from "next/link";
import { createClientRSC } from "../lib/supabase/rsc";

export default async function ProfilePage() {
  const supabase = await createClientRSC();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/profile");

  // Drafts (not published, owned by user)
  const { data: drafts } = await supabase
    .from("topics")
    .select("id, slug, title, created_at")
    .eq("author_id", user.id)
    .eq("is_published", false)
    .order("created_at", { ascending: false });

  // Favorites (join)
  const { data: favs } = await supabase
    .from("favorites")
    .select("topic_id, topics!inner(id, slug, title, is_published)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const favoriteTopics = (favs ?? []).map((f: any) => f.topics);

  return (
    <section className="mx-auto max-w-3xl space-y-8">
      <header>
        <h1 className="text-xl font-semibold">Din profil</h1>
        <p className="text-slate-600 text-sm">{user.email}</p>
      </header>

      <div className="space-y-4">
        <h2 className="text-lg font-medium">Dina utkast</h2>
        {(drafts ?? []).length === 0 ? (
          <p className="text-sm text-slate-600">Inga utkast ännu.</p>
        ) : (
          <ul className="space-y-2">
            {drafts!.map((t) => (
              <li
                key={t.id}
                className="flex items-center justify-between rounded-lg border px-3 py-2"
              >
                <Link href={`/post/${t.slug}`} className="hover:underline">
                  {t.title}
                </Link>
                <span className="text-xs text-slate-500">
                  {new Date(t.created_at).toLocaleDateString("sv-SE")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-medium">Dina favoriter</h2>
        {favoriteTopics.length === 0 ? (
          <p className="text-sm text-slate-600">Inga favoriter ännu.</p>
        ) : (
          <ul className="space-y-2">
            {favoriteTopics.map((t: any) => (
              <li
                key={t.id}
                className="flex items-center justify-between rounded-lg border px-3 py-2"
              >
                <Link href={`/post/${t.slug}`} className="hover:underline">
                  {t.title}{" "}
                  {t.is_published ? (
                    ""
                  ) : (
                    <span className="ml-2 text-xs text-amber-700">
                      (Ej publicerad)
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
