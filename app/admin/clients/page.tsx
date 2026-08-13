import { createClient } from "@/lib/supabase/server";
import { CLIENT_TAGS } from "@/lib/clientFields";
import type { Client, Property } from "@/types/database";
import AdminClientRowActions from "@/components/AdminClientRowActions";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminClientsPage({
  searchParams,
}: {
  searchParams: { q?: string; tag?: string };
}) {
  const supabase = createClient();
  const q = searchParams.q?.trim() ?? "";
  const tag = searchParams.tag ?? "";

  let query = supabase.from("clients").select("*").order("created_at", { ascending: false });
  if (q) {
    query = query.or(`full_name.ilike.%${q}%,phone.ilike.%${q}%`);
  }
  if (tag) {
    query = query.contains("tags", [tag]);
  }

  const [{ data }, { data: ownerLinks }, { data: interestLinks }, { data: properties }] = await Promise.all([
    query,
    supabase.from("property_private_details").select("owner_client_id").not("owner_client_id", "is", null),
    supabase.from("client_property_interest").select("client_id, property_id"),
    supabase.from("properties").select("id, title"),
  ]);

  const clients = (data ?? []) as Client[];
  const ownerIds = new Set((ownerLinks ?? []).map((l) => (l as { owner_client_id: string }).owner_client_id));
  const propertyTitleById = new Map(((properties ?? []) as Pick<Property, "id" | "title">[]).map((p) => [p.id, p.title]));

  const interestByClient = new Map<string, string[]>();
  for (const link of (interestLinks ?? []) as { client_id: string; property_id: string }[]) {
    const title = propertyTitleById.get(link.property_id);
    if (!title) continue;
    const arr = interestByClient.get(link.client_id) ?? [];
    arr.push(title);
    interestByClient.set(link.client_id, arr);
  }

  function filterHref(overrides: { q?: string; tag?: string }) {
    const params = new URLSearchParams();
    const nextQ = overrides.q ?? q;
    const nextTag = overrides.tag ?? tag;
    if (nextQ) params.set("q", nextQ);
    if (nextTag) params.set("tag", nextTag);
    const qs = params.toString();
    return `/admin/clients${qs ? `?${qs}` : ""}`;
  }

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

      <form method="GET" className="mt-6 flex flex-wrap gap-3">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Αναζήτηση με όνομα ή τηλέφωνο"
          className="min-w-[240px] flex-1 rounded-sm border border-ink/20 bg-limestone2 px-3 py-2 font-mono text-sm"
        />
        <select name="tag" defaultValue={tag} className="rounded-sm border border-ink/20 bg-limestone2 px-3 py-2 font-mono text-sm">
          <option value="">Όλες οι ιδιότητες</option>
          {CLIENT_TAGS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-sm bg-ink px-5 py-2 font-mono text-xs uppercase tracking-wide text-limestone hover:bg-clay"
        >
          Φίλτρο
        </button>
        {(q || tag) && (
          <Link
            href="/admin/clients"
            className="rounded-sm border border-ink/20 px-5 py-2 font-mono text-xs uppercase tracking-wide text-ink/60 hover:border-ink"
          >
            Καθαρισμός
          </Link>
        )}
      </form>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[820px] border-collapse font-mono text-sm">
          <thead>
            <tr className="border-b border-ink/10 text-left text-xs uppercase tracking-wide text-ink/50">
              <th className="py-3 pr-4">Ονοματεπώνυμο</th>
              <th className="py-3 pr-4">Τηλέφωνο</th>
              <th className="py-3 pr-4">Ιδιότητες</th>
              <th className="py-3 pr-4">Ακίνητα που είδε / ενδιαφέρεται</th>
              <th className="py-3 pr-4">Ιδιοκτήτης</th>
              <th className="py-3 pr-4"></th>
            </tr>
          </thead>
          <tbody>
            {clients.map((c) => {
              const interested = interestByClient.get(c.id) ?? [];
              return (
                <tr key={c.id} className="border-b border-ink/5">
                  <td className="py-3 pr-4">
                    <Link href={`/admin/clients/${c.id}`} className="hover:text-clay">
                      {c.full_name}
                    </Link>
                  </td>
                  <td className="py-3 pr-4">{c.phone ?? "—"}</td>
                  <td className="py-3 pr-4">
                    {c.tags && c.tags.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {c.tags.map((t) => (
                          <Link
                            key={t}
                            href={filterHref({ tag: t })}
                            className="rounded-full border border-ink/15 px-2 py-0.5 text-[11px] normal-case text-ink/70 hover:border-clay hover:text-clay"
                          >
                            {t}
                          </Link>
                        ))}
                      </div>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="max-w-[240px] py-3 pr-4 text-xs normal-case text-ink/70">
                    {interested.length > 0 ? interested.join(", ") : "—"}
                  </td>
                  <td className="py-3 pr-4">{ownerIds.has(c.id) ? "✓" : "—"}</td>
                  <td className="py-3 pr-4">
                    <AdminClientRowActions client={c} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {clients.length === 0 && (
          <p className="py-10 text-center text-ink/50">
            {q || tag ? "Κανένας πελάτης δεν ταιριάζει με αυτά τα φίλτρα." : "Δεν υπάρχουν ακόμη πελάτες."}
          </p>
        )}
      </div>
    </div>
  );
}
