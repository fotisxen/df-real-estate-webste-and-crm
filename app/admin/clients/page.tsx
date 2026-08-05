import { createClient } from "@/lib/supabase/server";
import type { Client } from "@/types/database";
import AdminClientRowActions from "@/components/AdminClientRowActions";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminClientsPage() {
  const supabase = createClient();
  const [{ data }, { data: ownerLinks }] = await Promise.all([
    supabase.from("clients").select("*").order("created_at", { ascending: false }),
    supabase.from("property_private_details").select("owner_client_id").not("owner_client_id", "is", null),
  ]);
  const clients = (data ?? []) as Client[];
  const ownerIds = new Set((ownerLinks ?? []).map((l) => (l as { owner_client_id: string }).owner_client_id));

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl">Πελάτες</h1>
        <Link
          href="/admin/clients/new"
          className="rounded-full bg-clay px-5 py-2 font-mono text-xs uppercase tracking-wide text-limestone"
        >
          + Νέος πελάτης
        </Link>
      </div>

      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse font-mono text-sm">
          <thead>
            <tr className="border-b border-ink/10 text-left text-xs uppercase tracking-wide text-ink/50">
              <th className="py-3 pr-4">Ονοματεπώνυμο</th>
              <th className="py-3 pr-4">Τηλέφωνο</th>
              <th className="py-3 pr-4">Email</th>
              <th className="py-3 pr-4">Ενδιαφέρεται για</th>
              <th className="py-3 pr-4">Ιδιοκτήτης</th>
              <th className="py-3 pr-4"></th>
            </tr>
          </thead>
          <tbody>
            {clients.map((c) => (
              <tr key={c.id} className="border-b border-ink/5">
                <td className="py-3 pr-4">
                  <Link href={`/admin/clients/${c.id}`} className="hover:text-clay">
                    {c.full_name}
                  </Link>
                </td>
                <td className="py-3 pr-4">{c.phone ?? "—"}</td>
                <td className="py-3 pr-4">{c.email ?? "—"}</td>
                <td className="py-3 pr-4">{c.interested_in ?? "—"}</td>
                <td className="py-3 pr-4">{ownerIds.has(c.id) ? "✓" : "—"}</td>
                <td className="py-3 pr-4">
                  <AdminClientRowActions client={c} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {clients.length === 0 && <p className="py-10 text-center text-ink/50">Δεν υπάρχουν ακόμη πελάτες.</p>}
      </div>
    </div>
  );
}
