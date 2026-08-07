"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  }),
};

const SERVICES = [
  {
    href: "/properties?listing_type=sale",
    title: { el: "Πώληση Ακινήτου", en: "Property Sales" },
    description: {
      el: "Αναλαμβάνουμε την πώληση του ακινήτου σας από την αρχή μέχρι το συμβόλαιο — σωστή τιμολόγηση, επαγγελματική προβολή και διαπραγμάτευση με υποψήφιους αγοραστές.",
      en: "We handle the sale of your property from start to contract — correct pricing, professional exposure and negotiation with prospective buyers.",
    },
  },
  {
    href: "/properties?listing_type=sale",
    title: { el: "Αγορά Ακινήτου", en: "Property Purchase" },
    description: {
      el: "Σας βοηθάμε να βρείτε το ακίνητο που ταιριάζει στις ανάγκες και τον προϋπολογισμό σας, και σας καθοδηγούμε σε κάθε βήμα της διαδικασίας αγοράς.",
      en: "We help you find a property that matches your needs and budget, and guide you through every step of the buying process.",
    },
  },
  {
    href: "/properties?listing_type=rent",
    title: { el: "Ενοικίαση Ακινήτου", en: "Property Rental" },
    description: {
      el: "Βρίσκουμε αξιόπιστους ενοικιαστές για το ακίνητό σας ή το κατάλληλο ακίνητο για εσάς, με σαφείς όρους μίσθωσης από την πρώτη στιγμή.",
      en: "We find reliable tenants for your property, or the right rental for you, with clear lease terms from day one.",
    },
  },
  // {
  //   href: "/contact",
  //   title: { el: "Διαχείριση Ακινήτου", en: "Property Management" },
  //   description: {
  //     el: "Αναλαμβάνουμε την καθημερινή διαχείριση του ακινήτου σας — επικοινωνία με ενοικιαστές, είσπραξη ενοικίων και συντονισμό συντήρησης.",
  //     en: "We take on the day-to-day management of your property — tenant communication, rent collection and maintenance coordination.",
  //   },
  // },
  {
    href: "/valuation",
    title: { el: "Εκτίμηση Ακινήτου", en: "Property Valuation" },
    description: {
      el: "Δωρεάν και χωρίς δέσμευση εκτίμηση της αγοραίας αξίας του ακινήτου σας, βασισμένη στην τοπική αγορά της Θεσσαλονίκης.",
      en: "A free, no-obligation estimate of your property's market value, based on the local Thessaloniki market.",
    },
  },
  {
    href: "/contact",
    title: { el: "Αποκλειστική Ανάθεση", en: "Exclusive Listing" },
    description: {
      el: "Αναλαμβάνουμε αποκλειστικά την πώληση ή ενοικίαση του ακινήτου σας, με στοχευμένη προβολή και έναν μόνο υπεύθυνο επικοινωνίας.",
      en: "We take on the sale or rental of your property exclusively, with targeted exposure and a single point of contact.",
    },
  },
] as const;

export default function ServicesClient() {
  const { lang, t } = useLanguage();

  return (
    <div className="container-content py-20 md:py-28">
      <motion.p
        initial="hidden"
        animate="show"
        custom={0}
        variants={fadeUp}
        className="font-mono text-xs uppercase tracking-wide text-clay"
      >
        {t("services.kicker")}
      </motion.p>
      <motion.h1
        initial="hidden"
        animate="show"
        custom={1}
        variants={fadeUp}
        className="mt-3 max-w-2xl text-4xl leading-tight md:text-5xl"
      >
        {t("services.title")}
      </motion.h1>
      <motion.p
        initial="hidden"
        animate="show"
        custom={2}
        variants={fadeUp}
        className="mt-5 max-w-xl text-ink/70"
      >
        {t("services.subtitle")}
      </motion.p>

      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {SERVICES.map((service, i) => (
          <motion.div
            key={service.title.el}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            custom={i}
            variants={fadeUp}
            className="flex flex-col rounded-sm border border-ink/10 bg-limestone2 p-6"
          >
            <span className="font-mono text-xs text-clay">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h2 className="mt-3 font-display text-xl leading-snug">
              {service.title[lang]}
            </h2>
            <p className="mt-2 flex-1 text-sm text-ink/70">
              {service.description[lang]}
            </p>
            <Link
              href={service.href}
              className="mt-4 font-mono text-xs uppercase tracking-wide text-aegean transition-colors hover:text-clay"
            >
              {service.href === "/valuation" ? t("services.valuationCta") : `${t("services.cta")} →`}
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
