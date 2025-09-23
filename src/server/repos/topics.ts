import "server-only";
import { supabaseServer } from "@/server/db/supabase-server";
import type { Post } from "@/lib/schema/post";
import { slugify } from "@/lib/schema/post"; // optional helper if you kept it

// DB row shape (subset) from public.topics
type TopicRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  category: string;
  body_md: string;
  author_display: string | null;
  is_published: boolean;
  created_at: string; // timestamptz -> ISO string
  updated_at: string;
  author_id: string | null;
};

const SELECT =
  "id, slug, title, excerpt, category, body_md, author_display, is_published, created_at, updated_at, author_id";

// Map DB row -> your UI `Post` type
function mapTopicRowToPost(row: TopicRow): Post {
  return {
    id: row.id,
    slug: row.slug, // DB is non-null; your UI type allows undefined, but we provide it
    title: row.title,
    excerpt: row.excerpt ?? "",
    category: row.category as Post["category"], // rely on your Category union to keep it sane
    author: row.author_display ?? "",
    date: row.created_at, // ISO string
  };
}

/** Get one topic by slug (defaults to only published). */
export async function getTopicBySlug(
  slug: string,
  opts: { includeDrafts?: boolean } = {}
): Promise<Post | null> {
  const sb = await supabaseServer();
  let q = sb.from("topics").select(SELECT).eq("slug", slug).limit(1);
  if (!opts.includeDrafts) q = q.eq("is_published", true);
  const { data, error } = await q.maybeSingle<TopicRow>();
  if (error) throw error;
  return data ? mapTopicRowToPost(data) : null;
}

/** List topics (defaults to only published, newest first). */
export async function listTopics(
  opts: { includeDrafts?: boolean; limit?: number } = {}
): Promise<Post[]> {
  const sb = await supabaseServer();
  let q = sb
    .from("topics")
    .select(SELECT)
    .order("created_at", { ascending: false });
  if (!opts.includeDrafts) q = q.eq("is_published", true);
  if (opts.limit) q = q.limit(opts.limit);
  const { data, error } = await q;
  if (error) throw error;
  return (data as TopicRow[]).map(mapTopicRowToPost);
}

/** Narrow list by category. */
export async function listTopicsByCategory(
  category: Post["category"],
  opts: { includeDrafts?: boolean; limit?: number } = {}
): Promise<Post[]> {
  const sb = await supabaseServer();
  let q = sb
    .from("topics")
    .select(SELECT)
    .eq("category", category)
    .order("created_at", { ascending: false });
  if (!opts.includeDrafts) q = q.eq("is_published", true);
  if (opts.limit) q = q.limit(opts.limit);
  const { data, error } = await q;
  if (error) throw error;
  return (data as TopicRow[]).map(mapTopicRowToPost);
}

// ----------------- writes -----------------

// Input for creation (body_md is required by your table).
export type CreateTopicInput = {
  title: string;
  slug?: string;
  excerpt?: string;
  category: Post["category"];
  body_md: string;
  author_display?: string;
  is_published?: boolean;
  author_id?: string | null;
};

export async function createTopic(input: CreateTopicInput): Promise<Post> {
  const sb = await supabaseServer();

  const payload = {
    slug:
      input.slug && input.slug.trim()
        ? slugify(input.slug)
        : slugify(input.title),
    title: input.title,
    excerpt: input.excerpt ?? null,
    category: input.category,
    body_md: input.body_md,
    author_display: input.author_display ?? null,
    is_published: input.is_published ?? true,
    author_id: input.author_id ?? null,
    // created_at/updated_at: DB defaults
  };

  const { data, error } = await sb
    .from("topics")
    .insert(payload)
    .select(SELECT)
    .single();

  if (error) throw error;
  return mapTopicRowToPost(data as TopicRow);
}

export type UpdateTopicInput = Partial<Omit<CreateTopicInput, "body_md">> &
  Pick<TopicRow, "id"> & {
    body_md?: string;
  };

export async function updateTopic(input: UpdateTopicInput): Promise<Post> {
  const sb = await supabaseServer();

  const payload: Partial<TopicRow> = {
    slug: input.slug ? slugify(input.slug) : undefined,
    title: input.title,
    excerpt: input.excerpt ?? undefined,
    category: input.category,
    body_md: input.body_md,
    author_display: input.author_display,
    is_published: input.is_published,
    updated_at: new Date().toISOString(),
    author_id: input.author_id,
  };

  const { data, error } = await sb
    .from("topics")
    .update(payload)
    .eq("id", input.id)
    .select(SELECT)
    .single();

  if (error) throw error;
  return mapTopicRowToPost(data as TopicRow);
}

export async function deleteTopic(id: string): Promise<void> {
  const sb = await supabaseServer();
  const { error } = await sb.from("topics").delete().eq("id", id);
  if (error) throw error;
}
