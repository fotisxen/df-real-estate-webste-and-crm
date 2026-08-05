import { createClient } from "@/lib/supabase/server";
import { propertyImageUrl } from "@/lib/storage";
import Hero from "@/components/Hero";
import PropertyCard from "@/components/PropertyCard";
import Reveal from "@/components/Reveal";
import T from "@/components/T";
import type { Property } from "@/types/database";

export const revalidate = 60; // ISR: re-fetch at most once a minute

export default async function HomePage() {
  const supabase = createClient();

  const [{ data: featured }, { count: saleCount }, { count: rentCount }, { data: recentImagesRaw }] =
    await Promise.all([
      supabase
        .from("properties")
        .select("*")
        .eq("status", "available")
        .order("created_at", { ascending: false })
        .limit(6),
      supabase
        .from("properties")
        .select("id", { count: "exact", head: true })
        .eq("listing_type", "sale")
        .eq("status", "available"),
      supabase
        .from("properties")
        .select("id", { count: "exact", head: true })
        .eq("listing_type", "rent")
        .eq("status", "available"),
      supabase
        .from("property_images")
        .select("storage_path")
        .order("created_at", { ascending: false })
        .limit(8),
    ]);

  const properties = (featured ?? []) as Property[];
  const recentImages = (recentImagesRaw ?? []) as { storage_path: string }[];

  // Cover image per property (first image by position), fetched in one
  // batched query instead of N+1 per card.
  const propertyIds = properties.map((p) => p.id);
  const { data: coverImages } = propertyIds.length
    ? await supabase
        .from("property_images")
        .select("property_id, storage_path, position")
        .in("property_id", propertyIds)
        .order("position", { ascending: true })
    : { data: [] as { property_id: string; storage_path: string; position: number }[] };

  const coverByProperty = new Map<string, string>();
  for (const img of coverImages ?? []) {
    if (!coverByProperty.has(img.property_id)) {
      coverByProperty.set(img.property_id, propertyImageUrl(img.storage_path));
    }
  }

  const filmstripImages = (recentImages ?? []).map((i) => propertyImageUrl(i.storage_path));

  return (
    <>
      <Hero
        filmstripImages={filmstripImages}
        saleCount={saleCount ?? 0}
        rentCount={rentCount ?? 0}
      />

      <section className="container-content py-16 md:py-24">
        <Reveal className="mb-10 flex items-end justify-between">
          <h2 className="text-3xl md:text-4xl">
            <T k="home.recent" />
          </h2>
          <a href="/properties" className="font-mono text-xs uppercase tracking-wide text-clay hover:underline">
            <T k="home.viewAll" />
          </a>
        </Reveal>

        {properties.length === 0 ? (
          <p className="rounded-sm border border-dashed border-ink/20 p-10 text-center text-ink/50">
            <T k="home.empty.pre" />{" "}
            <a href="/admin/properties/new" className="underline">
              <T k="home.empty.link" />
            </a>
            .
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {properties.map((property, i) => (
              <Reveal key={property.id} delay={Math.min(i, 5) * 0.08}>
                <PropertyCard property={property} coverImageUrl={coverByProperty.get(property.id) ?? null} />
              </Reveal>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
