import { createClient } from "@/lib/supabase/server";
import ClientForm from "@/components/ClientForm";
import type { Property } from "@/types/database";

export default async function NewClientPage() {
  const supabase = createClient();
  const { data: allProperties } = await supabase.from("properties").select("*").order("title");

  return (
    <div>
      <h1 className="text-3xl">Νέος πελάτης</h1>
      <ClientForm mode="create" allProperties={(allProperties ?? []) as Property[]} />
    </div>
  );
}
