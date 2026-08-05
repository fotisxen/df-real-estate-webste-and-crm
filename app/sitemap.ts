import { createClient } from "@/lib/supabase/server";
import { SITE_URL } from "@/lib/site";
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient();
  const { data } = await supabase.from("properties").select("slug, updated_at");
  const properties = (data ?? []) as { slug: string; updated_at: string }[];

  const base = SITE_URL;

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/properties`, changeFrequency: "daily", priority: 0.9 },
  ];

  const propertyRoutes: MetadataRoute.Sitemap = properties.map((p) => ({
    url: `${base}/properties/${p.slug}`,
    lastModified: p.updated_at,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...propertyRoutes];
}
