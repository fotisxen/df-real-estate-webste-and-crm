"use client";

import { CATEGORIES } from "@/lib/propertyFields";
import { useLanguage } from "@/lib/i18n";

const listingTypes = ["", "sale", "rent"] as const;

export default function PropertiesToolbar({
  listingType,
  category,
  region,
}: {
  listingType: string;
  category: string;
  region: string;
}) {
  const { lang, t } = useLanguage();

  function buildQs(overrides: { listing_type?: string; category?: string }) {
    const params = new URLSearchParams();
    const nextListingType = overrides.listing_type ?? listingType;
    const nextCategory = overrides.category ?? category;
    if (nextListingType) params.set("listing_type", nextListingType);
    if (nextCategory) params.set("category", nextCategory);
    if (region) params.set("region", region);
    return params.toString();
  }

  return (
    <>
      <h1 className="text-4xl md:text-5xl">{t("properties.title")}</h1>

      <div className="mt-8 flex flex-wrap gap-3 font-mono text-xs uppercase tracking-wide">
        {listingTypes.map((v) => {
          const qs = buildQs({ listing_type: v });
          return (
            <a
              key={v}
              href={qs ? `/properties?${qs}` : "/properties"}
              className={`rounded-full border px-4 py-2 transition-colors ${
                listingType === v ? "border-ink bg-ink text-limestone" : "border-ink/20 hover:border-ink"
              }`}
            >
              {v === "" ? t("properties.all") : t(v === "sale" ? "nav.sale" : "nav.rent")}
            </a>
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap gap-3 font-mono text-xs uppercase tracking-wide">
        {[{ value: "", label: t("properties.allCategories") }, ...CATEGORIES.map((c) => ({ value: c.value, label: lang === "en" ? c.labelEn : c.label }))].map(
          (c) => {
            const qs = buildQs({ category: c.value });
            return (
              <a
                key={c.value}
                href={qs ? `/properties?${qs}` : "/properties"}
                className={`rounded-full border px-4 py-2 transition-colors ${
                  category === c.value ? "border-ink bg-ink text-limestone" : "border-ink/20 hover:border-ink"
                }`}
              >
                {c.label}
              </a>
            );
          }
        )}
      </div>

      <form className="mt-3 flex max-w-xs gap-2 font-mono text-xs uppercase tracking-wide">
        <input type="hidden" name="listing_type" value={listingType} />
        <input type="hidden" name="category" value={category} />
        <input
          type="text"
          name="region"
          defaultValue={region}
          placeholder={t("search.regionPlaceholder")}
          className="w-full rounded-full border border-ink/20 bg-limestone px-4 py-2 normal-case tracking-normal text-ink outline-none focus:border-clay"
        />
        <button type="submit" className="shrink-0 rounded-full border border-ink/20 px-4 py-2 hover:border-ink">
          {t("search.submit")}
        </button>
      </form>
    </>
  );
}
