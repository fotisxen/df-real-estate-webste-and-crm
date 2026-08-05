"use client";

import { useLanguage } from "@/lib/i18n";

function GreekFlag() {
  return (
    <svg viewBox="0 0 27 18" className="h-full w-full">
      <rect width="27" height="18" fill="#fff" />
      {[0, 4, 8, 12, 16].map((y) => (
        <rect key={y} y={y} width="27" height="2" fill="#0D5EAF" />
      ))}
      <rect width="10.8" height="10" fill="#0D5EAF" />
      <rect x="4.2" width="2.4" height="10" fill="#fff" />
      <rect y="3.8" width="10.8" height="2.4" fill="#fff" />
    </svg>
  );
}

function UkFlag() {
  return (
    <svg viewBox="0 0 30 20" className="h-full w-full">
      <rect width="30" height="20" fill="#00247d" />
      <path d="M0,0 L30,20 M30,0 L0,20" stroke="#fff" strokeWidth="4" />
      <path d="M0,0 L30,20 M30,0 L0,20" stroke="#cf142b" strokeWidth="1.6" />
      <path d="M15,0 V20 M0,10 H30" stroke="#fff" strokeWidth="6.5" />
      <path d="M15,0 V20 M0,10 H30" stroke="#cf142b" strokeWidth="3.8" />
    </svg>
  );
}

export default function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();

  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={() => setLang("el")}
        aria-label="Ελληνικά"
        className={`h-4 w-6 overflow-hidden rounded-[2px] ring-offset-1 transition-all ${
          lang === "el" ? "ring-2 ring-clay" : "opacity-50 grayscale hover:opacity-80"
        }`}
      >
        <GreekFlag />
      </button>
      <button
        type="button"
        onClick={() => setLang("en")}
        aria-label="English"
        className={`h-4 w-6 overflow-hidden rounded-[2px] ring-offset-1 transition-all ${
          lang === "en" ? "ring-2 ring-clay" : "opacity-50 grayscale hover:opacity-80"
        }`}
      >
        <UkFlag />
      </button>
    </div>
  );
}
