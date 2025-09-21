import Link from "next/link";
import { categoryColors } from "../../lib/colors";
import { Post } from "../model/Post";

export function PostCard({ post }: { post: Post }) {
  const pal = categoryColors[post.category] ?? {
    bg: "bg-slate-100",
    text: "text-slate-700",
  };

  return (
    <article
      className={[
        "group relative overflow-hidden rounded-2xl border border-slate-200",
        "bg-white shadow-sm transition-all",
        "hover:shadow-md hover:-translate-y-0.5",
        "focus-within:shadow-md focus-within:-translate-y-0.5",
      ].join(" ")}
    >
      <div className="p-5">
        <div className="mb-2 flex items-center justify-between">
          <span
            className={[
              "inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-medium",
              pal.bg,
              pal.text,
            ].join(" ")}
          >
            ● {post.category}
          </span>
          <time className="text-xs text-slate-500" dateTime={post.date}>
            {new Date(post.date).toLocaleDateString("sv-SE")}
          </time>
        </div>

        <h3 className="mt-1 text-lg font-semibold leading-snug tracking-tight">
          <Link
            href={`/post/${post.slug ?? post.id}`}
            className="hover:underline"
          >
            {post.title}
          </Link>
        </h3>

        <p className="mt-2 text-sm text-slate-600">{post.excerpt}</p>

        <div className="mt-4 flex items-center justify-between text-xs text-slate-700">
          <span className="font-medium">{post.author}</span>
          <Link
            href={`/post/${post.slug ?? post.id}`}
            className="rounded-md bg-slate-900 text-white px-3 py-1.5 text-xs transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
          >
            Läs mer
          </Link>
        </div>
      </div>
    </article>
  );
}
