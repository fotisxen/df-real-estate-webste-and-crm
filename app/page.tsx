import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { propertyImageUrl } from "@/lib/storage";
import { getAllArticles } from "@/lib/contentful";
import { effectiveArea } from "@/lib/areas";
import Hero from "@/components/Hero";
import PropertyCard from "@/components/PropertyCard";
import Reveal from "@/components/Reveal";
import T from "@/components/T";
import type { Property } from "@/types/database";

export const revalidate = 60; // ISR: re-fetch at most once a minute

// Curated mood imagery for the hero filmstrip — deliberately not photos of
// our own listings. Houses, interiors, and gardens from Unsplash (free to
// use), swapped for a fresh set whenever the vibe needs refreshing.
const MOOD_FILMSTRIP = [
  "https://images.unsplash.com/photo-1657346088167-b982455bf29a?w=800&q=75",
  "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800&q=75",
  "https://images.unsplash.com/photo-1660361338517-8c8fbb3ac264?w=800&q=75",
  "https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=800&q=75",
  "https://images.unsplash.com/photo-1718893389568-22a2a039998c?w=800&q=75",
  "https://images.unsplash.com/photo-1632829882891-5047ccc421bc?w=800&q=75",
  "https://images.unsplash.com/photo-1703783028657-5905a1662aa8?w=800&q=75",
  "https://images.unsplash.com/photo-1633505899118-4ca6bd143043?w=800&q=75",
  "https://images.unsplash.com/photo-1667238002143-b5e117168e98?w=800&q=75",
];

