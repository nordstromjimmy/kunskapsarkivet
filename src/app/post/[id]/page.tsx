import { posts } from "@/app/lib/sampleData";
import { notFound } from "next/navigation";

export default async function PostPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const post = posts.find((p) => p.id === id);
  if (!post) return notFound();

  return (
    <article className="prose max-w-none">
      <p className="text-xs text-slate-500">{post.category}</p>
      <h1>{post.title}</h1>
      <p className="text-sm text-slate-500">
        {post.author} · {new Date(post.date).toLocaleDateString("sv-SE")}
      </p>
      <hr />
      <p>{post.excerpt}</p>
      <p className="text-slate-600">
        (Här kommer hela berättelsen, bilder, ljudklipp osv.)
      </p>
    </article>
  );
}
