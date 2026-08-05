"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { propertyImageUrl } from "@/lib/storage";
import { CATEGORIES, DETAIL_GROUPS, subcategoriesFor, type DetailFieldDef } from "@/lib/propertyFields";
import type { Property, PropertyImage, PropertyPrivateDetails } from "@/types/database";
import Image from "next/image";

function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block font-mono text-xs uppercase tracking-wide text-ink/60">
      {label}
      <div className="mt-1 normal-case tracking-normal">{children}</div>
    </label>
  );
}

function DetailInput({ field, defaultValue }: { field: DetailFieldDef; defaultValue: unknown }) {
  if (field.type === "boolean") {
    return (
      <label className="flex items-center gap-2 font-mono text-xs uppercase tracking-wide text-ink/70">
        <input type="checkbox" name={field.key} defaultChecked={defaultValue === true} />
        {field.label}
      </label>
    );
  }
  if (field.type === "select") {
    return (
      <Field label={field.label}>
        <select name={field.key} defaultValue={(defaultValue as string) ?? ""} className="input">
          <option value="">—</option>
          {field.options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </Field>
    );
  }
  return (
    <Field label={field.label + (field.unit ? ` (${field.unit})` : "")}>
      <input
        name={field.key}
        type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
        defaultValue={(defaultValue as string | number) ?? ""}
        className="input"
      />
    </Field>
  );
}

export default function PropertyForm({
  mode,
  property,
  privateDetails,
  images,
  clients,
}: {
  mode: "create" | "edit";
  property?: Property;
  privateDetails?: PropertyPrivateDetails | null;
  images?: PropertyImage[];
  clients: { id: string; full_name: string }[];
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<FileList | null>(null);
  const [category, setCategory] = useState(property?.category ?? "");
  const [existingImages, setExistingImages] = useState(images ?? []);
  const details = property?.details ?? {};

  async function handleDeleteImage(img: PropertyImage) {
    const supabase = createClient();
    await supabase.storage.from("property-images").remove([img.storage_path]);
    await supabase.from("property_images").delete().eq("id", img.id);
    setExistingImages((prev) => prev.filter((i) => i.id !== img.id));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const supabase = createClient();

    const details: Record<string, string | number | boolean> = {};
    for (const group of DETAIL_GROUPS) {
      for (const f of group.fields) {
        const raw = form.get(f.key);
        if (f.type === "boolean") {
          if (raw === "on") details[f.key] = true;
        } else if (raw !== null && raw !== "") {
          details[f.key] = f.type === "number" ? Number(raw) : String(raw);
        }
      }
    }

    const payload = {
      title: String(form.get("title") ?? "").trim(),
      description: String(form.get("description") ?? "") || null,
      category: String(form.get("category")),
      subcategory: String(form.get("subcategory") ?? "") || null,
      listing_type: String(form.get("listing_type")),
      price: Number(form.get("price")),
      price_negotiable: form.get("price_negotiable") === "on",
      common_charges_monthly: form.get("common_charges_monthly") ? Number(form.get("common_charges_monthly")) : null,
      area_sqm: form.get("area_sqm") ? Number(form.get("area_sqm")) : null,
      plot_area_sqm: form.get("plot_area_sqm") ? Number(form.get("plot_area_sqm")) : null,
      bedrooms: form.get("bedrooms") ? Number(form.get("bedrooms")) : null,
      bathrooms: form.get("bathrooms") ? Number(form.get("bathrooms")) : null,
      year_built: form.get("year_built") ? Number(form.get("year_built")) : null,
      available_from: String(form.get("available_from") ?? "") || null,
      currently_rented: form.get("currently_rented") === "on",
      code: String(form.get("code") ?? "") || null,
      region: String(form.get("region") ?? "") || null,
      address: String(form.get("address") ?? "") || null,
      municipality: String(form.get("municipality") ?? "") || null,
      neighborhood: String(form.get("neighborhood") ?? "") || null,
      sync_to_spitogatos: form.get("sync_to_spitogatos") === "on",
      details,
      ...(mode === "edit" ? { status: String(form.get("status")) } : {}),
    };

    let propertyId = property?.id;

    if (mode === "create") {
      const slug = `${slugify(payload.title)}-${Math.random().toString(36).slice(2, 7)}`;
      const { data, error: insertError } = await supabase
        .from("properties")
        .insert({ ...payload, slug } as never)
        .select()
        .single();

      if (insertError || !data) {
        setError(insertError?.message ?? "Κάτι πήγε στραβά.");
        setSaving(false);
        return;
      }
      propertyId = (data as Property).id;
    } else {
      const { error: updateError } = await supabase.from("properties").update(payload as never).eq("id", propertyId!);
      if (updateError) {
        setError(updateError.message);
        setSaving(false);
        return;
      }
    }

    const ownerClientId = String(form.get("owner_client_id") ?? "") || null;
    const internalNotes = String(form.get("internal_notes") ?? "") || null;
    await supabase
      .from("property_private_details")
      .upsert({ property_id: propertyId, owner_client_id: ownerClientId, internal_notes: internalNotes } as never);

    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const path = `${propertyId}/${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage.from("property-images").upload(path, file);
        if (!uploadError) {
          await supabase
            .from("property_images")
            .insert({ property_id: propertyId, storage_path: path, position: existingImages.length + i } as never);
        }
      }
    }

    setSaving(false);
    router.push("/admin/properties");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 max-w-3xl space-y-8">
      <div className="space-y-5">
        <Field label="Τίτλος">
          <input name="title" required defaultValue={property?.title} className="input" />
        </Field>
        <Field label="Περιγραφή">
          <textarea name="description" rows={5} defaultValue={property?.description ?? ""} className="input" />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Κατηγορία">
            <select
              name="category"
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="input"
            >
              <option value="" disabled>
                Επιλέξτε
              </option>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Υποκατηγορία">
            <select key={category} name="subcategory" defaultValue={property?.subcategory ?? ""} className="input">
              <option value="">—</option>
              {subcategoriesFor(category).map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Διαθέσιμο προς">
            <select name="listing_type" required defaultValue={property?.listing_type} className="input">
              <option value="sale">Πώληση</option>
              <option value="rent">Ενοικίαση</option>
            </select>
          </Field>
          {mode === "edit" && (
            <Field label="Κατάσταση">
              <select name="status" defaultValue={property?.status} className="input">
                <option value="available">Διαθέσιμο</option>
                <option value="reserved">Δεσμευμένο</option>
                <option value="sold">Πωλήθηκε</option>
                <option value="rented">Ενοικιάστηκε</option>
              </select>
            </Field>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Field label="Τιμή (€)">
            <input name="price" type="number" min="0" required defaultValue={property?.price} className="input" />
          </Field>
          <Field label="Μηνιαία κοινόχρηστα (€)">
            <input
              name="common_charges_monthly"
              type="number"
              min="0"
              defaultValue={property?.common_charges_monthly ?? ""}
              className="input"
            />
          </Field>
          <label className="mt-6 flex items-center gap-2 font-mono text-xs uppercase tracking-wide text-ink/70">
            <input type="checkbox" name="price_negotiable" defaultChecked={property?.price_negotiable} />
            Τιμή συζητήσιμη
          </label>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <Field label="Εμβαδόν (m²)">
            <input name="area_sqm" type="number" min="0" defaultValue={property?.area_sqm ?? ""} className="input" />
          </Field>
          <Field label="Εμβαδόν οικοπέδου (m²)">
            <input
              name="plot_area_sqm"
              type="number"
              min="0"
              defaultValue={property?.plot_area_sqm ?? ""}
              className="input"
            />
          </Field>
          <Field label="Υπνοδωμάτια">
            <input name="bedrooms" type="number" min="0" defaultValue={property?.bedrooms ?? ""} className="input" />
          </Field>
          <Field label="Μπάνια">
            <input
              name="bathrooms"
              type="number"
              min="0"
              defaultValue={property?.bathrooms ?? ""}
              className="input"
            />
          </Field>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Field label="Έτος κατασκευής">
            <input name="year_built" type="number" defaultValue={property?.year_built ?? ""} className="input" />
          </Field>
          <Field label="Διαθέσιμο από">
            <input name="available_from" type="date" defaultValue={property?.available_from ?? ""} className="input" />
          </Field>
          <label className="mt-6 flex items-center gap-2 font-mono text-xs uppercase tracking-wide text-ink/70">
            <input type="checkbox" name="currently_rented" defaultChecked={property?.currently_rented} />
            Μισθωμένο
          </label>
        </div>

        <Field label="Κωδικός ακινήτου">
          <input name="code" defaultValue={property?.code ?? ""} className="input" />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Περιοχή">
            <input name="region" defaultValue={property?.region ?? ""} className="input" placeholder="π.χ. Καλαμαριά" />
          </Field>
          <Field label="Διεύθυνση">
            <input name="address" defaultValue={property?.address ?? ""} className="input" />
          </Field>
          <Field label="Δήμος">
            <input name="municipality" defaultValue={property?.municipality ?? ""} className="input" />
          </Field>
          <Field label="Γειτονιά">
            <input name="neighborhood" defaultValue={property?.neighborhood ?? ""} className="input" />
          </Field>
        </div>
      </div>

      {DETAIL_GROUPS.map((group) => {
        const booleans = group.fields.filter((f) => f.type === "boolean");
        const others = group.fields.filter((f) => f.type !== "boolean");
        return (
          <div key={group.title} className="border-t border-ink/10 pt-6">
            <h2 className="font-mono text-xs uppercase tracking-wide text-clay">{group.title}</h2>
            {others.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3">
                {others.map((f) => (
                  <DetailInput key={f.key} field={f} defaultValue={details[f.key]} />
                ))}
              </div>
            )}
            {booleans.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3">
                {booleans.map((f) => (
                  <DetailInput key={f.key} field={f} defaultValue={details[f.key]} />
                ))}
              </div>
            )}
          </div>
        );
      })}

      <div className="border-t border-ink/10 pt-6">
        <h2 className="font-mono text-xs uppercase tracking-wide text-clay">Ιδιωτικά (μόνο για το γραφείο)</h2>
        <div className="mt-4 space-y-4">
          <Field label="Προφίλ ιδιοκτήτη">
            <select name="owner_client_id" defaultValue={privateDetails?.owner_client_id ?? ""} className="input">
              <option value="">—</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.full_name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Σημειώσεις">
            <textarea name="internal_notes" rows={3} defaultValue={privateDetails?.internal_notes ?? ""} className="input" />
          </Field>
        </div>
      </div>

      <div className="border-t border-ink/10 pt-6">
        <h2 className="font-mono text-xs uppercase tracking-wide text-clay">Φωτογραφίες</h2>
        {existingImages.length > 0 && (
          <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
            {existingImages.map((img) => (
              <div key={img.id} className="group relative aspect-square overflow-hidden rounded-sm bg-ink/10">
                <Image src={propertyImageUrl(img.storage_path)} alt="" fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => handleDeleteImage(img)}
                  className="absolute right-1 top-1 rounded-full bg-ink/80 px-2 py-0.5 font-mono text-[10px] text-limestone opacity-0 transition-opacity group-hover:opacity-100"
                >
                  Διαγραφή
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="mt-4">
          <input type="file" accept="image/*" multiple onChange={(e) => setFiles(e.target.files)} className="input" />
        </div>
      </div>

      <label className="flex items-center gap-2 font-mono text-xs uppercase tracking-wide text-ink/70">
        <input type="checkbox" name="sync_to_spitogatos" defaultChecked={property?.sync_to_spitogatos} />
        Συμπερίληψη στο feed του Spitogatos
      </label>

      {error && <p className="text-sm text-clay">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="rounded-full bg-ink px-6 py-3 font-mono text-xs uppercase tracking-wide text-limestone hover:bg-clay disabled:opacity-50"
      >
        {saving ? "Αποθήκευση..." : "Αποθήκευση ακινήτου"}
      </button>

      <style jsx global>{`
        .input {
          width: 100%;
          border: 1px solid rgba(28, 26, 23, 0.2);
          background: #f2eee4;
          padding: 0.5rem 0.75rem;
          border-radius: 2px;
        }
      `}</style>
    </form>
  );
}