export default async function HomePage() {
  const supabase = createClient();

  const [
    { data: featured },
    { count: saleCount },
    { count: rentCount },
    { data: regionRows },
    articles,
  ] = await Promise.all([
    supabase
      .from("properties")
      .select("*")
      .eq("status", "available")
      .order("created_at", { ascending: false })
      .limit(9),
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
      .from("properties")
      .select("region, municipality, neighborhood")
      .eq("status", "available")
      .eq("published", true),
    getAllArticles(),
  ]);

  const properties = (featured ?? []) as Property[];

  const areaCounts = new Map<string, number>();
  for (const row of (regionRows ?? []) as { region: string | null; municipality: string | null; neighborhood: string | null }[]) {
    const area = effectiveArea(row);
    if (!area) continue;
    areaCounts.set(area, (areaCounts.get(area) ?? 0) + 1);
  }
  const topAreas = Array.from(areaCounts.entries())
    .map(([region, count]) => ({ region, count }))
    .sort((a, b) => b.count - a.count);

  const latestArticles = articles.slice(0, 3);

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

  return (
    <>
      <Hero
        filmstripImages={MOOD_FILMSTRIP}
        saleCount={saleCount ?? 0}
        rentCount={rentCount ?? 0}
      />

      <Reveal className="relative h-[60vh] min-h-[380px] w-full overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1657346088167-b982455bf29a?w=1600&q=80"
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/20 to-transparent" />
        <div className="container-content absolute inset-0 flex flex-col justify-end pb-16">
          <p className="font-mono text-xs uppercase tracking-wide text-limestone/80">
            <T k="home.mood1.kicker" />
          </p>
          <h2 className="mt-3 max-w-xl font-display text-3xl leading-snug text-limestone md:text-5xl">
            <T k="home.mood1.title" />
          </h2>
          <p className="mt-4 max-w-md text-limestone/80">
            <T k="home.mood1.subtitle" />
          </p>
        </div>
      </Reveal>

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

      <section className="border-t border-ink/10 bg-limestone2/60">
        <div className="container-content py-16 md:py-24">
          <Reveal>
            <h2 className="text-3xl md:text-4xl">
              <T k="home.services.title" />
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {(
              [
                { href: "/valuation?purpose=sale", titleKey: "home.services.sell.title", descKey: "home.services.sell.desc" },
                { href: "/valuation?purpose=rent", titleKey: "home.services.rent.title", descKey: "home.services.rent.desc" },
                { href: "/valuation", titleKey: "home.services.valuation.title", descKey: "home.services.valuation.desc" },
              ] as const
            ).map((item, i) => (
              <Reveal key={item.titleKey} delay={i * 0.08}>
                <Link
                  href={item.href}
                  className="group block h-full rounded-sm border border-ink/10 bg-limestone p-6 transition-shadow hover:shadow-xl"
                >
                  <h3 className="font-display text-xl leading-snug">
                    <T k={item.titleKey} />
                  </h3>
                  <p className="mt-2 text-sm text-ink/70">
                    <T k={item.descKey} />
                  </p>
                  <span className="mt-4 block font-mono text-xs uppercase tracking-wide text-aegean transition-colors group-hover:text-clay">
                    <T k="services.cta" />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {topAreas.length > 0 && (
        <section className="container-content py-16 md:py-24">
          <Reveal className="mb-10 flex items-end justify-between">
            <h2 className="text-3xl md:text-4xl">
              <T k="home.areas.title" />
            </h2>
            <a href="/areas" className="font-mono text-xs uppercase tracking-wide text-clay hover:underline">
              <T k="home.areas.viewAll" />
            </a>
          </Reveal>
          <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4">
            {topAreas.map((area, i) => (
              <Reveal key={area.region} delay={Math.min(i, 5) * 0.06} className="shrink-0 snap-start">
                <Link
                  href={`/areas/${encodeURIComponent(area.region)}`}
                  className="group flex h-36 w-40 flex-col items-center justify-center rounded-sm border border-ink/10 bg-limestone2 p-4 text-center transition-shadow hover:shadow-xl"
                >
                  <span className="line-clamp-3 font-display text-lg leading-snug">{area.region}</span>
                  <span className="mt-1 block font-mono text-xs uppercase tracking-wide text-ink/50">
                    {area.count} <T k={area.count === 1 ? "areas.property" : "areas.properties"} />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      <Reveal className="relative h-[46vh] min-h-[320px] w-full overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=1600&q=80"
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-ink/50" />
        <div className="container-content absolute inset-0 flex flex-col items-center justify-center text-center">
          <h2 className="max-w-lg font-display text-3xl leading-snug text-limestone md:text-4xl">
            <T k="home.mood2.title" />
          </h2>
          <p className="mt-4 max-w-sm text-limestone/80">
            <T k="home.mood2.subtitle" />
          </p>
          <Link
            href="/contact"
            className="mt-8 rounded-full bg-limestone px-8 py-3 font-mono text-xs uppercase tracking-wide text-ink transition-colors hover:bg-clay hover:text-limestone"
          >
            <T k="home.mood2.cta" />
          </Link>
        </div>
      </Reveal>

      {latestArticles.length > 0 && (
        <section className="border-t border-ink/10 bg-limestone2/60">
          <div className="container-content py-16 md:py-24">
            <Reveal className="mb-10 flex items-end justify-between">
              <h2 className="text-3xl md:text-4xl">
                <T k="home.blog.title" />
              </h2>
              <a href="/blog" className="font-mono text-xs uppercase tracking-wide text-clay hover:underline">
                <T k="home.blog.viewAll" />
              </a>
            </Reveal>
            <div className="grid gap-6 sm:grid-cols-3">
              {latestArticles.map((article, i) => (
                <Reveal key={article.slug} delay={i * 0.08}>
                  <Link
                    href={`/blog/${article.slug}`}
                    className="group block h-full rounded-sm border border-ink/10 bg-limestone p-6 transition-shadow hover:shadow-xl"
                  >
                    {article.category && (
                      <p className="font-mono text-[11px] uppercase tracking-wide text-olive">
                        {article.category}
                      </p>
                    )}
                    <h3 className="mt-1 font-display text-xl leading-snug">{article.title}</h3>
                    {article.excerpt && (
                      <p className="mt-2 line-clamp-2 text-sm text-ink/70">{article.excerpt}</p>
                    )}
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
