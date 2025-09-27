// app/sitemap.ts
import type { MetadataRoute } from "next";
import { supabaseServer } from "@/server/db/supabase-server";

export const revalidate = 3600; // rebuild sitemap at most once per hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "https://kunskapsarvet.se";

  // Static routes you want indexed
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/om`, changeFrequency: "yearly", priority: 0.5 },
    { url: `${base}/login`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/register`, changeFrequency: "yearly", priority: 0.2 },
  ];

  // Dynamic routes from Supabase
  const supabase = await supabaseServer();
  const { data: topics, error } = await supabase
    .from("topics")
    .select("slug, updated_at")
    .eq("is_published", true)
    .order("updated_at", { ascending: false })
    .limit(5000);

  if (error) {
    // fail soft: still return static routes so sitemap isn't empty
    return staticRoutes;
  }

  const topicRoutes: MetadataRoute.Sitemap = (topics ?? []).map((t) => ({
    url: `${base}/post/${t.slug}`,
    lastModified: t.updated_at ?? undefined,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...topicRoutes];
}
