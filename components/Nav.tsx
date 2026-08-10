"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/lib/i18n";
import LanguageSwitcher from "./LanguageSwitcher";

const NAV_LINKS = [
  { href: "/properties?listing_type=sale", key: "nav.sale" },
  { href: "/properties?listing_type=rent", key: "nav.rent" },
  { href: "/properties", key: "nav.all" },
  { href: "/areas", key: "nav.areas" },
  { href: "/services", key: "nav.services" },
  { href: "/blog", key: "nav.blog" },
] as const;

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { t } = useLanguage();
  const pathname = usePathname();

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

  // Close the mobile menu automatically on route change.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Lock body scroll while the mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <motion.header
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`sticky top-0 z-50 transition-colors duration-300 ${
        scrolled || menuOpen ? "bg-limestone/90 backdrop-blur-sm border-b border-ink/10" : "bg-transparent"
      }`}
    >
      <div className="container-content flex items-center justify-between py-3">
        <Link href="/" className="flex shrink-0 items-center gap-3">
          <span className="relative block h-10 w-[70px]">
            <Image src="/logo.webp" alt="" fill sizes="70px" className="object-contain object-left" priority />
          </span>
          <span className="font-display text-xl tracking-tightest">DF Real Estate</span>
        </Link>

        <nav className="hidden gap-6 font-mono text-xs uppercase tracking-wide lg:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.key} href={link.href} className="hover:text-clay transition-colors">
              {t(link.key)}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
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

        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? "Κλείσιμο μενού" : "Άνοιγμα μενού"}
          aria-expanded={menuOpen}
          className="relative z-10 flex h-10 w-10 shrink-0 flex-col items-center justify-center gap-1.5 lg:hidden"
        >
          <motion.span
            animate={menuOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
            className="block h-[1.5px] w-6 bg-ink"
          />
          <motion.span animate={menuOpen ? { opacity: 0 } : { opacity: 1 }} className="block h-[1.5px] w-6 bg-ink" />
          <motion.span
            animate={menuOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
            className="block h-[1.5px] w-6 bg-ink"
          />
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-ink/10 bg-limestone lg:hidden"
          >
            <nav className="container-content flex flex-col gap-1 py-6 font-mono text-sm uppercase tracking-wide">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.key}
                  href={link.href}
                  className="border-b border-ink/5 py-3 transition-colors hover:text-clay"
                >
                  {t(link.key)}
                </Link>
              ))}

              <div className="mt-4 flex items-center justify-between">
                <LanguageSwitcher />
              </div>

              <Link
                href="/contact"
                className="mt-4 rounded-full bg-ink px-5 py-3 text-center text-limestone transition-colors hover:bg-clay"
              >
                {t("nav.contact")}
              </Link>
              {isAdmin && (
                <Link
                  href="/admin/properties"
                  className="mt-3 rounded-full border border-ink/20 px-5 py-3 text-center transition-colors hover:border-ink"
                >
                  {t("nav.admin")}
                </Link>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
