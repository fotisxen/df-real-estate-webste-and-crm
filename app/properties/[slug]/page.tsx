import { createClient } from "@/lib/supabase/server";
import { propertyImageUrl } from "@/lib/storage";
import { CATEGORIES, DETAIL_GROUPS, subcategoriesFor, hasValue } from "@/lib/propertyFields";
import type { Property, PropertyImage } from "@/types/database";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import T from "@/components/T";
import Reveal from "@/components/Reveal";
import PropertyGallery from "@/components/PropertyGallery";
import { SITE_URL } from "@/lib/site";


const categoryLabel = Object.fromEntries(CATEGORIES.map((c) => [c.value, c.label]));

function fieldValueLabel(value: unknown) {
  if (value === true) return "Ναι";
  return String(value);
}

export const revalidate = 60;

async function getProperty(slug: string) {
  const supabase = createClient();
  const { data: propertyRaw } = await supabase
    .from("properties")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (!propertyRaw) return null;
  const property = propertyRaw as Property;

  const { data: images } = await supabase
    .from("property_images")
    .select("*")
    .eq("property_id", property.id)
    .order("position", { ascending: true });

  return { property, images: (images ?? []) as PropertyImage[] };
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const result = await getProperty(params.slug);
  if (!result) return {};

  const { property, images } = result;
  const image = images[0] ? propertyImageUrl(images[0].storage_path) : undefined;

  return {
    title: property.title,
    description: property.description?.slice(0, 155) ?? undefined,
    openGraph: {
      title: property.title,
      description: property.description?.slice(0, 155) ?? undefined,
      images: image ? [image] : undefined,
    },
  };
}

const listingTypeLabel: Record<Property["listing_type"], string> = {
  sale: "Πώληση",
  rent: "Ενοικίαση",
};

