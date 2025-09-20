import { createClientSA } from "@/app/lib/supabase/actions";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function TopicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = createClientSA();

  const { data, error } = await (await supabase)
    .from("topics")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .limit(1)
    .single();

  if (error === null && !data) return notFound();
  if (error) throw error;

  return (
    <article className="prose max-w-none">
      <p className="text-xs text-slate-500">{data.category}</p>
      <h1>{data.title}</h1>
      <p className="text-sm text-slate-500">
        {data.author_display ?? "Okänd"} ·{" "}
        {new Date(data.created_at).toLocaleDateString("sv-SE")}
      </p>
      <hr />
      <div className="whitespace-pre-wrap">{data.body_md}</div>
    </article>
  );
}
