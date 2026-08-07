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
  "nav.services": { el: "Υπηρεσίες", en: "Services" },
  "nav.areas": { el: "Περιοχές", en: "Areas" },
  "nav.valuation": { el: "Εκτίμηση Ακινήτου", en: "Valuation" },
  "nav.contact": { el: "Επικοινωνία", en: "Contact" },
  "nav.admin": { el: "Διαχείριση", en: "Admin" },

  "footer.tagline": {
    el: "Μεσιτικό γραφείο — σπίτια, γραφεία και επαγγελματικοί χώροι.",
    en: "Real estate agency — homes, offices and commercial spaces.",
  },
  "footer.contact": { el: "Επικοινωνία", en: "Contact" },
  "footer.links": { el: "Σύνδεσμοι", en: "Links" },
  "footer.office": { el: "Γραφείο", en: "Office" },
  "footer.city": { el: "Θεσσαλονίκη, Ελλάδα", en: "Thessaloniki, Greece" },
  "footer.rights": { el: "Με επιφύλαξη παντός δικαιώματος.", en: "All rights reserved." },
  "footer.madeBy": { el: "Κατασκευή από", en: "Made by" },

  "hero.kicker": { el: "Θεσσαλονίκη & γύρω περιοχές", en: "Thessaloniki & surrounding areas" },
  "hero.title.pre": { el: "Ακίνητα που ", en: "Properties worth " },
  "hero.title.em": { el: "αξίζουν", en: "the" },
  "hero.title.post": { el: " τη διαδρομή.", en: " journey." },
  "hero.subtitle": {
    el: "Κατοικίες, γραφεία και επαγγελματικοί χώροι προς πώληση και ενοικίαση, επιλεγμένα και ενημερωμένα από την ομάδα μας — όχι από bot.",
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

  "home.areas.title": { el: "Περιοχές", en: "Areas" },
  "home.areas.viewAll": { el: "Όλες οι περιοχές →", en: "All areas →" },

  "home.services.title": { el: "Πώς μπορούμε να βοηθήσουμε", en: "How we can help" },
  "home.services.sell.title": { el: "Θέλω να πουλήσω", en: "I want to sell" },
  "home.services.sell.desc": { el: "Σωστή εκτίμηση και προβολή για γρήγορη, ασφαλή πώληση.", en: "Correct pricing and exposure for a fast, secure sale." },
  "home.services.rent.title": { el: "Θέλω να ενοικιάσω", en: "I want to rent out" },
  "home.services.rent.desc": { el: "Βρίσκουμε αξιόπιστους ενοικιαστές με σαφείς όρους μίσθωσης.", en: "We find reliable tenants with clear lease terms." },
  "home.services.valuation.title": { el: "Θέλω δωρεάν εκτίμηση", en: "I want a free valuation" },
  "home.services.valuation.desc": { el: "Ρεαλιστική εκτίμηση αξίας, χωρίς καμία δέσμευση.", en: "A realistic value estimate, with no obligation." },

  "home.blog.title": { el: "Πρόσφατα άρθρα", en: "Latest articles" },
  "home.blog.viewAll": { el: "Όλα τα άρθρα →", en: "All articles →" },

  "home.mood1.kicker": { el: "Η φιλοσοφία μας", en: "Our philosophy" },
  "home.mood1.title": { el: "Κάθε σπίτι έχει τη δική του ιστορία.", en: "Every home has its own story." },
  "home.mood1.subtitle": {
    el: "Εμείς είμαστε εδώ για να σας βοηθήσουμε να βρείτε τη σωστή, χωρίς βιασύνη και χωρίς συμβιβασμούς.",
    en: "We're here to help you find the right one — no rush, no compromise.",
  },

  "home.mood2.title": { el: "Έτοιμοι να κάνετε το επόμενο βήμα;", en: "Ready to take the next step?" },
  "home.mood2.subtitle": {
    el: "Είτε ψάχνετε είτε πουλάτε, η ομάδα μας είναι δίπλα σας σε κάθε απόφαση.",
    en: "Whether you're searching or selling, our team is with you at every decision.",
  },
  "home.mood2.cta": { el: "Επικοινωνήστε μαζί μας", en: "Get in touch" },

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

  "services.kicker": { el: "Τι κάνουμε", en: "What we do" },
  "services.title": { el: "Υπηρεσίες", en: "Services" },
  "services.subtitle": {
    el: "Από την πώληση και την αγορά μέχρι τη διαχείριση και την εκτίμηση — σας καλύπτουμε σε κάθε βήμα.",
    en: "From selling and buying to management and valuation — we cover every step.",
  },
  "services.cta": { el: "Επικοινωνήστε μαζί μας", en: "Get in touch" },
  "services.valuationCta": { el: "Ζητήστε δωρεάν εκτίμηση →", en: "Request a free valuation →" },

  "areas.kicker": { el: "Πού δραστηριοποιούμαστε", en: "Where we operate" },
  "areas.title": { el: "Περιοχές", en: "Areas" },
  "areas.subtitle": {
    el: "Περιηγηθείτε στις περιοχές όπου έχουμε ενεργές καταχωρήσεις ακινήτων.",
    en: "Browse the areas where we currently have active property listings.",
  },
  "areas.empty": { el: "Δεν υπάρχουν ακόμη καταχωρημένες περιοχές.", en: "No areas listed yet." },
  "areas.properties": { el: "ακίνητα", en: "properties" },
  "areas.property": { el: "ακίνητο", en: "property" },
  "areas.viewProperties": { el: "Δείτε τα ακίνητα →", en: "View properties →" },
  "areas.priceRange": { el: "Εύρος τιμών", en: "Price range" },
  "areas.forSale": { el: "προς πώληση", en: "for sale" },
  "areas.forRent": { el: "προς ενοικίαση", en: "for rent" },
  "areas.back": { el: "← Περιοχές", en: "← Areas" },
  "areas.notFound": { el: "Δεν βρέθηκαν ακίνητα σε αυτή την περιοχή.", en: "No properties found in this area." },

  "valuation.kicker": { el: "Δωρεάν & χωρίς δέσμευση", en: "Free & no obligation" },
  "valuation.title": { el: "Δωρεάν Εκτίμηση Ακινήτου", en: "Free Property Valuation" },
  "valuation.subtitle": {
    el: "Συμπληρώστε τα στοιχεία του ακινήτου σας και θα επικοινωνήσουμε μαζί σας με μια ρεαλιστική εκτίμηση της αγοραίας αξίας του.",
    en: "Fill in your property's details and we'll get back to you with a realistic estimate of its market value.",
  },
  "valuation.purpose": { el: "Σκοπός", en: "Purpose" },
  "valuation.purposeSale": { el: "Θέλω να πουλήσω", en: "I want to sell" },
  "valuation.purposeRent": { el: "Θέλω να ενοικιάσω", en: "I want to rent out" },
  "valuation.category": { el: "Τύπος ακινήτου", en: "Property type" },
  "valuation.region": { el: "Περιοχή", en: "Area" },
  "valuation.area": { el: "Εμβαδόν (τ.μ.)", en: "Area (sqm)" },
  "valuation.notes": { el: "Επιπλέον στοιχεία (προαιρετικό)", en: "Additional details (optional)" },
  "valuation.submit": { el: "Αποστολή αιτήματος", en: "Send request" },
  "valuation.sending": { el: "Αποστολή...", en: "Sending..." },
  "valuation.success": {
    el: "Ευχαριστούμε! Θα επικοινωνήσουμε σύντομα μαζί σας με την εκτίμηση.",
    en: "Thank you! We'll be in touch soon with your valuation.",
  },
  "valuation.error": { el: "Κάτι πήγε στραβά. Δοκιμάστε ξανά ή καλέστε μας.", en: "Something went wrong. Please try again or call us." },
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