export default async function PropertyPage({ params }: { params: { slug: string } }) {
  const result = await getProperty(params.slug);
  if (!result) notFound();
  const { property, images } = result;

  // schema.org structured data so Google can render this as a rich
  // real-estate result. See https://schema.org/RealEstateListing
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: property.title,
    description: property.description ?? undefined,
    url: `${SITE_URL}/properties/${property.slug}`,
    image: images.map((i) => propertyImageUrl(i.storage_path)),
    offers: {
      "@type": "Offer",
      price: property.price,
      priceCurrency: "EUR",
      availability:
        property.status === "available"
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
    address: property.address
      ? { "@type": "PostalAddress", streetAddress: property.address, addressRegion: property.region ?? undefined, addressCountry: "GR" }
      : undefined,
  };

  return (
    <article className="container-content py-12">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <p className="font-mono text-xs uppercase tracking-wide text-clay">
        {listingTypeLabel[property.listing_type]} · {categoryLabel[property.category]}
        {property.subcategory &&
          ` · ${subcategoriesFor(property.category).find((s) => s.value === property.subcategory)?.label ?? property.subcategory}`}
        {property.region ? ` · ${property.region}` : ""}
      </p>
      <h1 className="mt-2 max-w-3xl text-4xl md:text-5xl">{property.title}</h1>
      <div className="mt-1 flex flex-wrap items-center gap-x-3 font-mono text-xs text-ink/40">
        {property.code && <span>Κωδικός: {property.code}</span>}
        {property.address && <span>{property.address}</span>}
      </div>

      <PropertyGallery
        images={images.map((img) => ({
          src: propertyImageUrl(img.storage_path),
          alt: img.alt_text ?? property.title,
        }))}
      />

      <div className="mt-10 grid gap-10 md:grid-cols-[2fr,1fr]">
        <div>
          {property.description && (
            <p className="whitespace-pre-line leading-relaxed text-ink/80">{property.description}</p>
          )}

          {DETAIL_GROUPS.map((group) => {
            const entries = group.fields.filter((f) => hasValue(property.details?.[f.key]));
            const isSpacesGroup = group.title === "Χώροι";
            const coreEntries = isSpacesGroup
              ? [
                  ...(hasValue(property.bedrooms) ? [{ key: "__bedrooms", label: "Υπνοδωμάτια", value: String(property.bedrooms) }] : []),
                  ...(hasValue(property.bathrooms) ? [{ key: "__bathrooms", label: "Μπάνια", value: String(property.bathrooms) }] : []),
                ]
              : [];
            if (entries.length === 0 && coreEntries.length === 0) return null;
            return (
              <Reveal key={group.title} className="mt-8 border-t border-ink/10 pt-6">
                <h2 className="font-mono text-xs uppercase tracking-wide text-clay">{group.title}</h2>
                <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 font-mono text-sm text-ink/70 sm:grid-cols-3">
                  {coreEntries.map((f) => (
                    <div key={f.key} className="flex items-baseline gap-2">
                      <dt className="shrink-0">{f.label}:</dt>
                      <dd className="text-ink">{f.value}</dd>
                    </div>
                  ))}
                  {entries.map((f) => (
                    <div key={f.key} className="flex items-baseline gap-2">
                      <dt className="shrink-0">{f.label}:</dt>
                      <dd className="text-ink">
                        {fieldValueLabel(property.details[f.key])}
                        {f.unit && property.details[f.key] !== true ? ` ${f.unit}` : ""}
                      </dd>
                    </div>
                  ))}
                </dl>
              </Reveal>
            );
          })}
        </div>

        <aside className="h-fit rounded-sm border border-ink/10 bg-limestone2 p-6">
          <p className="font-mono text-2xl">
            {new Intl.NumberFormat("el-GR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(
              property.price
            )}
            {property.listing_type === "rent" && <span className="text-sm text-ink/50"> / μήνα</span>}
            {property.price_negotiable && <span className="ml-2 text-sm text-clay">Συζητήσιμη</span>}
          </p>
          <dl className="mt-6 space-y-2 font-mono text-sm text-ink/70">
            {hasValue(property.common_charges_monthly) && (
              <div className="flex justify-between">
                <dt>Κοινόχρηστα</dt>
                <dd>€{property.common_charges_monthly}/μήνα</dd>
              </div>
            )}
            {hasValue(property.area_sqm) && (
              <div className="flex justify-between">
                <dt>Εμβαδόν</dt>
                <dd>{property.area_sqm} m²</dd>
              </div>
            )}
            {hasValue(property.plot_area_sqm) && (
              <div className="flex justify-between">
                <dt>Εμβαδόν οικοπέδου</dt>
                <dd>{property.plot_area_sqm} m²</dd>
              </div>
            )}
            {hasValue(property.bedrooms) && (
              <div className="flex justify-between">
                <dt>Υπνοδωμάτια</dt>
                <dd>{property.bedrooms}</dd>
              </div>
            )}
            {hasValue(property.bathrooms) && (
              <div className="flex justify-between">
                <dt>Μπάνια</dt>
                <dd>{property.bathrooms}</dd>
              </div>
            )}
            {hasValue(property.year_built) && (
              <div className="flex justify-between">
                <dt>Έτος κατασκευής</dt>
                <dd>{property.year_built}</dd>
              </div>
            )}
            {hasValue(property.available_from) && (
              <div className="flex justify-between">
                <dt>Διαθέσιμο από</dt>
                <dd>{new Date(property.available_from!).toLocaleDateString("el-GR")}</dd>
              </div>
            )}
            {property.currently_rented && (
              <div className="flex justify-between">
                <dt>Μισθωμένο</dt>
                <dd>Ναι</dd>
              </div>
            )}
          </dl>
          <a
            href="/contact"
            className="mt-6 block rounded-full bg-ink py-3 text-center font-mono text-xs uppercase tracking-wide text-limestone transition-colors hover:bg-clay"
          >
            <T k="contact.requestInfo" />
          </a>
        </aside>
      </div>
    </article>
  );
}
