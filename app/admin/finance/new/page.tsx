import { createClient } from "@/lib/supabase/server";
import TransactionForm from "@/components/TransactionForm";
import type { Property, Client } from "@/types/database";

export default async function NewTransactionPage() {
  const supabase = createClient();
  const [{ data: properties }, { data: clients }] = await Promise.all([
    supabase.from("properties").select("*").order("title"),
    supabase.from("clients").select("*").order("full_name"),
  ]);

  return (
    <div>
      <h1 className="text-3xl">Νέα συναλλαγή</h1>
      <TransactionForm
        mode="create"
        properties={(properties ?? []) as Property[]}
        clients={(clients ?? []) as Client[]}
      />
    </div>
  );
}
