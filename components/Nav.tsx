"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/lib/i18n";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => setIsAdmin(!!session));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => setIsAdmin(!!session));
    return () => subscription.unsubscribe();
  }, []);

  return (
    <motion.header
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`sticky top-0 z-50 transition-colors duration-300 ${
        scrolled ? "bg-limestone/90 backdrop-blur-sm border-b border-ink/10" : "bg-transparent"
      }`}
    >
      <div className="container-content flex items-center justify-between py-3">
        <Link href="/" className="flex shrink-0 items-center gap-3">
          <span className="relative block h-10 w-[70px]">
            <Image src="/logo.webp" alt="" fill sizes="70px" className="object-contain object-left" priority />
          </span>
          <span className="font-display text-xl tracking-tightest">DF Real Estate</span>
        </Link>
        <nav className="hidden gap-8 font-mono text-xs uppercase tracking-wide md:flex">
          <Link href="/properties?listing_type=sale" className="hover:text-clay transition-colors">
            {t("nav.sale")}
          </Link>
          <Link href="/properties?listing_type=rent" className="hover:text-clay transition-colors">
            {t("nav.rent")}
          </Link>
          <Link href="/properties" className="hover:text-clay transition-colors">
            {t("nav.all")}
          </Link>
          <Link href="/blog" className="hover:text-clay transition-colors">
            {t("nav.blog")}
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <Link
            href="/contact"
            className="rounded-full bg-ink px-5 py-2 font-mono text-xs uppercase tracking-wide text-limestone transition-colors hover:bg-clay"
          >
            {t("nav.contact")}
          </Link>
          {isAdmin && (
            <Link
              href="/admin/properties"
              className="rounded-full bg-ink px-5 py-2 font-mono text-xs uppercase tracking-wide text-limestone transition-colors hover:bg-clay"
            >
              {t("nav.admin")}
            </Link>
          )}
        </div>
      </div>
    </motion.header>
  );
}
