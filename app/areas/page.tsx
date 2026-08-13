import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { effectiveArea } from "@/lib/areas";
import Reveal from "@/components/Reveal";
import T from "@/components/T";
import type { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Περιοχές",
  description:
    "Περιοχές της Θεσσαλονίκης όπου έχουμε ενεργές καταχωρήσεις ακινήτων προς πώληση και ενοικίαση.",
};

export default async function AreasPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from("properties")
    .select("region, municipality, neighborhood")
    .eq("status", "available")
    .eq("published", true);

  const rows = (data ?? []) as { region: string | null; municipality: string | null; neighborhood: string | null }[];

  const byRegion = new Map<string, number>();
  for (const row of rows) {
    const area = effectiveArea(row);
    if (!area) continue;
    byRegion.set(area, (byRegion.get(area) ?? 0) + 1);
  }

  const areas = Array.from(byRegion.entries())
    .map(([region, count]) => ({ region, count }))
    .sort((a, b) => b.count - a.count || a.region.localeCompare(b.region, "el"));

  return (
    <section className="container-content py-16">
      <p className="font-mono text-xs uppercase tracking-wide text-clay">
        <T k="areas.kicker" />
      </p>
      <h1 className="mt-2 max-w-2xl text-4xl md:text-5xl">
        <T k="areas.title" />
      </h1>
      <p className="mt-4 max-w-xl text-ink/70">
        <T k="areas.subtitle" />
      </p>

      {areas.length === 0 ? (
        <p className="mt-16 rounded-sm border border-dashed border-ink/20 p-10 text-center text-ink/50">
          <T k="areas.empty" />
        </p>
      ) : (
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {areas.map((area, i) => (
            <Reveal key={area.region} delay={Math.min(i, 5) * 0.06}>
              <Link
                href={`/areas/${encodeURIComponent(area.region)}`}
                className="group block h-full rounded-sm border border-ink/10 bg-limestone2 p-6 transition-shadow hover:shadow-xl"
              >
                <h2 className="font-display text-2xl leading-snug">{area.region}</h2>
                <p className="mt-2 font-mono text-xs uppercase tracking-wide text-olive">
                  {area.count} <T k={area.count === 1 ? "areas.property" : "areas.properties"} />
                </p>
                <p className="mt-4 font-mono text-xs uppercase tracking-wide text-aegean transition-colors group-hover:text-clay">
                  <T k="areas.viewProperties" />
                </p>
              </Link>
            </Reveal>
          ))}
        </div>
      )}
    </section>
  );
}
