"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { categoriesFor } from "@/lib/financeFields";
import type { Transaction, Property, Client, TransactionType } from "@/types/database";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block font-mono text-xs uppercase tracking-wide text-ink/60">
      {label}
      <div className="mt-1 normal-case tracking-normal">{children}</div>
    </label>
  );
}

export default function TransactionForm({
  mode,
  transaction,
  properties,
  clients,
}: {
  mode: "create" | "edit";
  transaction?: Transaction;
  properties: Property[];
  clients: Client[];
}) {
  const router = useRouter();
  const [type, setType] = useState<TransactionType>(transaction?.type ?? "income");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const supabase = createClient();

    const payload = {
      type,
      category: String(form.get("category") ?? ""),
      amount: Number(form.get("amount") ?? 0),
      transaction_date: String(form.get("transaction_date") ?? ""),
      description: String(form.get("description") ?? "") || null,
      property_id: String(form.get("property_id") ?? "") || null,
      client_id: String(form.get("client_id") ?? "") || null,
    };

    const { error: saveError } =
      mode === "create"
        ? await supabase.from("transactions").insert(payload as never)
        : await supabase.from("transactions").update(payload as never).eq("id", transaction!.id);

    if (saveError) {
      setError(saveError.message);
      setSaving(false);
      return;
    }

    setSaving(false);
    router.push("/admin/finance");
    router.refresh();
  }

  return (
    <div className="max-w-2xl">
      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setType("income")}
            className={`rounded-sm border py-3 font-mono text-xs uppercase tracking-wide transition-colors ${
              type === "income" ? "border-aegean bg-aegean text-limestone" : "border-ink/20 text-ink/60 hover:border-ink"
            }`}
          >
            Έσοδο
          </button>
          <button
            type="button"
            onClick={() => setType("expense")}
            className={`rounded-sm border py-3 font-mono text-xs uppercase tracking-wide transition-colors ${
              type === "expense" ? "border-clay bg-clay text-limestone" : "border-ink/20 text-ink/60 hover:border-ink"
            }`}
          >
            Έξοδο
          </button>
        </div>

        <Field label="Κατηγορία">
          <select name="category" required defaultValue={transaction?.category ?? ""} className="input" key={type}>
            <option value="" disabled>
              —
            </option>
            {categoriesFor(type).map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Ποσό (€)">
            <input
              name="amount"
              type="number"
              min={0}
              step="0.01"
              required
              defaultValue={transaction?.amount ?? ""}
              className="input"
            />
          </Field>
          <Field label="Ημερομηνία">
            <input
              name="transaction_date"
              type="date"
              required
              defaultValue={transaction?.transaction_date ?? new Date().toISOString().slice(0, 10)}
              className="input"
            />
          </Field>
        </div>

        <Field label="Περιγραφή (προαιρετικό)">
          <textarea name="description" rows={3} defaultValue={transaction?.description ?? ""} className="input" />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Σχετικό ακίνητο (προαιρετικό)">
            <select name="property_id" defaultValue={transaction?.property_id ?? ""} className="input">
              <option value="">—</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Σχετικός πελάτης (προαιρετικό)">
            <select name="client_id" defaultValue={transaction?.client_id ?? ""} className="input">
              <option value="">—</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.full_name}
                </option>
              ))}
            </select>
          </Field>
        </div>

        {error && <p className="text-sm text-clay">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-ink px-6 py-3 font-mono text-xs uppercase tracking-wide text-limestone hover:bg-clay disabled:opacity-50"
        >
          {saving ? "Αποθήκευση..." : "Αποθήκευση συναλλαγής"}
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
