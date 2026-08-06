import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { propertyImageUrl } from "@/lib/storage";
import PropertyCard from "@/components/PropertyCard";
import Reveal from "@/components/Reveal";
import T from "@/components/T";
import type { Property } from "@/types/database";
import type { Metadata } from "next";

export const revalidate = 60;

async function getAreaProperties(region: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from("properties")
    .select("*")
    .eq("status", "available")
    .eq("published", true)
    .ilike("region", region)
    .order("created_at", { ascending: false });
  return (data ?? []) as Property[];
}

export async function generateMetadata({
  params,
}: {
  params: { region: string };
}): Promise<Metadata> {
  const region = decodeURIComponent(params.region);
  return {
    title: `Ακίνητα στην περιοχή ${region}`,
    description: `Ακίνητα προς πώληση και ενοικίαση στην περιοχή ${region}, Θεσσαλονίκη.`,
  };
}

export default async function AreaPage({ params }: { params: { region: string } }) {
  const region = decodeURIComponent(params.region);
  const properties = await getAreaProperties(region);

  const propertyIds = properties.map((p) => p.id);
  const supabase = createClient();
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

  const saleCount = properties.filter((p) => p.listing_type === "sale").length;
  const rentCount = properties.filter((p) => p.listing_type === "rent").length;
  const prices = properties.map((p) => p.price);
  const minPrice = prices.length ? Math.min(...prices) : null;
  const maxPrice = prices.length ? Math.max(...prices) : null;

  const formatPrice = (v: number) =>
    new Intl.NumberFormat("el-GR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(v);

  return (
    <section className="container-content py-16">
      <Link href="/areas" className="font-mono text-xs uppercase tracking-wide text-clay transition-colors hover:text-ink">
        <T k="areas.back" />
      </Link>

      <h1 className="mt-4 text-4xl md:text-5xl">{region}</h1>

      {properties.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-8 border-y border-ink/10 py-6 font-mono text-sm text-ink/70">
          <div>
            <span className="block text-2xl text-ink">{properties.length}</span>
            <span className="text-xs uppercase tracking-wide text-ink/50">
              <T k="areas.properties" />
            </span>
          </div>
          {saleCount > 0 && (
            <div>
              <span className="block text-2xl text-ink">{saleCount}</span>
              <span className="text-xs uppercase tracking-wide text-ink/50">
                <T k="areas.forSale" />
              </span>
            </div>
          )}
          {rentCount > 0 && (
            <div>
              <span className="block text-2xl text-ink">{rentCount}</span>
              <span className="text-xs uppercase tracking-wide text-ink/50">
                <T k="areas.forRent" />
              </span>
            </div>
          )}
          {minPrice !== null && maxPrice !== null && (
            <div>
              <span className="block text-2xl text-ink">
                {minPrice === maxPrice ? formatPrice(minPrice) : `${formatPrice(minPrice)} – ${formatPrice(maxPrice)}`}
              </span>
              <span className="text-xs uppercase tracking-wide text-ink/50">
                <T k="areas.priceRange" />
              </span>
            </div>
          )}
        </div>
      )}

      {properties.length === 0 ? (
        <p className="mt-16 rounded-sm border border-dashed border-ink/20 p-10 text-center text-ink/50">
          <T k="areas.notFound" />
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
