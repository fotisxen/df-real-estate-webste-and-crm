"use client";

import { useLanguage } from "@/lib/i18n";

// Tiny inline translator for a lone string inside otherwise server-rendered
// markup — avoids converting a whole page to a client component just to
// translate one label.
export default function T({ k }: { k: Parameters<ReturnType<typeof useLanguage>["t"]>[0] }) {
  const { t } = useLanguage();
  return <>{t(k)}</>;
}
