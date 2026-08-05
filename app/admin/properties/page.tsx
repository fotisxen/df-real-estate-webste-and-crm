import { createClient } from "@/lib/supabase/server";
import type { Property } from "@/types/database";
import { CATEGORIES } from "@/lib/propertyFields";
import AdminPropertyRowActions from "@/components/AdminPropertyRowActions";
import Link from "next/link";

const categoryLabel = Object.fromEntries(CATEGORIES.map((c) => [c.value, c.label]));

export const dynamic = "force-dynamic"; // always fresh for the agents editing data

export default async function AdminPropertiesPage() {
  const supabase = createClient();
  const { data } = await supabase.from("properties").select("*").order("created_at", { ascending: false });
  const properties = (data ?? []) as Property[];

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl">Ακίνητα</h1>
        <Link
          href="/admin/properties/new"
          className="rounded-full bg-clay px-5 py-2 font-mono text-xs uppercase tracking-wide text-limestone"
        >
          + Νέο ακίνητο
        </Link>
      </div>

      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse font-mono text-sm">
          <thead>
            <tr className="border-b border-ink/10 text-left text-xs uppercase tracking-wide text-ink/50">
              <th className="py-3 pr-4">Τίτλος</th>
              <th className="py-3 pr-4">Κατηγορία</th>
              <th className="py-3 pr-4">Τύπος</th>
              <th className="py-3 pr-4">Κατάσταση</th>
              <th className="py-3 pr-4">Τιμή</th>
              <th className="py-3 pr-4">Spitogatos</th>
              <th className="py-3 pr-4">Ορατότητα</th>
              <th className="py-3 pr-4"></th>
            </tr>
          </thead>
          <tbody>
            {properties.map((p) => (
              <tr key={p.id} className={`border-b border-ink/5 ${p.published ? "" : "opacity-50"}`}>
                <td className="py-3 pr-4">
                  <Link href={`/admin/properties/${p.id}`} className="hover:text-clay">
                    {p.title}
                  </Link>
                </td>
                <td className="py-3 pr-4">{categoryLabel[p.category] ?? p.category}</td>
                <td className="py-3 pr-4">{p.listing_type === "sale" ? "Πώληση" : "Ενοικίαση"}</td>
                <td className="py-3 pr-4">{p.status}</td>
                <td className="py-3 pr-4">€{p.price.toLocaleString("el-GR")}</td>
                <td className="py-3 pr-4">{p.sync_to_spitogatos ? "✓" : "—"}</td>
                <td className="py-3 pr-4">{p.published ? "Ορατό" : "Κρυφό"}</td>
                <td className="py-3 pr-4">
                  <AdminPropertyRowActions property={p} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {properties.length === 0 && (
          <p className="py-10 text-center text-ink/50">Δεν υπάρχουν ακόμη ακίνητα.</p>
        )}
      </div>
    </div>
  );
}
