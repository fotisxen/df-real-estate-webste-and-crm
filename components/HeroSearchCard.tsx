"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CATEGORIES } from "@/lib/propertyFields";
import { useLanguage } from "@/lib/i18n";

export default function HeroSearchCard() {
  const router = useRouter();
  const { lang, t } = useLanguage();
  const [listingType, setListingType] = useState<"sale" | "rent">("sale");
  const [category, setCategory] = useState("");
  const [region, setRegion] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    params.set("listing_type", listingType);
    if (category) params.set("category", category);
    if (region) params.set("region", region);
    router.push(`/properties?${params.toString()}`);
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
      onSubmit={handleSubmit}
      className="relative z-20 mx-auto -mt-10 flex w-full max-w-4xl flex-col gap-4 rounded-sm border border-ink/10 bg-limestone p-5 shadow-2xl md:-mt-14 md:flex-row md:items-end md:gap-3 md:p-6"
    >
      <div className="flex gap-2 font-mono text-xs uppercase tracking-wide">
        {(["sale", "rent"] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setListingType(v)}
            className={`rounded-full border px-4 py-2 transition-colors ${
              listingType === v ? "border-ink bg-ink text-limestone" : "border-ink/20 hover:border-ink"
            }`}
          >
            {t(v === "sale" ? "nav.sale" : "nav.rent")}
          </button>
        ))}
      </div>

      <label className="flex-1 font-mono text-xs uppercase tracking-wide text-ink/60">
        {t("search.category")}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="mt-1 w-full rounded-sm border border-ink/20 bg-limestone2 px-3 py-2 font-body text-base normal-case tracking-normal text-ink"
        >
          <option value="">{t("search.categoryAny")}</option>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {lang === "en" ? c.labelEn : c.label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex-1 font-mono text-xs uppercase tracking-wide text-ink/60">
        {t("search.region")}
        <input
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          placeholder={t("search.regionPlaceholder")}
          className="mt-1 w-full rounded-sm border border-ink/20 bg-limestone2 px-3 py-2 font-body text-base normal-case tracking-normal text-ink"
        />
      </label>

      <button
        type="submit"
        className="rounded-full bg-clay px-8 py-3 font-mono text-xs uppercase tracking-wide text-limestone transition-colors hover:bg-ink"
      >
        {t("search.submit")}
      </button>
    </motion.form>
  );
}
