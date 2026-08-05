"use client";

import Image from "next/image";
import { useLanguage } from "@/lib/i18n";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer id="contact" className="border-t border-ink/10 bg-ink text-limestone">
      <div className="container-content grid gap-10 py-16 md:grid-cols-3">
        <div>
          <div className="relative h-12 w-[90px]">
            <Image src="/logo.webp" alt="DF Real Estate" fill sizes="90px" className="object-contain object-left" />
          </div>
          <p className="mt-4 max-w-xs text-sm text-limestone/70">{t("footer.tagline")}</p>
        </div>
        <div className="font-mono text-sm text-limestone/70">
          <p className="mb-2 uppercase tracking-wide text-limestone/40">{t("footer.contact")}</p>
          <p>info@df-real-estate.com</p>
          <p>6984 4966 60</p>
        </div>
        <div className="font-mono text-sm text-limestone/70">
          <p className="mb-2 uppercase tracking-wide text-limestone/40">{t("footer.office")}</p>
          <p>{t("footer.city")}</p>
        </div>
      </div>
      <div className="container-content border-t border-limestone/10 py-6 text-xs text-limestone/40">
        © {new Date().getFullYear()} DF Real Estate. {t("footer.rights")}
      </div>
    </footer>
  );
}
