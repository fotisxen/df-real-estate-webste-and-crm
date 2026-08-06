import { createClient } from "@/lib/supabase/server";
import TransactionForm from "@/components/TransactionForm";
import type { Transaction, Property, Client } from "@/types/database";
import { notFound } from "next/navigation";

export default async function EditTransactionPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const [{ data: transaction }, { data: properties }, { data: clients }] = await Promise.all([
    supabase.from("transactions").select("*").eq("id", params.id).single(),
    supabase.from("properties").select("*").order("title"),
    supabase.from("clients").select("*").order("full_name"),
  ]);

  if (!transaction) notFound();

  return (
    <div>
      <h1 className="text-3xl">Επεξεργασία συναλλαγής</h1>
      <TransactionForm
        mode="edit"
        transaction={transaction as Transaction}
        properties={(properties ?? []) as Property[]}
        clients={(clients ?? []) as Client[]}
      />
    </div>
  );
}
