import { createClient } from "@/lib/supabase/server";
import { propertyImageUrl } from "@/lib/storage";
import { SITE_URL } from "@/lib/site";
import type { Property, PropertyImage } from "@/types/database";

// Public XML feed for Spitogatos to ingest. There is no public "push a
// listing" API for third-party sites — Spitogatos (like other Greek
// portals) works by polling a feed URL you register with them on your
// agency account. This route is that feed.
//
// Once you have a Spitogatos professional/agency account, give them:
//   https://your-domain.gr/feeds/spitogatos.xml
// and confirm the exact field mapping they expect for your account tier —
// the structure below covers the fields available in this schema, but
// Spitogatos may want specific category/attribute codes on their end
// that only show up once the feed is registered with their team.

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const supabase = createClient();

  const { data: properties } = await supabase
    .from("properties")
    .select("*")
    .eq("sync_to_spitogatos", true)
    .eq("status", "available")
    .eq("published", true);

  const list = (properties ?? []) as Property[];
  const ids = list.map((p) => p.id);

  const { data: images } = ids.length
    ? await supabase
        .from("property_images")
        .select("*")
        .in("property_id", ids)
        .order("position", { ascending: true })
    : { data: [] as PropertyImage[] };

  const imagesByProperty = new Map<string, PropertyImage[]>();
  for (const img of (images ?? []) as PropertyImage[]) {
    const arr = imagesByProperty.get(img.property_id) ?? [];
    arr.push(img);
    imagesByProperty.set(img.property_id, arr);
  }

  const items = list
    .map((p) => {
      const propertyImages = imagesByProperty.get(p.id) ?? [];
      const imageTags = propertyImages
        .map((img) => `<image>${escapeXml(propertyImageUrl(img.storage_path))}</image>`)
        .join("");

      return `
  <property>
    <id>${p.id}</id>
    <title>${escapeXml(p.title)}</title>
    <description>${escapeXml(p.description ?? "")}</description>
    <type>${p.category}${p.subcategory ? `/${p.subcategory}` : ""}</type>
    <transaction>${p.listing_type}</transaction>
    <price>${p.price}</price>
    <area>${p.area_sqm ?? ""}</area>
    <bedrooms>${p.bedrooms ?? ""}</bedrooms>
    <region>${escapeXml(p.region ?? "")}</region>
    <address>${escapeXml(p.address ?? "")}</address>
    <url>${SITE_URL}/properties/${p.slug}</url>
    <images>${imageTags}</images>
  </property>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<properties>${items}\n</properties>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "X-Robots-Tag": "noindex",
    },
  });
}
