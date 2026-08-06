"use client";

import Image from "next/image";
import Link from "next/link";
import type { Property } from "@/types/database";
import { CATEGORIES, subcategoriesFor } from "@/lib/propertyFields";
import { useLanguage } from "@/lib/i18n";

function formatPrice(price: number, listingType: Property["listing_type"], perMonth: string) {
  const formatted = new Intl.NumberFormat("el-GR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(price);
  return listingType === "rent" ? `${formatted} ${perMonth}` : formatted;
}

export default function PropertyCard({
  property,
  coverImageUrl,
}: {
  property: Property;
  coverImageUrl: string | null;
}) {
  const { lang, t } = useLanguage();

  const category = CATEGORIES.find((c) => c.value === property.category);
  const subcategory = property.subcategory
    ? subcategoriesFor(property.category).find((s) => s.value === property.subcategory)
    : null;
  const typeLabel = subcategory ? (lang === "en" ? subcategory.labelEn : subcategory.label) : lang === "en" ? category?.labelEn : category?.label;

  return (
    <Link
      href={`/properties/${property.slug}`}
      className="group block overflow-hidden rounded-sm bg-limestone2 transition-shadow hover:shadow-xl"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-ink/10">
        {coverImageUrl ? (
          <Image
            src={coverImageUrl}
            alt={property.title}
            fill
            sizes="(min-width: 768px) 33vw, 100vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center font-mono text-xs text-ink/40">
            {t("properties.noPhoto")}
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-ink/85 px-3 py-1 font-mono text-[10px] uppercase tracking-wide text-limestone">
          {t(property.listing_type === "sale" ? "nav.sale" : "nav.rent")}
        </span>
      </div>
      <div className="p-5">
        <p className="font-mono text-[11px] uppercase tracking-wide text-olive">
          {typeLabel}
          {property.region ? ` · ${property.region}` : ""}
        </p>
        <h3 className="mt-1 font-display text-xl leading-snug">{property.title}</h3>
        <div className="mt-3 flex items-center justify-between">
          <span className="font-mono text-sm">
            {formatPrice(property.price, property.listing_type, t("properties.perMonth"))}
          </span>
          {property.area_sqm ? (
            <span className="font-mono text-xs text-ink/50">{property.area_sqm} m²</span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
