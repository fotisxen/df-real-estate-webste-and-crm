"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Client } from "@/types/database";

export default function AdminClientRowActions({ client }: { client: Client }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleDelete() {
    if (!confirm(`Διαγραφή του πελάτη "${client.full_name}"; Δεν μπορεί να αναιρεθεί.`)) return;
    setBusy(true);
    const supabase = createClient();
    await supabase.from("clients").delete().eq("id", client.id);
    setBusy(false);
    router.refresh();
  }

  return (
    <button type="button" onClick={handleDelete} disabled={busy} className="text-clay hover:opacity-70 disabled:opacity-50">
      Διαγραφή
    </button>
  );
}
