import { createClient } from "@/lib/supabase/server";
import { SITE_URL } from "@/lib/site";
import { getAllArticles } from "@/lib/contentful";
import { effectiveArea } from "@/lib/areas";
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient();
  const { data } = await supabase.from("properties").select("slug, updated_at");
  const properties = (data ?? []) as { slug: string; updated_at: string }[];
  const articles = await getAllArticles();

  const { data: regionRows } = await supabase
    .from("properties")
    .select("region, municipality, neighborhood")
    .eq("status", "available")
    .eq("published", true);
  const regions = new Set<string>();
  for (const row of (regionRows ?? []) as { region: string | null; municipality: string | null; neighborhood: string | null }[]) {
    const area = effectiveArea(row);
    if (area) regions.add(area);
  }

  const base = SITE_URL;

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "properties",
    "areas",
    "services",
    "valuation",
    "blog",
    "contact",
  ].map((route) => ({
    url: `${base}/${route}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: route === "" ? 1 : 0.9,
  }));

  const propertyRoutes: MetadataRoute.Sitemap = properties.map((p) => ({
    url: `${base}/properties/${p.slug}`,
    lastModified: p.updated_at,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const areaRoutes: MetadataRoute.Sitemap = Array.from(regions).map((region) => ({
    url: `${base}/areas/${encodeURIComponent(region)}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const blogRoutes: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${base}/blog/${a.slug}`,
    lastModified: a.date || new Date(),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...propertyRoutes, ...areaRoutes, ...blogRoutes];
}
