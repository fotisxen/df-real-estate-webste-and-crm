"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { useLanguage } from "@/lib/i18n";
import { CATEGORIES } from "@/lib/propertyFields";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function ValuationForm() {
  const { lang, t } = useLanguage();
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const searchParams = useSearchParams();
  const initialPurpose = searchParams.get("purpose") === "rent" ? "rent" : searchParams.get("purpose") === "sale" ? "sale" : "";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const data = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;

    try {
      const res = await fetch("/api/valuation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      setStatus("sent");
      e.currentTarget.reset();
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="container-content grid gap-12 py-20 md:grid-cols-2 md:gap-20 md:py-28">
      <motion.div initial="hidden" animate="show" custom={0} variants={fadeUp}>
        <motion.p
          initial="hidden"
          animate="show"
          custom={0}
          variants={fadeUp}
          className="font-mono text-xs uppercase tracking-wide text-clay"
        >
          {t("valuation.kicker")}
        </motion.p>
        <motion.h1
          initial="hidden"
          animate="show"
          custom={1}
          variants={fadeUp}
          className="mt-3 text-4xl leading-tight md:text-5xl"
        >
          {t("valuation.title")}
        </motion.h1>
        <motion.p
          initial="hidden"
          animate="show"
          custom={2}
          variants={fadeUp}
          className="mt-5 max-w-sm text-ink/70"
        >
          {t("valuation.subtitle")}
        </motion.p>
      </motion.div>

      <motion.form
        initial="hidden"
        animate="show"
        custom={1}
        variants={fadeUp}
        onSubmit={handleSubmit}
        className="rounded-sm border border-ink/10 bg-limestone2 p-8"
      >
        <label className="mb-4 block font-mono text-xs uppercase tracking-wide text-ink/60">
          {t("contact.name")}
          <input
            name="name"
            type="text"
            required
            className="mt-1 w-full rounded-sm border border-ink/20 bg-limestone px-3 py-2 font-body text-base normal-case tracking-normal text-ink outline-none transition-colors focus:border-clay"
          />
        </label>

        <label className="mb-4 block font-mono text-xs uppercase tracking-wide text-ink/60">
          {t("contact.email")}
          <input
            name="email"
            type="email"
            required
            className="mt-1 w-full rounded-sm border border-ink/20 bg-limestone px-3 py-2 font-body text-base normal-case tracking-normal text-ink outline-none transition-colors focus:border-clay"
          />
        </label>

        <label className="mb-4 block font-mono text-xs uppercase tracking-wide text-ink/60">
          {t("contact.phone")}
          <input
            name="phone"
            type="tel"
            className="mt-1 w-full rounded-sm border border-ink/20 bg-limestone px-3 py-2 font-body text-base normal-case tracking-normal text-ink outline-none transition-colors focus:border-clay"
          />
        </label>

        <label className="mb-4 block font-mono text-xs uppercase tracking-wide text-ink/60">
          {t("valuation.purpose")}
          <select
            name="purpose"
            required
            defaultValue={initialPurpose}
            className="mt-1 w-full rounded-sm border border-ink/20 bg-limestone px-3 py-2 font-body text-base normal-case tracking-normal text-ink outline-none transition-colors focus:border-clay"
          >
            <option value="" disabled>
              —
            </option>
            <option value="sale">{t("valuation.purposeSale")}</option>
            <option value="rent">{t("valuation.purposeRent")}</option>
          </select>
        </label>

        <label className="mb-4 block font-mono text-xs uppercase tracking-wide text-ink/60">
          {t("valuation.category")}
          <select
            name="category"
            required
            defaultValue=""
            className="mt-1 w-full rounded-sm border border-ink/20 bg-limestone px-3 py-2 font-body text-base normal-case tracking-normal text-ink outline-none transition-colors focus:border-clay"
          >
            <option value="" disabled>
              —
            </option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {lang === "en" ? c.labelEn : c.label}
              </option>
            ))}
          </select>
        </label>

        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="block font-mono text-xs uppercase tracking-wide text-ink/60">
            {t("valuation.region")}
            <input
              name="region"
              type="text"
              required
              className="mt-1 w-full rounded-sm border border-ink/20 bg-limestone px-3 py-2 font-body text-base normal-case tracking-normal text-ink outline-none transition-colors focus:border-clay"
            />
          </label>
          <label className="block font-mono text-xs uppercase tracking-wide text-ink/60">
            {t("valuation.area")}
            <input
              name="area_sqm"
              type="number"
              min={0}
              className="mt-1 w-full rounded-sm border border-ink/20 bg-limestone px-3 py-2 font-body text-base normal-case tracking-normal text-ink outline-none transition-colors focus:border-clay"
            />
          </label>
        </div>

        <label className="mb-2 block font-mono text-xs uppercase tracking-wide text-ink/60">
          {t("valuation.notes")}
          <textarea
            name="notes"
            rows={4}
            className="mt-1 w-full resize-none rounded-sm border border-ink/20 bg-limestone px-3 py-2 font-body text-base normal-case tracking-normal text-ink outline-none transition-colors focus:border-clay"
          />
        </label>

        <button
          type="submit"
          disabled={status === "sending"}
          className="mt-4 w-full rounded-full bg-ink py-3 font-mono text-xs uppercase tracking-wide text-limestone transition-colors hover:bg-clay disabled:opacity-50"
        >
          {status === "sending" ? t("valuation.sending") : t("valuation.submit")}
        </button>

        {status === "sent" && (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 text-sm text-aegean2"
          >
            {t("valuation.success")}
          </motion.p>
        )}
        {status === "error" && (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 text-sm text-clay"
          >
            {t("valuation.error")}
          </motion.p>
        )}
      </motion.form>
    </div>
  );
}
