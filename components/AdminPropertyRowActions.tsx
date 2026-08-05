"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Property } from "@/types/database";

export default function AdminPropertyRowActions({ property }: { property: Property }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function togglePublished() {
    setBusy(true);
    const supabase = createClient();
    await supabase.from("properties").update({ published: !property.published } as never).eq("id", property.id);
    setBusy(false);
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm(`Διαγραφή του ακινήτου "${property.title}"; Δεν μπορεί να αναιρεθεί.`)) return;
    setBusy(true);
    const supabase = createClient();

    const { data: images } = await supabase
      .from("property_images")
      .select("storage_path")
      .eq("property_id", property.id);
    const paths = (images ?? []).map((i) => (i as { storage_path: string }).storage_path);
    if (paths.length > 0) await supabase.storage.from("property-images").remove(paths);

    await supabase.from("properties").delete().eq("id", property.id);
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={togglePublished}
        disabled={busy}
        className="hover:text-clay disabled:opacity-50"
      >
        {property.published ? "Απόκρυψη" : "Εμφάνιση"}
      </button>
      <button type="button" onClick={handleDelete} disabled={busy} className="text-clay hover:opacity-70 disabled:opacity-50">
        Διαγραφή
      </button>
    </div>
  );
}
