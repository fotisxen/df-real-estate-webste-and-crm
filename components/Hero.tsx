"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import HeroSearchCard from "./HeroSearchCard";
import { useLanguage } from "@/lib/i18n";

interface HeroProps {
  filmstripImages: string[]; // public URLs, ideally 6-10 recent listing photos
  saleCount: number;
  rentCount: number;
}

const easeOut = [0.22, 1, 0.36, 1] as const;

export default function Hero({ filmstripImages, saleCount, rentCount }: HeroProps) {
  const hasImages = filmstripImages.length > 0;
  const { t } = useLanguage();

  return (
    <section className="relative overflow-hidden border-b border-ink/10">
      {/* Ambient drifting glow behind the headline — purely decorative,
          keeps the hero feeling alive even before the user scrolls. */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ x: [0, 40, 0], y: [0, 20, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -left-24 -top-24 h-[420px] w-[420px] rounded-full bg-aegean/10 blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -30, 0], y: [0, -25, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          className="absolute right-0 top-10 h-[360px] w-[360px] rounded-full bg-clay/10 blur-3xl"
        />
      </div>

      <div className="container-content relative z-10 pb-10 pt-20 md:pt-28">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: easeOut }}
          className="font-mono text-xs uppercase tracking-wide text-clay"
        >
          {t("hero.kicker")}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: easeOut }}
          className="mt-4 max-w-3xl text-5xl leading-[1.05] tracking-tightest md:text-7xl"
        >
          {t("hero.title.pre")}
          <em className="font-normal italic text-aegean">{t("hero.title.em")}</em>{" "}
          {t("hero.title.post")}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25, ease: easeOut }}
          className="mt-6 max-w-md text-ink/70"
        >
          {t("hero.subtitle")}
        </motion.p>
      </div>

      {/* Signature element: a horizontal filmstrip of real listing photos
          bleeding under the headline, drifting slowly on load. Falls back
          to a plain color band with no motion if there are no images yet
          (empty state should never show a broken layout). */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="relative h-[42vh] min-h-[280px] w-full bg-aegean md:h-[60vh]"
      >
        {hasImages ? (
          <motion.div
            initial={{ x: 0 }}
            animate={{ x: "-50%" }}
            transition={{ duration: 40, ease: "linear", repeat: Infinity }}
            className="flex h-full w-[200%]"
          >
            {[...filmstripImages, ...filmstripImages].map((src, i) => (
              <div key={i} className="relative h-full w-[280px] shrink-0 md:w-[440px]">
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="440px"
                  className="object-cover grayscale-[15%]"
                  priority={i < 4}
                />
              </div>
            ))}
          </motion.div>
        ) : (
          <div className="flex h-full items-center justify-center font-mono text-xs uppercase tracking-wide text-limestone/60">
            {t("hero.noImages")}
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent to-transparent" />
      </motion.div>

      <div className="container-content">
        <HeroSearchCard />
      </div>

      <div className="container-content flex flex-wrap gap-8 py-8 font-mono text-sm">
        <div>
          <span className="text-2xl text-ink">{saleCount}</span>
          <span className="ml-2 text-ink/50">{t("hero.forSale")}</span>
        </div>
        <div>
          <span className="text-2xl text-ink">{rentCount}</span>
          <span className="ml-2 text-ink/50">{t("hero.forRent")}</span>
        </div>
      </div>
    </section>
  );
}
