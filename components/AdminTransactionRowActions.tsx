"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Transaction } from "@/types/database";

export default function AdminTransactionRowActions({ transaction }: { transaction: Transaction }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleDelete() {
    if (!confirm("Διαγραφή αυτής της συναλλαγής; Δεν μπορεί να αναιρεθεί.")) return;
    setBusy(true);
    const supabase = createClient();
    await supabase.from("transactions").delete().eq("id", transaction.id);
    setBusy(false);
    router.refresh();
  }

  return (
    <button type="button" onClick={handleDelete} disabled={busy} className="text-clay hover:opacity-70 disabled:opacity-50">
      Διαγραφή
    </button>
  );
}
