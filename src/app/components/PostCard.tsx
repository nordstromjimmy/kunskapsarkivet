import Link from "next/link";
import { Post } from "../lib/sampleData";

export function PostCard({ post }: { post: Post }) {
  return (
    <article className="rounded-2xl p-5 hover:shadow-sm transition-shadow">
      <div className="text-[11px] uppercase tracking-wide text-slate-700">
        {post.category}
      </div>
      <h3 className="mt-1 text-lg font-medium leading-snug">
        <Link href={`/post/${post.id}`} className="hover:underline">
          {post.title}
        </Link>
      </h3>
      <p className="mt-2 text-sm text-slate-600">{post.excerpt}</p>
      <div className="mt-4 flex items-center justify-between text-xs text-slate-800">
        <span>{post.author}</span>
      </div>
      <time className="text-xs text-slate-500" dateTime={post.date}>
        {new Date(post.date).toLocaleDateString("sv-SE")}
      </time>
    </article>
  );
}
