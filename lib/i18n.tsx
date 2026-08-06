"use client";

// Lightweight EL/EN switcher for the public site chrome (nav, footer, hero,
// search, listings, contact). Admin stays Greek-only — it's an internal
// tool, not visitor-facing. Listing content (titles/descriptions) is
// entered by the agency in one language and isn't machine-translated.

import { createContext, useContext, useEffect, useState } from "react";

export type Lang = "el" | "en";

const STRINGS: Record<string, Record<Lang, string>> = {
  "nav.sale": { el: "Πώληση", en: "Sale" },
  "nav.rent": { el: "Ενοικίαση", en: "Rent" },
  "nav.all": { el: "Όλα τα ακίνητα", en: "All properties" },
  "nav.blog": { el: "Άρθρα", en: "Blog" },
  "nav.contact": { el: "Επικοινωνία", en: "Contact" },
  "nav.admin": { el: "Διαχείριση", en: "Admin" },

  "footer.tagline": {
    el: "Μεσιτικό γραφείο — σπίτια, γραφεία και επαγγελματικοί χώροι.",
    en: "Real estate agency — homes, offices and commercial spaces.",
  },
  "footer.contact": { el: "Επικοινωνία", en: "Contact" },
  "footer.office": { el: "Γραφείο", en: "Office" },
  "footer.city": { el: "Θεσσαλονίκη, Ελλάδα", en: "Thessaloniki, Greece" },
  "footer.rights": { el: "Με επιφύλαξη παντός δικαιώματος.", en: "All rights reserved." },

  "hero.kicker": { el: "Θεσσαλονίκη & γύρω περιοχές", en: "Thessaloniki & surrounding areas" },
  "hero.title.pre": { el: "Ακίνητα που ", en: "Properties worth " },
  "hero.title.em": { el: "αξίζουν", en: "the" },
  "hero.title.post": { el: " τη διαδρομή.", en: " journey." },
  "hero.subtitle": {
    el: "Σπίτια, γραφεία και επαγγελματικοί χώροι προς πώληση και ενοικίαση, επιλεγμένα και ενημερωμένα από την ομάδα μας — όχι από bot.",
    en: "Homes, offices and commercial spaces for sale and rent, curated and kept up to date by our team — not a bot.",
  },
  "hero.forSale": { el: "προς πώληση", en: "for sale" },
  "hero.forRent": { el: "προς ενοικίαση", en: "for rent" },
  "hero.noImages": {
    el: "Οι πρώτες φωτογραφίες ακινήτων θα εμφανιστούν εδώ",
    en: "The first listing photos will appear here",
  },

  "search.listingType": { el: "Θέλω να", en: "I want to" },
  "search.category": { el: "Κατηγορία", en: "Category" },
  "search.categoryAny": { el: "Οποιαδήποτε", en: "Any" },
  "search.region": { el: "Περιοχή", en: "Location" },
  "search.regionPlaceholder": { el: "π.χ. Καλαμαριά", en: "e.g. city or area" },
  "search.submit": { el: "Αναζήτηση", en: "Search" },

  "home.recent": { el: "Πρόσφατες καταχωρήσεις", en: "Recent listings" },
  "home.viewAll": { el: "Όλα τα ακίνητα →", en: "All properties →" },
  "home.empty.pre": { el: "Δεν υπάρχουν ακόμη καταχωρημένα ακίνητα. Προσθέστε το πρώτο από το", en: "No listings yet. Add the first one from the" },
  "home.empty.link": { el: "πάνελ διαχείρισης", en: "admin panel" },

  "properties.title": { el: "Ακίνητα", en: "Properties" },
  "properties.all": { el: "Όλα", en: "All" },
  "properties.allCategories": { el: "Όλες οι κατηγορίες", en: "All categories" },
  "properties.empty": { el: "Δεν βρέθηκαν ακίνητα με αυτά τα κριτήρια.", en: "No properties match these filters." },
  "properties.noPhoto": { el: "Χωρίς φωτογραφία", en: "No photo" },
  "properties.perMonth": { el: "/ μήνα", en: "/ month" },

  "contact.kicker": { el: "Επικοινωνία", en: "Contact" },
  "contact.title": { el: "Ας μιλήσουμε για το επόμενο ακίνητό σας.", en: "Let's talk about your next property." },
  "contact.subtitle": {
    el: "Στείλτε μας μήνυμα ή καλέστε απευθείας — απαντάμε συνήθως εντός της ίδιας ημέρας.",
    en: "Send us a message or call directly — we usually reply the same day.",
  },
  "contact.name": { el: "Ονοματεπώνυμο", en: "Full name" },
  "contact.email": { el: "Email", en: "Email" },
  "contact.phone": { el: "Τηλέφωνο (προαιρετικό)", en: "Phone (optional)" },
  "contact.message": { el: "Μήνυμα", en: "Message" },
  "contact.submit": { el: "Αποστολή μηνύματος", en: "Send message" },
  "contact.sending": { el: "Αποστολή...", en: "Sending..." },
  "contact.success": { el: "Ευχαριστούμε! Θα επικοινωνήσουμε σύντομα μαζί σας.", en: "Thank you! We'll be in touch shortly." },
  "contact.error": { el: "Κάτι πήγε στραβά. Δοκιμάστε ξανά ή καλέστε μας.", en: "Something went wrong. Please try again or call us." },
  "contact.requestInfo": { el: "Ζητήστε πληροφορίες", en: "Request info" },

  "blog.kicker": { el: "Οδηγοί & νέα", en: "Guides & news" },
  "blog.title": { el: "Άρθρα για ακίνητα", en: "Real estate articles" },
  "blog.subtitle": {
    el: "Συμβουλές, οδηγοί και νέα για αγορά, πώληση και ενοικίαση ακινήτων στη Θεσσαλονίκη.",
    en: "Tips, guides and news on buying, selling and renting property in Thessaloniki.",
  },
  "blog.empty": { el: "Δεν υπάρχουν ακόμη άρθρα.", en: "No articles yet." },
  "blog.back": { el: "← Άρθρα", en: "← Blog" },
  "blog.cta.title": { el: "Ψάχνετε το επόμενο ακίνητό σας;", en: "Looking for your next property?" },
  "blog.cta.subtitle": {
    el: "Επικοινωνήστε μαζί μας — απαντάμε συνήθως εντός της ίδιας ημέρας.",
    en: "Get in touch — we usually reply the same day.",
  },
};

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: keyof typeof STRINGS) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("el");

  useEffect(() => {
    const stored = window.localStorage.getItem("lang");
    if (stored === "en" || stored === "el") setLangState(stored);
  }, []);

  function setLang(next: Lang) {
    setLangState(next);
    window.localStorage.setItem("lang", next);
  }

  function t(key: keyof typeof STRINGS) {
    return STRINGS[key]?.[lang] ?? key;
  }

  return <LanguageContext.Provider value={{ lang, setLang, t }}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
