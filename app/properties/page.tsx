import { createClient } from "@/lib/supabase/server";
import { propertyImageUrl } from "@/lib/storage";
import PropertyCard from "@/components/PropertyCard";
import PropertiesToolbar from "@/components/PropertiesToolbar";
import Reveal from "@/components/Reveal";
import T from "@/components/T";
import type { Property } from "@/types/database";
import type { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Ακίνητα",
  description: "Όλα τα διαθέσιμα ακίνητα προς πώληση και ενοικίαση.",
};

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: { listing_type?: string; category?: string; region?: string };
}) {
  const supabase = createClient();

  let query = supabase
    .from("properties")
    .select("*")
    .eq("status", "available")
    .eq("published", true)
    .order("created_at", { ascending: false });

  if (searchParams.listing_type) {
    query = query.eq("listing_type", searchParams.listing_type);
  }
  if (searchParams.category) {
    query = query.eq("category", searchParams.category);
  }
  if (searchParams.region) {
    query = query.ilike("region", `%${searchParams.region}%`);
  }

  const { data } = await query;
  const properties = (data ?? []) as Property[];

  const propertyIds = properties.map((p) => p.id);
  const { data: images } = propertyIds.length
    ? await supabase
        .from("property_images")
        .select("property_id, storage_path")
        .in("property_id", propertyIds)
        .order("position", { ascending: true })
    : { data: [] as { property_id: string; storage_path: string }[] };

  const coverByProperty = new Map<string, string>();
  for (const img of images ?? []) {
    if (!coverByProperty.has(img.property_id)) {
      coverByProperty.set(img.property_id, propertyImageUrl(img.storage_path));
    }
  }

  return (
    <section className="container-content py-16">
      <PropertiesToolbar
        listingType={searchParams.listing_type ?? ""}
        category={searchParams.category ?? ""}
        region={searchParams.region ?? ""}
      />

      {properties.length === 0 ? (
        <p className="mt-16 rounded-sm border border-dashed border-ink/20 p-10 text-center text-ink/50">
          <T k="properties.empty" />
        </p>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((property, i) => (
            <Reveal key={property.id} delay={Math.min(i, 5) * 0.06}>
              <PropertyCard property={property} coverImageUrl={coverByProperty.get(property.id) ?? null} />
            </Reveal>
          ))}
        </div>
      )}
    </section>
  );
}
