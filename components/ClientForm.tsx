"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CLIENT_TAGS } from "@/lib/clientFields";
import type { Client, Property } from "@/types/database";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block font-mono text-xs uppercase tracking-wide text-ink/60">
      {label}
      <div className="mt-1 normal-case tracking-normal">{children}</div>
    </label>
  );
}

export default function ClientForm({
  mode,
  client,
  linkedProperties,
  interestedProperties,
  allProperties,
}: {
  mode: "create" | "edit";
  client?: Client;
  linkedProperties?: Property[];
  interestedProperties?: Property[];
  allProperties?: Property[];
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ownedIds = new Set((linkedProperties ?? []).map((p) => p.id));
  const interestedIds = new Set((interestedProperties ?? []).map((p) => p.id));

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const supabase = createClient();

    const payload = {
      full_name: String(form.get("full_name") ?? "").trim(),
      phone: String(form.get("phone") ?? "") || null,
      email: String(form.get("email") ?? "") || null,
      address: String(form.get("address") ?? "") || null,
      interested_in: String(form.get("interested_in") ?? "") || null,
      notes: String(form.get("notes") ?? "") || null,
      tags: form.getAll("tags").map(String),
    };

    let clientId = client?.id;
    const { data: saved, error: saveError } =
      mode === "create"
        ? await supabase.from("clients").insert(payload as never).select().single()
        : await supabase.from("clients").update(payload as never).eq("id", clientId!).select().single();

    if (saveError) {
      setError(saveError.message);
      setSaving(false);
      return;
    }
    clientId = (saved as Client).id;

    const checkedOwnedIds = form.getAll("owned_property_ids").map(String);
    const toClearOwner = [...ownedIds].filter((id) => !checkedOwnedIds.includes(id));
    if (toClearOwner.length > 0) {
      await supabase
        .from("property_private_details")
        .update({ owner_client_id: null } as never)
        .in("property_id", toClearOwner);
    }
    for (const propertyId of checkedOwnedIds) {
      await supabase
        .from("property_private_details")
        .upsert({ property_id: propertyId, owner_client_id: clientId } as never);
    }

    const checkedInterestedIds = form.getAll("interested_property_ids").map(String);
    const toClearInterest = [...interestedIds].filter((id) => !checkedInterestedIds.includes(id));
    if (toClearInterest.length > 0) {
      await supabase
        .from("client_property_interest")
        .delete()
        .eq("client_id", clientId)
        .in("property_id", toClearInterest);
    }
    if (checkedInterestedIds.length > 0) {
      await supabase.from("client_property_interest").upsert(
        checkedInterestedIds.map((propertyId) => ({ client_id: clientId, property_id: propertyId })) as never,
      );
    }

    setSaving(false);
    router.push("/admin/clients");
    router.refresh();
  }

  return (
    <div className="max-w-2xl">
      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <Field label="Ονοματεπώνυμο">
          <input name="full_name" required defaultValue={client?.full_name} className="input" />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Τηλέφωνο">
            <input name="phone" defaultValue={client?.phone ?? ""} className="input" />
          </Field>
          <Field label="Email">
            <input name="email" type="email" defaultValue={client?.email ?? ""} className="input" />
          </Field>
        </div>

        <Field label="Διεύθυνση">
          <input name="address" defaultValue={client?.address ?? ""} className="input" />
        </Field>

        <Field label="Ιδιότητες">
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {CLIENT_TAGS.map((tag) => (
              <label key={tag} className="flex items-center gap-2 text-sm normal-case text-ink/80">
                <input type="checkbox" name="tags" value={tag} defaultChecked={client?.tags?.includes(tag)} />
                {tag}
              </label>
            ))}
          </div>
        </Field>

        <Field label="Ενδιαφέρεται για">
          <input
            name="interested_in"
            defaultValue={client?.interested_in ?? ""}
            placeholder="π.χ. διαμέρισμα 3δ, Καλαμαριά, έως 250.000€"
            className="input"
          />
        </Field>

        <Field label="Σημειώσεις">
          <textarea name="notes" rows={4} defaultValue={client?.notes ?? ""} className="input" />
        </Field>

        <div className="border-t border-ink/10 pt-6">
          <h2 className="font-mono text-xs uppercase tracking-wide text-clay">Ιδιοκτήτης ακινήτων</h2>
          {allProperties && allProperties.length > 0 ? (
            <Field label="Ακίνητα">
              <select name="owned_property_ids" multiple size={6} defaultValue={[...ownedIds]} className="input">
                {allProperties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs normal-case text-ink/50">
                Κρατήστε Ctrl (ή Cmd σε Mac) πατημένο για επιλογή πολλών ακινήτων.
              </p>
            </Field>
          ) : (
            <p className="mt-3 text-sm text-ink/50">Δεν υπάρχουν ακόμη ακίνητα.</p>
          )}
        </div>

        <div className="border-t border-ink/10 pt-6">
          <h2 className="font-mono text-xs uppercase tracking-wide text-clay">Ακίνητα που είδε / ενδιαφέρθηκε</h2>
          {allProperties && allProperties.length > 0 ? (
            <Field label="Ακίνητα">
              <select
                name="interested_property_ids"
                multiple
                size={6}
                defaultValue={[...interestedIds]}
                className="input"
              >
                {allProperties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs normal-case text-ink/50">
                Κρατήστε Ctrl (ή Cmd σε Mac) πατημένο για επιλογή πολλών ακινήτων.
              </p>
            </Field>
          ) : (
            <p className="mt-3 text-sm text-ink/50">Δεν υπάρχουν ακόμη ακίνητα.</p>
          )}
        </div>

        {error && <p className="text-sm text-clay">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-ink px-6 py-3 font-mono text-xs uppercase tracking-wide text-limestone hover:bg-clay disabled:opacity-50"
        >
          {saving ? "Αποθήκευση..." : "Αποθήκευση πελάτη"}
        </button>
      </form>

      <style jsx global>{`
        .input {
          width: 100%;
          border: 1px solid rgba(28, 26, 23, 0.2);
          background: #f2eee4;
          padding: 0.5rem 0.75rem;
          border-radius: 2px;
        }
      `}</style>
    </div>
  );
}
